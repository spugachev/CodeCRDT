"""Core evaluation engine for running experiments."""

from __future__ import annotations

import asyncio
import json
import logging
import platform
import random
import sys
from collections.abc import Coroutine
from datetime import datetime
from pathlib import Path
from typing import Any

from rich.console import Console
from rich.progress import BarColumn, Progress, SpinnerColumn, TextColumn, TimeRemainingColumn

from .client import BackendClient, MockBackendClient
from .config import AgentMode, EvaluationConfig, EvaluationPrompt, EvaluationResult

logger = logging.getLogger(__name__)
console = Console()

# Set random seed for reproducibility
random.seed(42)


class AgentEvaluator:
    """Main evaluator for running agent experiments."""

    def __init__(self, config: EvaluationConfig, use_mock: bool = False):
        """Initialize the evaluator."""
        self.config = config
        self.use_mock = use_mock
        self.results: list[EvaluationResult] = []
        self.output_dir: Path | None = None

    def _setup_output_directory(self) -> Path:
        """Create timestamped output directory."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = self.config.output_dir / f"evaluation_{timestamp}"
        output_dir.mkdir(parents=True, exist_ok=True)

        # Create subdirectories
        (output_dir / "results").mkdir(exist_ok=True)
        (output_dir / "visualizations").mkdir(exist_ok=True)

        # Save environment information
        self._save_environment_info(output_dir)

        self.output_dir = output_dir
        return output_dir

    def _save_environment_info(self, output_dir: Path) -> None:
        """Save environment and system information for reproducibility."""
        env_info = {
            "timestamp": datetime.now().isoformat(),
            "system": {
                "platform": platform.system(),
                "platform_release": platform.release(),
                "platform_version": platform.version(),
                "architecture": platform.machine(),
                "processor": platform.processor(),
                "python_version": sys.version,
                "python_implementation": platform.python_implementation(),
            },
            "configuration": {
                "backend_url": self.config.backend_url,
                "runs_per_prompt": self.config.runs_per_prompt,
                "max_concurrent_requests": self.config.max_concurrent_requests,
                "confidence_level": self.config.confidence_level,
                "outlier_detection": self.config.outlier_detection,
                "random_seed": 42,
            },
            "notes": {
                "temperature": "0.0 for reproducibility",
                "randomization": "Execution order randomized to prevent order effects",
                "statistical_corrections": "Bonferroni correction applied for multiple comparisons",
            },
        }

        env_file = output_dir / "environment_info.json"
        with open(env_file, "w") as f:
            json.dump(env_info, f, indent=2)

    async def _run_single_evaluation(
        self, client: BackendClient, prompt: EvaluationPrompt, mode: AgentMode, run_number: int
    ) -> EvaluationResult:
        """Run a single evaluation."""
        start_time = datetime.now()

        try:
            # Create document
            doc_id = await client.create_document()

            # Send prompt
            response = await client.send_prompt(
                document_id=doc_id, prompt=prompt.prompt, mode=mode.value
            )

            # Evaluate generated code if successful
            evaluation_scores = {}
            if response.get("content") and not response.get("error") and response.get("success"):
                eval_result = await client.evaluate_code(response["content"])

                if eval_result.get("success"):
                    evaluation_scores = {
                        "overall_score": eval_result.get("overall_score"),
                        "code_quality_score": eval_result.get("code_quality"),
                        "architecture_score": eval_result.get("architecture"),
                        "performance_score": eval_result.get("performance"),
                        "accessibility_score": eval_result.get("accessibility"),
                    }

            result = EvaluationResult(
                prompt_id=prompt.id,
                prompt_name=prompt.name,
                mode=mode,
                run_number=run_number,
                timestamp=start_time,
                response_time=response.get("elapsed_time", 0),
                response_content=response.get("content", ""),
                error=response.get("error"),
                **evaluation_scores,
                metadata={
                    "document_id": doc_id,
                    "prompt_category": prompt.category.value,
                    "prompt_complexity": prompt.complexity_score,
                },
            )

            # Save result with raw response if configured
            if (
                self.config.save_raw_responses or self.config.save_evaluation_scores
            ) and self.output_dir:
                await self._save_result(result, response)

            return result

        except Exception as e:
            logger.error(f"Evaluation failed: {e}")
            return EvaluationResult(
                prompt_id=prompt.id,
                prompt_name=prompt.name,
                mode=mode,
                run_number=run_number,
                timestamp=start_time,
                response_time=0,
                error=str(e),
            )

    async def _save_result(
        self, result: EvaluationResult, response: dict[str, Any] | None = None
    ) -> None:
        """Save evaluation result with optional raw response to a single file."""
        if not self.output_dir:
            return

        filename = f"{result.prompt_id}_{result.mode.value}_run{result.run_number:03d}.json"
        filepath = self.output_dir / "results" / filename

        # Combine result data with raw response if available
        data = result.to_dict()
        if response and self.config.save_raw_responses:
            data["raw_response"] = response

        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)

    async def evaluate_prompt(
        self, prompt: EvaluationPrompt, mode: AgentMode, runs: int
    ) -> list[EvaluationResult]:
        """Evaluate a single prompt multiple times."""
        results = []

        # Create client
        ClientClass = MockBackendClient if self.use_mock else BackendClient
        async with ClientClass(
            base_url=self.config.backend_url,
            timeout=self.config.request_timeout,
            max_concurrent=self.config.max_concurrent_requests,
        ) as client:
            # Run evaluations with progress bar
            tasks = []
            for run_num in range(1, runs + 1):
                task = self._run_single_evaluation(
                    client=client, prompt=prompt, mode=mode, run_number=run_num
                )
                tasks.append(task)

            # Execute with concurrency limit
            semaphore = asyncio.Semaphore(self.config.max_concurrent_requests)

            async def run_with_semaphore(
                coro: Coroutine[Any, Any, EvaluationResult],
            ) -> EvaluationResult:
                async with semaphore:
                    return await coro

            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
                TimeRemainingColumn(),
                console=console,
            ) as progress:
                task_id = progress.add_task(
                    f"[cyan]Evaluating {prompt.name} ({mode.value})", total=runs
                )

                for coro in asyncio.as_completed([run_with_semaphore(t) for t in tasks]):
                    result = await coro
                    results.append(result)
                    progress.update(task_id, advance=1)

                    # Save intermediate result
                    if self.config.save_evaluation_scores and self.output_dir:
                        await self._save_result(result)

        return results

    async def run_evaluation(
        self, prompts: list[EvaluationPrompt], modes: str = "both"
    ) -> list[EvaluationResult]:
        """Run complete evaluation suite with randomized execution order."""
        self._setup_output_directory()

        console.print("[bold green]Starting evaluation suite[/bold green]")
        console.print(f"Output directory: {self.output_dir}")
        console.print(f"Prompts to evaluate: {len(prompts)}")
        console.print(f"Runs per prompt: {self.config.runs_per_prompt}")

        # Determine which modes to run
        run_sequential = modes in ["both", "sequential"]
        run_parallel = modes in ["both", "parallel"]

        mode_names = []
        if run_sequential:
            mode_names.append("Sequential")
        if run_parallel:
            mode_names.append("Parallel")
        console.print(f"Modes: {', '.join(mode_names)}")

        # Create task list with all prompt-mode-run combinations
        evaluation_tasks = []
        for prompt in prompts:
            if run_sequential:
                for run_num in range(1, self.config.runs_per_prompt + 1):
                    evaluation_tasks.append((prompt, AgentMode.SEQUENTIAL, run_num))
            if run_parallel:
                for run_num in range(1, self.config.runs_per_prompt + 1):
                    evaluation_tasks.append((prompt, AgentMode.PARALLEL, run_num))

        # Randomize execution order to prevent order effects
        random.shuffle(evaluation_tasks)

        console.print(f"Total evaluations: {len(evaluation_tasks)} (randomized order)")
        console.print(f"Random seed: 42 (for reproducibility)")
        console.print()

        all_results = []

        # Create client once for all evaluations
        ClientClass = MockBackendClient if self.use_mock else BackendClient
        async with ClientClass(
            base_url=self.config.backend_url,
            timeout=self.config.request_timeout,
            max_concurrent=self.config.max_concurrent_requests,
        ) as client:
            # Run evaluations with progress bar
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
                TimeRemainingColumn(),
                console=console,
            ) as progress:
                task_id = progress.add_task(
                    "[cyan]Running evaluations", total=len(evaluation_tasks)
                )

                for prompt, mode, run_num in evaluation_tasks:
                    result = await self._run_single_evaluation(
                        client=client, prompt=prompt, mode=mode, run_number=run_num
                    )
                    all_results.append(result)
                    self.results.append(result)
                    progress.update(task_id, advance=1)

                    # Save checkpoint every 10 evaluations
                    if len(all_results) % 10 == 0:
                        await self._save_checkpoint()

        # Final checkpoint
        await self._save_checkpoint()

        console.print("\n[bold green]Evaluation complete![/bold green]")
        console.print(f"Total evaluations: {len(all_results)}")
        console.print(f"Successful: {sum(1 for r in all_results if r.success)}")
        console.print(f"Failed: {sum(1 for r in all_results if not r.success)}")

        return all_results

    async def _save_checkpoint(self) -> None:
        """Save intermediate checkpoint of results."""
        if not self.output_dir:
            return

        checkpoint_file = self.output_dir / "checkpoint.json"
        data = [r.to_dict() for r in self.results]

        with open(checkpoint_file, "w") as f:
            json.dump(data, f, indent=2)
