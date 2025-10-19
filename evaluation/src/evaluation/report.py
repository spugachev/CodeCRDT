"""Report generation and visualization for evaluation results."""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import yaml
from matplotlib.backends.backend_pdf import PdfPages
from rich.console import Console
from rich.table import Table

from .config import EvaluationResult
from .metrics import MetricsCollector

logger = logging.getLogger(__name__)
console = Console()

# Set style for scientific plots
plt.style.use("seaborn-v0_8-paper")
sns.set_palette("husl")


class ReportGenerator:
    """Generate comprehensive evaluation reports."""

    def __init__(self, results: list[EvaluationResult], output_dir: Path, config: dict[str, Any]):
        """Initialize the report generator."""
        self.results = results
        self.output_dir = output_dir
        self.config = config
        self.metrics = MetricsCollector(
            results,
            confidence_level=config.get("confidence_level", 0.95),
            remove_outliers=config.get("remove_outliers", False)
        )

        # Ensure visualization directory exists
        self.viz_dir = output_dir / "visualizations"
        self.viz_dir.mkdir(exist_ok=True)

    def generate_full_report(self) -> Path:
        """Generate complete evaluation report."""
        console.print("[bold]Generating evaluation report...[/bold]")

        # Generate YAML report
        yaml_report = self._generate_yaml_report()
        yaml_path = self.output_dir / "evaluation_report.yaml"
        with open(yaml_path, "w") as f:
            yaml.dump(yaml_report, f, default_flow_style=False, sort_keys=False)

        # Generate JSON report
        json_report = self._generate_json_report()
        json_path = self.output_dir / "evaluation_report.json"
        with open(json_path, "w") as f:
            json.dump(json_report, f, indent=2)

        # Generate visualizations
        if self.config.get("generate_visualizations", True):
            self._generate_visualizations()

        # Generate PDF report
        pdf_path = self._generate_pdf_report()

        # Generate markdown summary
        md_path = self._generate_markdown_summary()

        # Print summary to console
        self._print_console_summary()

        console.print("[green]Report generated successfully![/green]")
        console.print(f"  YAML: {yaml_path}")
        console.print(f"  JSON: {json_path}")
        console.print(f"  PDF: {pdf_path}")
        console.print(f"  Markdown: {md_path}")

        return yaml_path

    def _generate_yaml_report(self) -> dict[str, Any]:
        """Generate YAML format report for arXiv publication."""
        stats = self.metrics.get_overall_statistics()

        report = {
            "metadata": {
                "title": "CRDT Agentic Synchronization Evaluation Results",
                "timestamp": datetime.now().isoformat(),
                "version": "1.0.0",
                "total_evaluations": len(self.results),
                "configuration": {
                    "runs_per_prompt": self.config.get("runs_per_prompt"),
                    "confidence_level": self.config.get("confidence_level", 0.95),
                    "backend_url": self.config.get("backend_url"),
                    "outlier_removal": "response_time only",
                },
                "notes": {
                    "outlier_removal": "Outliers removed from response_time using IQR method (Q1-1.5*IQR to Q3+1.5*IQR). All score data retained without outlier filtering.",
                    "precision": "Standard deviation reported to 2 decimal places to capture small variances",
                    "rationale": "Response time outliers filtered to reduce impact of network/system anomalies on performance metrics",
                },
            },
            "summary": {
                "overall_success_rate": f"{stats['overall_success_rate']:.2%}",
                "overall_error_rate": f"{stats['overall_error_rate']:.2%}",
                "unique_prompts_evaluated": stats["unique_prompts"],
            },
            "mode_comparison": self._format_mode_comparison(stats["mode_comparison"]),
            "sequential_performance": self._format_mode_stats(stats["sequential_stats"]),
            "parallel_performance": self._format_mode_stats(stats["parallel_stats"]),
            "prompt_results": self._format_prompt_results(),
            "statistical_significance": self._format_statistical_tests(),
        }

        return report

    def _convert_to_serializable(self, obj: Any) -> Any:
        """Recursively convert dataclasses and other non-serializable objects to dicts."""
        if hasattr(obj, "__dict__"):
            # Convert dataclass or object with __dict__ to dict
            return {k: self._convert_to_serializable(v) for k, v in obj.__dict__.items()}
        elif isinstance(obj, dict):
            # Recursively convert dict values
            return {k: self._convert_to_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, (list, tuple)):
            # Recursively convert list/tuple elements
            return [self._convert_to_serializable(item) for item in obj]
        else:
            # Return as-is for primitive types
            return obj

    def _generate_json_report(self) -> dict[str, Any]:
        """Generate detailed JSON report."""
        prompt_results = {}
        for prompt_id in self.metrics.df["prompt_id"].unique():
            perf = self.metrics.get_prompt_performance(prompt_id)
            # Convert all non-serializable objects
            prompt_results[prompt_id] = self._convert_to_serializable(perf)

        overall_stats = self.metrics.get_overall_statistics()
        # Convert all non-serializable objects
        overall_stats = self._convert_to_serializable(overall_stats)

        return {
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "total_evaluations": len(self.results),
            },
            "overall_statistics": overall_stats,
            "prompt_results": prompt_results,
            "anomalies": [r.to_dict() for r in self.metrics.detect_anomalies()],
        }

    def _format_mode_comparison(self, comparisons: dict) -> dict[str, Any]:
        """Format mode comparison results."""
        formatted = {}
        for metric, comparison in comparisons.items():
            formatted[metric] = {
                "sequential_mean": f"{comparison.group1_mean:.2f}",
                "parallel_mean": f"{comparison.group2_mean:.2f}",
                "difference": f"{comparison.mean_difference:.2f}",
                "relative_improvement": f"{comparison.relative_improvement:.1f}%",
                "p_value": f"{comparison.p_value:.4f}",
                "effect_size": f"{comparison.effect_size:.3f}",
                "statistically_significant": comparison.is_significant,
                "test_used": comparison.test_used,
            }
        return formatted

    def _format_mode_stats(self, stats: dict) -> dict[str, Any]:
        """Format mode-specific statistics."""
        return {
            "total_runs": stats["count"],
            "success_rate": f"{stats['success_rate']:.2%}",
            "average_response_time": f"{stats['avg_response_time']:.2f}s",
            "average_scores": {
                "overall": f"{stats['avg_overall_score']:.1f}",
                "code_quality": f"{stats['avg_code_quality']:.1f}",
                "architecture": f"{stats['avg_architecture']:.1f}",
                "performance": f"{stats['avg_performance']:.1f}",
                "accessibility": f"{stats['avg_accessibility']:.1f}",
            },
        }

    def _format_prompt_results(self) -> dict[str, Any]:
        """Format individual prompt results."""
        results = {}
        for prompt_id in self.metrics.df["prompt_id"].unique():
            prompt_name = self.metrics.df[self.metrics.df["prompt_id"] == prompt_id][
                "prompt_name"
            ].iloc[0]
            perf = self.metrics.get_prompt_performance(prompt_id)

            results[prompt_id] = {
                "name": prompt_name,
                "sequential": self._format_summary(perf.get("sequential", {})),
                "parallel": self._format_summary(perf.get("parallel", {})),
            }
        return results

    def _format_summary(self, mode_data: dict) -> dict[str, Any]:
        """Format statistical summary for a mode."""
        if not mode_data:
            return {}

        return {
            "success_rate": f"{mode_data.get('success_rate', 0):.2%}",
            "response_time": {
                "mean": (
                    f"{mode_data['response_time'].mean:.2f}s"
                    if "response_time" in mode_data
                    else "N/A"
                ),
                "std": (
                    f"{mode_data['response_time'].std:.2f}s"
                    if "response_time" in mode_data
                    else "N/A"
                ),
            },
            "overall_score": {
                "mean": (
                    f"{mode_data['overall_score'].mean:.2f}"
                    if "overall_score" in mode_data
                    else "N/A"
                ),
                "std": (
                    f"{mode_data['overall_score'].std:.2f}"
                    if "overall_score" in mode_data
                    else "N/A"
                ),
            },
        }

    def _format_statistical_tests(self) -> dict[str, Any]:
        """Format statistical test results with power analysis and multiple comparison correction."""
        tests = {}

        # Calculate Bonferroni-corrected alpha
        bonferroni_alpha = self.metrics.alpha / self.metrics.num_comparisons

        tests["multiple_comparison_correction"] = {
            "method": "Bonferroni",
            "num_comparisons": self.metrics.num_comparisons,
            "original_alpha": self.metrics.alpha,
            "corrected_alpha": bonferroni_alpha,
        }

        # Overall comparison
        overall_comp = self.metrics.compare_modes("overall_score")
        overall_power = self.metrics.calculate_statistical_power("overall_score")
        tests["overall_score"] = {
            "test": overall_comp.test_used,
            "p_value": overall_comp.p_value,
            "significant": overall_comp.is_significant,
            "effect_size": overall_comp.effect_size,
            "interpretation": self._interpret_effect_size(overall_comp.effect_size),
            "statistical_power": overall_power if not np.isnan(overall_power) else "insufficient_data",
        }

        # Response time comparison
        time_comp = self.metrics.compare_modes("response_time")
        time_power = self.metrics.calculate_statistical_power("response_time")
        tests["response_time"] = {
            "test": time_comp.test_used,
            "p_value": time_comp.p_value,
            "significant": time_comp.is_significant,
            "effect_size": time_comp.effect_size,
            "interpretation": self._interpret_effect_size(time_comp.effect_size),
            "statistical_power": time_power if not np.isnan(time_power) else "insufficient_data",
        }

        return tests

    def _interpret_effect_size(self, d: float) -> str:
        """Interpret Cohen's d effect size."""
        abs_d = abs(d)
        if abs_d < 0.2:
            return "negligible"
        elif abs_d < 0.5:
            return "small"
        elif abs_d < 0.8:
            return "medium"
        else:
            return "large"

    def _get_filtered_df(self):
        """Get DataFrame with response_time outliers removed.

        Returns:
            DataFrame with response_time outliers filtered out using IQR method
        """
        import pandas as pd

        df = self.metrics.df.copy()

        # Filter outliers separately for each mode
        for mode in ["sequential", "parallel"]:
            mode_mask = df["mode"] == mode
            mode_data = df.loc[mode_mask, "response_time"].dropna()

            if len(mode_data) >= 4:
                q1, q3 = mode_data.quantile([0.25, 0.75])
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr

                # Mark outliers in the original dataframe
                outlier_mask = mode_mask & (
                    (df["response_time"] < lower_bound) | (df["response_time"] > upper_bound)
                )

                # Remove outliers
                df = df[~outlier_mask]

        return df

    def _generate_visualizations(self) -> None:
        """Generate all visualization plots."""
        console.print("  Generating visualizations...")

        # 1. Score distributions
        self._plot_score_distributions()

        # 2. Response time comparison
        self._plot_response_times()

        # 3. Success rates
        self._plot_success_rates()

        # 4. Prompt-wise performance
        self._plot_prompt_performance()

        # 5. Correlation matrix
        self._plot_correlation_matrix()

        # 6. Box plots for all metrics
        self._plot_metric_boxplots()

    def _plot_score_distributions(self) -> None:
        """Plot score distributions for sequential vs parallel."""
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        fig.suptitle("Score Distributions: Sequential vs Parallel (Response Time Outliers Removed)", fontsize=16)

        metrics = [
            ("overall_score", "Overall Score"),
            ("code_quality_score", "Code Quality"),
            ("architecture_score", "Architecture"),
            ("performance_score", "Performance"),
            ("accessibility_score", "Accessibility"),
            ("response_time", "Response Time (s)"),
        ]

        for idx, (metric, title) in enumerate(metrics):
            ax = axes[idx // 3, idx % 3]

            # Use filtered dataframe for response_time
            if metric == "response_time":
                df = self._get_filtered_df()
            else:
                df = self.metrics.df

            seq_data = df[df["mode"] == "sequential"][metric].dropna()
            par_data = df[df["mode"] == "parallel"][metric].dropna()

            ax.hist(seq_data, alpha=0.5, label="Sequential", bins=20, density=True)
            ax.hist(par_data, alpha=0.5, label="Parallel", bins=20, density=True)
            ax.set_xlabel(title)
            ax.set_ylabel("Density")
            ax.legend()
            ax.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(self.viz_dir / "score_distributions.png", dpi=300, bbox_inches="tight")
        plt.close()

    def _plot_response_times(self) -> None:
        """Plot response time comparison (with outliers removed)."""
        # Use filtered dataframe
        df_filtered = self._get_filtered_df()

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

        # Box plot with outliers removed
        df_filtered.boxplot(column="response_time", by="mode", ax=ax1)
        ax1.set_title("Response Time Distribution by Mode\n(Outliers Removed via IQR Method)")
        ax1.set_xlabel("Mode")
        ax1.set_ylabel("Response Time (seconds)")
        plt.sca(ax1)
        plt.xticks(rotation=0)

        # Time series plot with outliers removed
        for mode in ["sequential", "parallel"]:
            mode_data = df_filtered[df_filtered["mode"] == mode]
            ax2.plot(
                range(len(mode_data)),
                mode_data["response_time"].values,
                label=mode.capitalize(),
                alpha=0.7,
                marker="o",
                markersize=3,
            )

        ax2.set_title("Response Time Over Evaluation Runs\n(Outliers Removed)")
        ax2.set_xlabel("Evaluation Number (After Outlier Removal)")
        ax2.set_ylabel("Response Time (seconds)")
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(self.viz_dir / "response_times.png", dpi=300, bbox_inches="tight")
        plt.close()

    def _plot_success_rates(self) -> None:
        """Plot success rates by prompt and mode."""
        success_data = self.metrics.df.groupby(["prompt_name", "mode"])["success"].mean().unstack()

        fig, ax = plt.subplots(figsize=(12, 6))
        success_data.plot(kind="bar", ax=ax)
        ax.set_title("Success Rates by Prompt and Mode")
        ax.set_xlabel("Prompt")
        ax.set_ylabel("Success Rate")
        ax.legend(title="Mode")
        plt.xticks(rotation=45, ha="right")
        ax.grid(True, alpha=0.3, axis="y")

        plt.tight_layout()
        plt.savefig(self.viz_dir / "success_rates.png", dpi=300, bbox_inches="tight")
        plt.close()

    def _plot_prompt_performance(self) -> None:
        """Plot performance metrics for each prompt."""
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle("Performance Metrics by Prompt", fontsize=16)

        metrics = [
            ("overall_score", "Overall Score"),
            ("code_quality_score", "Code Quality Score"),
            ("architecture_score", "Architecture Score"),
            ("performance_score", "Performance Score"),
        ]

        for idx, (metric, title) in enumerate(metrics):
            ax = axes[idx // 2, idx % 2]

            pivot_data = self.metrics.df.pivot_table(
                values=metric, index="prompt_name", columns="mode", aggfunc="mean"
            )

            pivot_data.plot(kind="barh", ax=ax)
            ax.set_title(title)
            ax.set_xlabel("Score")
            ax.legend(title="Mode")
            ax.grid(True, alpha=0.3, axis="x")

        plt.tight_layout()
        plt.savefig(self.viz_dir / "prompt_performance.png", dpi=300, bbox_inches="tight")
        plt.close()

    def _plot_correlation_matrix(self) -> None:
        """Plot correlation matrix of metrics."""
        metrics = [
            "response_time",
            "overall_score",
            "code_quality_score",
            "architecture_score",
            "performance_score",
            "accessibility_score",
        ]

        corr_data = self.metrics.df[metrics].corr()

        fig, ax = plt.subplots(figsize=(10, 8))
        sns.heatmap(corr_data, annot=True, fmt=".2f", cmap="coolwarm", center=0, square=True, ax=ax)
        ax.set_title("Correlation Matrix of Evaluation Metrics")

        plt.tight_layout()
        plt.savefig(self.viz_dir / "correlation_matrix.png", dpi=300, bbox_inches="tight")
        plt.close()

    def _plot_metric_boxplots(self) -> None:
        """Create box plots for all metrics."""
        fig, axes = plt.subplots(3, 2, figsize=(12, 14))
        fig.suptitle("Metric Distributions: Sequential vs Parallel\n(Response Time Outliers Removed)", fontsize=16)

        metrics = [
            ("overall_score", "Overall Score"),
            ("code_quality_score", "Code Quality Score"),
            ("architecture_score", "Architecture Score"),
            ("performance_score", "Performance Score"),
            ("accessibility_score", "Accessibility Score"),
            ("response_time", "Response Time (s) - Outliers Removed"),
        ]

        for idx, (metric, title) in enumerate(metrics):
            ax = axes[idx // 2, idx % 2]

            # Use filtered dataframe for response_time
            if metric == "response_time":
                df = self._get_filtered_df()
            else:
                df = self.metrics.df

            data_to_plot = [
                df[df["mode"] == "sequential"][metric].dropna(),
                df[df["mode"] == "parallel"][metric].dropna(),
            ]

            bp = ax.boxplot(data_to_plot, labels=["Sequential", "Parallel"], patch_artist=True)

            # Color the boxes
            colors = ["lightblue", "lightgreen"]
            for patch, color in zip(bp["boxes"], colors, strict=False):
                patch.set_facecolor(color)

            ax.set_title(title)
            ax.set_ylabel("Value")
            ax.grid(True, alpha=0.3, axis="y")

        plt.tight_layout()
        plt.savefig(self.viz_dir / "metric_boxplots.png", dpi=300, bbox_inches="tight")
        plt.close()

    def _generate_pdf_report(self) -> Path:
        """Generate comprehensive PDF report."""
        pdf_path = self.output_dir / "evaluation_report.pdf"

        with PdfPages(pdf_path) as pdf:
            # Title page
            fig = plt.figure(figsize=(8.5, 11))
            fig.text(0.5, 0.7, "CRDT Agentic Synchronization", ha="center", size=24, weight="bold")
            fig.text(0.5, 0.6, "Evaluation Report", ha="center", size=20)
            fig.text(
                0.5,
                0.5,
                f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}',
                ha="center",
                size=12,
            )
            fig.text(0.5, 0.3, f"Total Evaluations: {len(self.results)}", ha="center", size=14)
            plt.axis("off")
            pdf.savefig(fig, bbox_inches="tight")
            plt.close()

            # Add visualization pages
            for img_file in sorted(self.viz_dir.glob("*.png")):
                fig = plt.figure(figsize=(11, 8.5))
                img = plt.imread(img_file)
                plt.imshow(img)
                plt.axis("off")
                pdf.savefig(fig, bbox_inches="tight")
                plt.close()

            # Metadata
            d = pdf.infodict()
            d["Title"] = "CRDT Agentic Synchronization Evaluation Report"
            d["Author"] = "Evaluation Framework"
            d["Subject"] = "Performance evaluation of collaborative agents"
            d["Keywords"] = "CRDT, agents, synchronization, evaluation"
            d["CreationDate"] = datetime.now()

        return pdf_path

    def _generate_markdown_summary(self) -> Path:
        """Generate markdown summary for documentation."""
        md_path = self.output_dir / "README.md"
        stats = self.metrics.get_overall_statistics()

        content = f"""# CRDT Agentic Synchronization Evaluation Results

## Summary

- **Date**: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
- **Total Evaluations**: {len(self.results)}
- **Unique Prompts**: {stats['unique_prompts']}
- **Overall Success Rate**: {stats['overall_success_rate']:.2%}

## Mode Comparison

### Sequential Mode
- **Average Response Time**: {stats['sequential_stats']['avg_response_time']:.2f}s
- **Average Overall Score**: {stats['sequential_stats']['avg_overall_score']:.1f}
- **Success Rate**: {stats['sequential_stats']['success_rate']:.2%}

### Parallel Mode
- **Average Response Time**: {stats['parallel_stats']['avg_response_time']:.2f}s
- **Average Overall Score**: {stats['parallel_stats']['avg_overall_score']:.1f}
- **Success Rate**: {stats['parallel_stats']['success_rate']:.2%}

## Statistical Significance

"""
        # Add comparison results
        for metric_name, comparison in stats["mode_comparison"].items():
            content += f"""### {metric_name.replace('_', ' ').title()}
- **Sequential Mean**: {comparison.group1_mean:.2f}
- **Parallel Mean**: {comparison.group2_mean:.2f}
- **Relative Improvement**: {comparison.relative_improvement:.1f}%
- **P-value**: {comparison.p_value:.4f}
- **Statistically Significant**: {'Yes' if comparison.is_significant else 'No'}
- **Effect Size (Cohen\'s d)**: {comparison.effect_size:.3f}

"""

        content += """## Files Generated

- `evaluation_report.yaml` - Main report for scientific publication
- `evaluation_report.json` - Detailed results in JSON format
- `evaluation_report.pdf` - Comprehensive PDF report with visualizations
- `visualizations/` - Directory containing all plots and figures

## Citation

If you use these results in your research, please cite:

```bibtex
@article{crdt-agents-2025,
  title={Evaluation of CRDT-based Collaborative Agent Synchronization},
  author={Sergey Pugachev},
  year={2025},
  journal={arXiv preprint}
}
```
"""
        with open(md_path, "w") as f:
            f.write(content)

        return md_path

    def _print_console_summary(self) -> None:
        """Print summary to console using rich tables."""
        stats = self.metrics.get_overall_statistics()

        # Create summary table
        table = Table(title="Evaluation Summary", show_header=True)
        table.add_column("Metric", style="cyan")
        table.add_column("Sequential", style="green")
        table.add_column("Parallel", style="blue")
        table.add_column("Difference", style="yellow")

        # Add rows
        metrics = [
            (
                "Success Rate",
                f"{stats['sequential_stats']['success_rate']:.2%}",
                f"{stats['parallel_stats']['success_rate']:.2%}",
            ),
            (
                "Avg Response Time",
                f"{stats['sequential_stats']['avg_response_time']:.2f}s",
                f"{stats['parallel_stats']['avg_response_time']:.2f}s",
            ),
            (
                "Avg Overall Score",
                f"{stats['sequential_stats']['avg_overall_score']:.1f}",
                f"{stats['parallel_stats']['avg_overall_score']:.1f}",
            ),
        ]

        for metric_name, seq_val, par_val in metrics:
            # Calculate difference
            try:
                seq_num = float(seq_val.rstrip("%s"))
                par_num = float(par_val.rstrip("%s"))
                diff = par_num - seq_num
                diff_str = f"{diff:+.2f}"
            except:
                diff_str = "N/A"

            table.add_row(metric_name, seq_val, par_val, diff_str)

        console.print(table)
