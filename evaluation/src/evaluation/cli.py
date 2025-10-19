"""Command-line interface for the evaluation framework."""

import asyncio
import logging
import sys
from pathlib import Path

import click
import yaml
from rich.console import Console
from rich.logging import RichHandler
from rich.panel import Panel
from rich.table import Table

from .config import EvaluationConfig, PromptCategory, PromptConfiguration
from .evaluator import AgentEvaluator
from .report import ReportGenerator

console = Console()


def setup_logging(verbose: bool = False) -> None:
    """Configure logging with rich handler."""
    level = logging.DEBUG if verbose else logging.INFO

    logging.basicConfig(
        level=level,
        format="%(message)s",
        datefmt="[%X]",
        handlers=[RichHandler(console=console, rich_tracebacks=True)],
    )


@click.group()
@click.option("--verbose", "-v", is_flag=True, help="Enable verbose logging")
def cli(verbose: bool) -> None:
    """CodeCRDT - Scientific Evaluation Framework for Collaborative Code Generation"""
    setup_logging(verbose)


@cli.command()
@click.option(
    "--config",
    "-c",
    type=click.Path(exists=True, path_type=Path),
    default="config.yaml",
    help="Path to configuration file",
)
@click.option(
    "--prompts",
    "-p",
    type=click.Path(exists=True, path_type=Path),
    default="prompts.yaml",
    help="Path to prompts configuration file",
)
@click.option(
    "--output",
    "-o",
    type=click.Path(path_type=Path),
    default="./output",
    help="Output directory for results",
)
@click.option("--runs", "-r", type=int, default=50, help="Number of runs per prompt")
@click.option("--mock", "-m", is_flag=True, help="Use mock backend for testing")
@click.option(
    "--category",
    type=click.Choice(
        ["all", "simple", "intermediate", "complex", "game", "productivity", "creative"]
    ),
    default="all",
    help="Category of prompts to evaluate",
)
@click.option("--prompt-ids", multiple=True, help="Specific prompt IDs to evaluate")
@click.option(
    "--modes",
    type=click.Choice(["both", "sequential", "parallel"]),
    default="both",
    help="Which agent modes to evaluate",
)
def evaluate(
    config: Path,
    prompts: Path,
    output: Path,
    runs: int,
    mock: bool,
    category: str,
    prompt_ids: list[str],
    modes: str,
) -> None:
    """Run evaluation experiments."""
    console.print(
        Panel.fit(
            "[bold cyan]CodeCRDT Evaluation Framework[/bold cyan]\n" "Starting evaluation suite...",
            border_style="cyan",
        )
    )

    try:
        # Load configuration
        if config.exists():
            with open(config) as f:
                config_data = yaml.safe_load(f)
        else:
            config_data = {}

        # Override with CLI arguments
        config_data["output_dir"] = output
        config_data["runs_per_prompt"] = runs

        eval_config = EvaluationConfig(**config_data)

        # Load prompts
        prompt_config = PromptConfiguration(prompts)

        # Filter prompts
        if prompt_ids:
            selected_prompts = [p for p in prompt_config.prompts if p.id in prompt_ids]
        elif category != "all":
            selected_prompts = prompt_config.get_prompts_by_category(PromptCategory(category))
        else:
            selected_prompts = prompt_config.prompts

        if not selected_prompts:
            console.print("[red]No prompts selected for evaluation![/red]")
            sys.exit(1)

        # Display evaluation plan
        _display_evaluation_plan(selected_prompts, eval_config, mock, modes)

        # Confirm before proceeding
        if not click.confirm("Proceed with evaluation?"):
            console.print("[yellow]Evaluation cancelled.[/yellow]")
            sys.exit(0)

        # Run evaluation
        evaluator = AgentEvaluator(eval_config, use_mock=mock)

        # Run evaluation with selected modes
        results = asyncio.run(evaluator.run_evaluation(selected_prompts, modes=modes))

        # Generate report
        console.print("\n[bold]Generating report...[/bold]")
        if evaluator.output_dir:
            report_gen = ReportGenerator(
                results=results, output_dir=evaluator.output_dir, config=config_data
            )

            report_path = report_gen.generate_full_report()

            console.print(
                Panel.fit(
                    f"[bold green]Evaluation Complete![/bold green]\n"
                    f"Results saved to: {evaluator.output_dir}\n"
                    f"Report: {report_path}",
                    border_style="green",
                )
            )
        else:
            console.print("[yellow]No output directory specified, results not saved.[/yellow]")

    except Exception as e:
        console.print(f"[bold red]Error:[/bold red] {e}")
        logging.exception("Evaluation failed")
        sys.exit(1)


