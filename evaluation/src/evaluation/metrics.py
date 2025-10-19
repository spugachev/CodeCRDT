"""Statistical metrics and analysis for evaluation results."""

import logging
from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from scipy import stats
from scipy.stats import mannwhitneyu, ttest_ind

from .config import EvaluationResult

logger = logging.getLogger(__name__)


@dataclass
class StatisticalSummary:
    """Statistical summary for a metric."""

    mean: float
    median: float
    std: float
    min: float
    max: float
    q1: float  # 25th percentile
    q3: float  # 75th percentile
    iqr: float  # Interquartile range
    ci_lower: float  # Confidence interval lower bound
    ci_upper: float  # Confidence interval upper bound
    outliers: list[float]
    n_samples: int
    success_rate: float


@dataclass
class ComparisonResult:
    """Result of statistical comparison between two groups."""

    metric_name: str
    group1_name: str
    group2_name: str
    group1_mean: float
    group2_mean: float
    mean_difference: float
    relative_improvement: float  # Percentage
    p_value: float
    statistic: float
    effect_size: float  # Cohen's d
    is_significant: bool
    test_used: str


class MetricsCollector:
    """Collect and analyze metrics from evaluation results."""

    def __init__(self, results: list[EvaluationResult], confidence_level: float = 0.95, remove_outliers: bool = False):
        """Initialize metrics collector.

        Args:
            results: List of evaluation results
            confidence_level: Confidence level for statistical tests (default: 0.95)
            remove_outliers: Whether to remove outliers from calculations (default: False)
                            Note: Outlier removal can mask variance and reduce statistical power
        """
        self.results = results
        self.confidence_level = confidence_level
        self.alpha = 1 - confidence_level
        self.remove_outliers = remove_outliers
        # Number of metrics compared - used for Bonferroni correction
        self.num_comparisons = 6  # response_time, overall_score, code_quality, architecture, performance, accessibility

        # Convert to DataFrame for easier analysis
        self.df = self._results_to_dataframe()

    def _results_to_dataframe(self) -> pd.DataFrame:
        """Convert evaluation results to pandas DataFrame."""
        data = []
        for result in self.results:
            data.append(
                {
                    "prompt_id": result.prompt_id,
                    "prompt_name": result.prompt_name,
                    "mode": result.mode.value,
                    "run_number": result.run_number,
                    "response_time": result.response_time,
                    "overall_score": result.overall_score,
                    "code_quality_score": result.code_quality_score,
                    "architecture_score": result.architecture_score,
                    "performance_score": result.performance_score,
                    "accessibility_score": result.accessibility_score,
                    "success": result.success,
                    "has_error": result.error is not None,
                }
            )
        return pd.DataFrame(data)

    def _remove_outliers_iqr(self, values: np.ndarray) -> np.ndarray:
        """Remove outliers using the IQR (Interquartile Range) method.

        Args:
            values: Array of values to filter

        Returns:
            Array with outliers removed
        """
        if len(values) < 4:
            # Need at least 4 values to calculate quartiles meaningfully
            return values

        q1, q3 = np.percentile(values, [25, 75])
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        # Filter values within bounds
        filtered = values[(values >= lower_bound) & (values <= upper_bound)]

        # Return original if filtering removed everything
        return filtered if len(filtered) > 0 else values

    def calculate_summary(
        self, values: np.ndarray, remove_outliers: bool = True
    ) -> StatisticalSummary:
        """Calculate statistical summary for a set of values."""
        # Convert to float array and handle None/NaN values
        try:
            # Convert to float, replacing None with NaN
            float_values = np.array(values, dtype=np.float64)
            # Remove NaN values
            clean_values = float_values[~np.isnan(float_values)]
        except (ValueError, TypeError):
            # If conversion fails, return empty summary
            clean_values = np.array([])

        if len(clean_values) == 0:
            return StatisticalSummary(
                mean=0,
                median=0,
                std=0,
                min=0,
                max=0,
                q1=0,
                q3=0,
                iqr=0,
                ci_lower=0,
                ci_upper=0,
                outliers=[],
                n_samples=0,
                success_rate=0,
            )

        # Calculate quartiles
        q1, median, q3 = np.percentile(clean_values, [25, 50, 75])
        iqr = q3 - q1

        # Detect outliers using IQR method
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        outliers = clean_values[(clean_values < lower_bound) | (clean_values > upper_bound)]

        # Remove outliers if requested
        if remove_outliers and len(outliers) > 0:
            filtered_values = clean_values[
                (clean_values >= lower_bound) & (clean_values <= upper_bound)
            ]
        else:
            filtered_values = clean_values

        # Calculate statistics
        mean = np.mean(filtered_values)

        # Handle single sample case
        if len(filtered_values) == 1:
            std = 0.0
            sem = 0.0
            ci_lower, ci_upper = mean, mean
        else:
            std = np.std(filtered_values, ddof=1)  # Sample standard deviation
            sem = std / np.sqrt(len(filtered_values))  # Standard error

            # Calculate confidence interval
            ci = stats.t.interval(
                self.confidence_level, len(filtered_values) - 1, loc=mean, scale=sem
            )
            ci_lower, ci_upper = ci

        return StatisticalSummary(
            mean=mean,
            median=median,
            std=std,
            min=np.min(filtered_values),
            max=np.max(filtered_values),
            q1=q1,
            q3=q3,
            iqr=iqr,
            ci_lower=ci_lower,
            ci_upper=ci_upper,
            outliers=outliers.tolist(),
            n_samples=len(filtered_values),
            success_rate=len(filtered_values) / len(values) if len(values) > 0 else 0,
        )

    def compare_modes(self, metric: str, prompt_id: str | None = None) -> ComparisonResult:
        """Compare sequential vs parallel modes for a given metric."""
        # Filter data
        if prompt_id:
            data = self.df[self.df["prompt_id"] == prompt_id]
        else:
            data = self.df

        # Get values for each mode
        seq_values = data[data["mode"] == "sequential"][metric].dropna().to_numpy()
        par_values = data[data["mode"] == "parallel"][metric].dropna().to_numpy()

        # Remove outliers for response_time using IQR method
        if metric == "response_time":
            seq_values = self._remove_outliers_iqr(seq_values)
            par_values = self._remove_outliers_iqr(par_values)

        if len(seq_values) == 0 or len(par_values) == 0:
            return ComparisonResult(
                metric_name=metric,
                group1_name="sequential",
                group2_name="parallel",
                group1_mean=0,
                group2_mean=0,
                mean_difference=0,
                relative_improvement=0,
                p_value=1.0,
                statistic=0,
                effect_size=0,
                is_significant=False,
                test_used="none",
            )

        # Calculate means
        seq_mean = float(np.mean(seq_values))
        par_mean = float(np.mean(par_values))
        mean_diff = float(par_mean - seq_mean)
        rel_improvement = float((mean_diff / seq_mean * 100) if seq_mean != 0 else 0)

        # Perform statistical test
        # Handle single sample cases
        if len(seq_values) == 1 or len(par_values) == 1:
            # Cannot perform statistical tests with single samples
            logger.warning(
                f"Insufficient samples for {metric}: seq={len(seq_values)}, par={len(par_values)}"
            )
            statistic = 0.0
            p_value = 1.0
            test_used = "none (insufficient samples)"
        else:
            # First, check normality
            _, seq_normal_p = stats.shapiro(seq_values) if len(seq_values) >= 3 else (0, 0)
            _, par_normal_p = stats.shapiro(par_values) if len(par_values) >= 3 else (0, 0)

            # Use appropriate test based on normality
            if seq_normal_p > 0.05 and par_normal_p > 0.05 and len(seq_values) >= 30:
                # Test for equal variances using Levene's test
                _, levene_p = stats.levene(seq_values, par_values)

                if levene_p > 0.05:
                    # Use standard t-test for equal variances
                    t_result = ttest_ind(seq_values, par_values, equal_var=True)
                    statistic = float(t_result.statistic)
                    p_value = float(t_result.pvalue)
                    test_used = "t-test"
                else:
                    # Use Welch's t-test for unequal variances
                    t_result = ttest_ind(seq_values, par_values, equal_var=False)
                    statistic = float(t_result.statistic)
                    p_value = float(t_result.pvalue)
                    test_used = "welch-t-test"
            else:
                # Use Mann-Whitney U test for non-normal distributions
                u_result = mannwhitneyu(seq_values, par_values, alternative="two-sided")
                statistic = float(u_result.statistic)
                p_value = float(u_result.pvalue)
                test_used = "mann-whitney-u"

        # Calculate effect size (Cohen's d)
        if len(seq_values) < 2 or len(par_values) < 2:
            # Cannot reliably calculate effect size with insufficient samples
            # Use NaN to indicate undefined rather than 0
            effect_size = float('nan')
            logger.warning(
                f"Cannot calculate effect size for {metric}: insufficient samples"
            )
        else:
            # Both have multiple samples - use pooled standard deviation
            pooled_std = float(
                np.sqrt((np.var(seq_values, ddof=1) + np.var(par_values, ddof=1)) / 2)
            )
            effect_size = float(mean_diff / pooled_std if pooled_std != 0 else float('nan'))

        # Apply Bonferroni correction for multiple comparisons
        bonferroni_alpha = self.alpha / self.num_comparisons
        is_significant_bonferroni = bool(p_value < bonferroni_alpha)

        return ComparisonResult(
            metric_name=metric,
            group1_name="sequential",
            group2_name="parallel",
            group1_mean=seq_mean,
            group2_mean=par_mean,
            mean_difference=mean_diff,
            relative_improvement=rel_improvement,
            p_value=p_value,
            statistic=statistic,
            effect_size=effect_size,
            is_significant=is_significant_bonferroni,
            test_used=test_used,
        )

    def get_prompt_performance(self, prompt_id: str) -> dict[str, Any]:
        """Get detailed performance metrics for a specific prompt."""
        prompt_data = self.df[self.df["prompt_id"] == prompt_id]

        if prompt_data.empty:
            return {}

        metrics = {}
        for mode in ["sequential", "parallel"]:
            mode_data = prompt_data[prompt_data["mode"] == mode]

            if not mode_data.empty:
                metrics[mode] = {
                    "response_time": self.calculate_summary(
                        mode_data["response_time"].to_numpy(),
                        remove_outliers=True  # Always remove outliers for response time
                    ),
                    "overall_score": self.calculate_summary(
                        mode_data["overall_score"].to_numpy(),
                        remove_outliers=False  # Keep all score data
                    ),
                    "code_quality": self.calculate_summary(
                        mode_data["code_quality_score"].to_numpy(),
                        remove_outliers=False  # Keep all score data
                    ),
                    "architecture": self.calculate_summary(
                        mode_data["architecture_score"].to_numpy(),
                        remove_outliers=False  # Keep all score data
                    ),
                    "performance": self.calculate_summary(
                        mode_data["performance_score"].to_numpy(),
                        remove_outliers=False  # Keep all score data
                    ),
                    "accessibility": self.calculate_summary(
                        mode_data["accessibility_score"].to_numpy(),
                        remove_outliers=False  # Keep all score data
                    ),
                    "success_rate": mode_data["success"].mean(),
                    "error_rate": mode_data["has_error"].mean(),
                }

        # Add comparison
        metrics["comparison"] = {
            "response_time": self.compare_modes("response_time", prompt_id),
            "overall_score": self.compare_modes("overall_score", prompt_id),
            "code_quality": self.compare_modes("code_quality_score", prompt_id),
            "architecture": self.compare_modes("architecture_score", prompt_id),
            "performance": self.compare_modes("performance_score", prompt_id),
            "accessibility": self.compare_modes("accessibility_score", prompt_id),
        }

        return metrics

    def get_overall_statistics(self) -> dict[str, Any]:
        """Get overall statistics across all prompts."""
        stats = {
            "total_evaluations": len(self.df),
            "unique_prompts": self.df["prompt_id"].nunique(),
            "overall_success_rate": self.df["success"].mean(),
            "overall_error_rate": self.df["has_error"].mean(),
        }

        # Mode-specific statistics
        for mode in ["sequential", "parallel"]:
            mode_data = self.df[self.df["mode"] == mode]
            mode_stats: dict[str, float] = {
                "count": len(mode_data),
                "success_rate": mode_data["success"].mean(),
                "avg_response_time": mode_data["response_time"].mean(),
                "avg_overall_score": mode_data["overall_score"].mean(),
                "avg_code_quality": mode_data["code_quality_score"].mean(),
                "avg_architecture": mode_data["architecture_score"].mean(),
                "avg_performance": mode_data["performance_score"].mean(),
                "avg_accessibility": mode_data["accessibility_score"].mean(),
            }
            stats[f"{mode}_stats"] = mode_stats

        # Overall comparison
        stats["mode_comparison"] = {
            "response_time": self.compare_modes("response_time"),
            "overall_score": self.compare_modes("overall_score"),
            "code_quality": self.compare_modes("code_quality_score"),
            "architecture": self.compare_modes("architecture_score"),
            "performance": self.compare_modes("performance_score"),
            "accessibility": self.compare_modes("accessibility_score"),
        }

        return stats

    def detect_anomalies(self, threshold: float = 3.0) -> list[EvaluationResult]:
        """Detect anomalous results using z-score method."""
        anomalies = []

        for metric in ["response_time", "overall_score"]:
            values = self.df[metric].dropna()
            # Need at least 2 values with variance to calculate z-scores
            if len(values) > 1 and values.std() > 0:
                try:
                    z_scores = np.abs(stats.zscore(values))
                    anomaly_indices = self.df.index[z_scores > threshold].tolist()

                    for idx in anomaly_indices:
                        if idx < len(self.results):
                            anomalies.append(self.results[idx])
                except (ValueError, RuntimeError) as e:
                    logger.warning(
                        f"Cannot calculate z-scores for {metric}, skipping anomaly detection: {e}"
                    )
                    continue

        # Remove duplicates by keeping track of seen result indices
        seen_indices = set()
        unique_anomalies = []
        for anomaly in anomalies:
            # Use result index as unique identifier
            result_idx = self.results.index(anomaly)
            if result_idx not in seen_indices:
                seen_indices.add(result_idx)
                unique_anomalies.append(anomaly)

        return unique_anomalies

    def calculate_statistical_power(self, metric: str, prompt_id: str | None = None) -> float:
        """Calculate post-hoc statistical power for a comparison.

        Args:
            metric: The metric to calculate power for
            prompt_id: Optional prompt ID to filter by

        Returns:
            Statistical power (1 - β), or NaN if cannot be calculated
        """
        # Get the comparison result
        comparison = self.compare_modes(metric, prompt_id)

        # Cannot calculate power without valid effect size and sample sizes
        if np.isnan(comparison.effect_size):
            logger.warning(f"Cannot calculate power for {metric}: effect size is NaN")
            return float('nan')

        # Get sample sizes
        if prompt_id:
            data = self.df[self.df["prompt_id"] == prompt_id]
        else:
            data = self.df

        n_seq = len(data[data["mode"] == "sequential"])
        n_par = len(data[data["mode"] == "parallel"])

        if n_seq < 2 or n_par < 2:
            return float('nan')

        # Use simplified power calculation for t-test
        # Power = P(reject H0 | H1 is true)
        # For two-sample t-test with equal n, this can be approximated
        try:
            from scipy.stats import nct

            # Degrees of freedom
            df = n_seq + n_par - 2

            # Non-centrality parameter
            ncp = abs(comparison.effect_size) * np.sqrt(n_seq * n_par / (n_seq + n_par))

            # Critical value for two-tailed test with Bonferroni correction
            alpha_bonf = self.alpha / self.num_comparisons
            t_crit = stats.t.ppf(1 - alpha_bonf / 2, df)

            # Calculate power using non-central t distribution
            power = 1 - nct.cdf(t_crit, df, ncp) + nct.cdf(-t_crit, df, ncp)

            return float(power)
        except Exception as e:
            logger.warning(f"Error calculating power for {metric}: {e}")
            return float('nan')
