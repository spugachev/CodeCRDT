#!/usr/bin/env python3
"""
Corrected statistical analysis of objective code quality metrics.

Fixes:
1. Uses Mann-Whitney U test (independent samples, not paired)
2. Normalizes error counts by code length
3. Reports per-task results separately (no invalid pooling when I² > 75%)
4. Removes invalid meta-analysis
"""

import pandas as pd
import numpy as np
from scipy import stats
from pathlib import Path
import json


def cohens_d_independent(group1: np.ndarray, group2: np.ndarray) -> float:
    """Calculate Cohen's d for independent samples."""
    n1, n2 = len(group1), len(group2)
    var1, var2 = np.var(group1, ddof=1), np.var(group2, ddof=1)
    pooled_std = np.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))

    if pooled_std == 0:
        return 0.0

    return (np.mean(group2) - np.mean(group1)) / pooled_std


def mann_whitney_test_per_task(df: pd.DataFrame, metric: str):
    """Perform Mann-Whitney U test for each task separately."""
    tasks = sorted(df['task'].unique())
    results = {}

    for task in tasks:
        task_data = df[df['task'] == task]
        seq_data = task_data[task_data['mode'] == 'sequential'][metric].values
        par_data = task_data[task_data['mode'] == 'parallel'][metric].values

        if len(seq_data) == 0 or len(par_data) == 0:
            continue

        # Mann-Whitney U test (independent samples)
        statistic, p_value = stats.mannwhitneyu(
            seq_data, par_data, alternative='two-sided'
        )

        # Cohen's d for independent samples
        effect_size = cohens_d_independent(seq_data, par_data)

        # Compute means and percentage change
        seq_mean = float(np.mean(seq_data))
        par_mean = float(np.mean(par_data))
        mean_diff = par_mean - seq_mean

        if seq_mean != 0:
            pct_change = (mean_diff / seq_mean) * 100
        else:
            pct_change = 0.0

        results[task] = {
            'sequential_mean': seq_mean,
            'sequential_std': float(np.std(seq_data, ddof=1)),
            'parallel_mean': par_mean,
            'parallel_std': float(np.std(par_data, ddof=1)),
            'mean_difference': mean_diff,
            'percent_change': pct_change,
            'p_value': float(p_value),
            'effect_size_d': float(effect_size),
            'is_significant': bool(p_value < 0.05),
            'n_sequential': len(seq_data),
            'n_parallel': len(par_data)
        }

    return results


def compute_normalized_errors(df: pd.DataFrame):
    """Compute error rates normalized by code length."""
    df = df.copy()

    # Errors per 1000 characters
    df['ts_error_rate'] = (df['ts_error_count'] / df['code_length']) * 1000
    df['lint_warning_rate'] = (df['lint_warning_count'] / df['code_length']) * 1000

    # Handle division by zero
    df['ts_error_rate'] = df['ts_error_rate'].replace([np.inf, -np.inf], np.nan)
    df['lint_warning_rate'] = df['lint_warning_rate'].replace([np.inf, -np.inf], np.nan)

    return df


def compute_heterogeneity(per_task_results: dict):
    """
    Compute I² heterogeneity statistic to determine if pooling is valid.
    """
    tasks = list(per_task_results.keys())
    n_tasks = len(tasks)

    if n_tasks < 2:
        return 0.0

    # Extract effect sizes
    effect_sizes = np.array([per_task_results[t]['effect_size_d'] for t in tasks])

    # Assume equal weights for simplicity
    weights = np.ones(n_tasks)

    # Weighted mean
    pooled_effect = np.sum(weights * effect_sizes) / np.sum(weights)

    # Q statistic
    q_stat = np.sum(weights * (effect_sizes - pooled_effect) ** 2)

    # Degrees of freedom
    df = n_tasks - 1

    # I² statistic
    if q_stat > 0 and df > 0:
        i_squared = max(0, (q_stat - df) / q_stat)
    else:
        i_squared = 0

    return i_squared * 100