@cli.command()
@click.argument("results_dir", type=click.Path(exists=True, path_type=Path))
def analyze(results_dir: Path) -> None:
    """Analyze existing evaluation results."""
    console.print(f"Analyzing results from: {results_dir}")

    # Load checkpoint file
    checkpoint_file = results_dir / "checkpoint.json"
    if not checkpoint_file.exists():
        console.print("[red]No checkpoint file found![/red]")
        sys.exit(1)

    import json

    with open(checkpoint_file) as f:
        data = json.load(f)

    # Convert to EvaluationResult objects
    from datetime import datetime

    from .config import AgentMode, EvaluationResult

    results = []
    for item in data:
        result = EvaluationResult(
            prompt_id=item["prompt_id"],
            prompt_name=item["prompt_name"],
            mode=AgentMode(item["mode"]),
            run_number=item["run_number"],
            timestamp=datetime.fromisoformat(item["timestamp"]),
            response_time=item["response_time"],
            total_tokens=item.get("total_tokens"),
            response_content=item.get("response_content", ""),
            error=item.get("error"),
            overall_score=item.get("overall_score"),
            code_quality_score=item.get("code_quality_score"),
            architecture_score=item.get("architecture_score"),
            performance_score=item.get("performance_score"),
            accessibility_score=item.get("accessibility_score"),
            metadata=item.get("metadata", {}),
        )
        results.append(result)

    # Generate new report
    console.print("Generating analysis report...")
    report_gen = ReportGenerator(
        results=results,
        output_dir=results_dir,
        config={"confidence_level": 0.95, "generate_visualizations": True},
    )

    report_gen.generate_full_report()
    console.print("[green]Analysis complete![/green]")


def _display_evaluation_plan(
    prompts: list, config: EvaluationConfig, mock: bool, modes: str
) -> None:
    """Display the evaluation plan."""
    table = Table(title="Evaluation Plan", show_header=True)
    table.add_column("Setting", style="cyan")
    table.add_column("Value", style="green")

    # Add configuration details
    table.add_row("Backend Mode", "Mock" if mock else "Live")
    table.add_row("Backend URL", config.backend_url)
    table.add_row("Number of Prompts", str(len(prompts)))
    table.add_row("Runs per Prompt", str(config.runs_per_prompt))

    # Display selected modes
    if modes == "both":
        mode_display = "Sequential, Parallel"
    elif modes == "sequential":
        mode_display = "Sequential only"
    else:
        mode_display = "Parallel only"
    table.add_row("Evaluation Modes", mode_display)

    num_modes = 2 if modes == "both" else 1
    total_evals = len(prompts) * config.runs_per_prompt * num_modes
    table.add_row("Total Evaluations", str(total_evals))

    estimated_time = total_evals * 10 / 60  # Assume 10 seconds per eval
    table.add_row("Estimated Time", f"~{estimated_time:.1f} minutes")

    console.print(table)

    # Display selected prompts
    prompt_table = Table(title="Selected Prompts", show_header=True)
    prompt_table.add_column("ID", style="cyan")
    prompt_table.add_column("Name", style="green")
    prompt_table.add_column("Category", style="yellow")
    prompt_table.add_column("Complexity", style="magenta")

    for prompt in prompts[:10]:  # Show first 10
        prompt_table.add_row(
            prompt.id, prompt.name, prompt.category.value, f"{prompt.complexity_score:.1f}"
        )

    if len(prompts) > 10:
        prompt_table.add_row("...", f"... and {len(prompts) - 10} more", "...", "...")

    console.print(prompt_table)


def main() -> None:
    """Main entry point."""
    cli()


if __name__ == "__main__":
    main()