def main():
    """Main analysis pipeline."""
    print("=" * 70)
    print("CORRECTED OBJECTIVE METRICS STATISTICAL ANALYSIS")
    print("=" * 70)

    # Load data
    csv_file = Path("/Users/codecrdt/evaluation/evaluation_results/objective_metrics.csv")
    df = pd.read_csv(csv_file)

    print(f"\nLoaded {len(df)} results")
    print(f"Tasks: {sorted(df['task'].unique())}")
    print(f"Modes: {sorted(df['mode'].unique())}")

    # Filter valid results only
    df = df[df['has_error'] == False]
    print(f"Valid results: {len(df)}")

    # Compute normalized metrics
    df = compute_normalized_errors(df)

    # Metrics to analyze
    metrics = [
        ('ts_error_count', 'TypeScript Error Count (absolute)'),
        ('ts_error_rate', 'TypeScript Errors per 1000 chars'),
        ('lint_warning_count', 'Lint Warning Count (absolute)'),
        ('lint_warning_rate', 'Lint Warnings per 1000 chars'),
        ('code_length', 'Code Length (characters)')
    ]

    all_results = {}

    for metric, metric_name in metrics:
        print(f"\n{'=' * 70}")
        print(f"Analyzing: {metric_name}")
        print(f"{'=' * 70}")

        # Per-task analysis
        per_task = mann_whitney_test_per_task(df, metric)

        # Compute heterogeneity
        i_squared = compute_heterogeneity(per_task)

        all_results[metric] = {
            'metric_name': metric_name,
            'per_task': per_task,
            'i_squared': float(i_squared),
            'pooling_valid': bool(i_squared < 75.0)
        }

        # Print per-task results
        print("\nPer-Task Results (Mann-Whitney U test):")
        print(f"{'Task':<30} {'Seq Mean':<12} {'Par Mean':<12} {'Diff':<10} {'% Δ':<8} {'p-value':<10} {'d':<8} {'Sig':<5}")
        print("-" * 105)

        for task, res in per_task.items():
            sig = '***' if res['p_value'] < 0.001 else '**' if res['p_value'] < 0.01 else '*' if res['p_value'] < 0.05 else ''
            print(f"{task:<30} {res['sequential_mean']:>11.2f} {res['parallel_mean']:>11.2f} "
                  f"{res['mean_difference']:>9.2f} {res['percent_change']:>7.1f}% {res['p_value']:>9.4f} {res['effect_size_d']:>7.3f} {sig:<5}")

        # Print heterogeneity warning
        print(f"\nHeterogeneity I² = {i_squared:.1f}%")

        if i_squared >= 75.0:
            print("⚠️  WARNING: I² ≥ 75% indicates extreme heterogeneity.")
            print("   Pooled meta-analysis is NOT VALID for this metric.")
            print("   Report per-task results separately.")
        elif i_squared >= 50.0:
            print("⚠️  CAUTION: I² ≥ 50% indicates substantial heterogeneity.")
            print("   Consider reporting per-task results.")
        else:
            print("✓  I² < 50% indicates low heterogeneity. Pooling may be valid.")

    # Save results
    output_file = Path("/Users/codecrdt/evaluation/evaluation_results/objective_metrics_corrected.json")
    with open(output_file, 'w') as f:
        json.dump(all_results, f, indent=2)

    print(f"\n{'=' * 70}")
    print(f"Results saved to: {output_file}")
    print(f"{'=' * 70}\n")

    # Print summary recommendations
    print("=" * 70)
    print("SUMMARY RECOMMENDATIONS FOR PAPER")
    print("=" * 70)

    print("\n1. DO NOT report pooled/meta-analyzed results for:")
    for metric, metric_name in metrics:
        if metric in all_results and all_results[metric]['i_squared'] >= 75.0:
            print(f"   - {metric_name} (I² = {all_results[metric]['i_squared']:.1f}%)")

    print("\n2. REPORT per-task results in a table showing task-specific effects")

    print("\n3. KEY FINDINGS to highlight:")
    print("   - Results are highly task-dependent (extreme heterogeneity)")
    print("   - Some tasks benefit (e.g., Tic-Tac-Toe), others don't")
    print("   - Normalized error rates (per 1000 chars) provide fairer comparison")

    return all_results


if __name__ == "__main__":
    main()
