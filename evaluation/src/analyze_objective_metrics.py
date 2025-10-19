#!/usr/bin/env python3
"""
Statistical analysis of objective code quality metrics.

Performs paired Wilcoxon signed-rank tests per task, then meta-analysis.
"""

import pandas as pd
import numpy as np
from scipy import stats
from pathlib import Path
import json


def cohens_d_paired(diff: np.ndarray) -> float:
    """Calculate Cohen's d_z for paired samples."""
    return np.mean(diff) / np.std(diff, ddof=1)


def wilcoxon_test_per_task(df: pd.DataFrame, metric: str):
    """Perform Wilcoxon signed-rank test for each task separately."""
    tasks = sorted(df['task'].unique())
    results = {}

    for task in tasks:
        task_data = df[df['task'] == task]
        seq_data = task_data[task_data['mode'] == 'sequential'][metric].values
        par_data = task_data[task_data['mode'] == 'parallel'][metric].values

        if len(seq_data) == 0 or len(par_data) == 0:
            continue

        diff = par_data - seq_data
        statistic, p_value = stats.wilcoxon(seq_data, par_data, alternative='two-sided')
        effect_size = cohens_d_paired(diff)

        results[task] = {
            'sequential_mean': float(np.mean(seq_data)),
            'parallel_mean': float(np.mean(par_data)),
            'mean_difference': float(np.mean(diff)),
            'p_value': float(p_value),
            'effect_size_dz': float(effect_size),
            'is_significant': bool(p_value < 0.05)
        }

    return results


def meta_analysis_fixed_effects(per_task_results: dict):
    """
    Combine per-task results using fixed-effects meta-analysis.
    """
    tasks = list(per_task_results.keys())
    n_tasks = len(tasks)

    # Extract effect sizes and compute weights
    effect_sizes = np.array([per_task_results[t]['effect_size_dz'] for t in tasks])

    # Weights: inverse variance (1/SE^2 where SE = 1/sqrt(n))
    # Assuming n=50 per task per mode
    n_per_task = 50
    se = 1 / np.sqrt(n_per_task)
    weights = np.ones(n_tasks) / (se ** 2)

    # Pooled effect size
    pooled_effect = np.sum(weights * effect_sizes) / np.sum(weights)

    # Pooled standard error
    pooled_se = np.sqrt(1 / np.sum(weights))

    # Z-test for pooled effect
    z_stat = pooled_effect / pooled_se
    pooled_p = 2 * (1 - stats.norm.cdf(abs(z_stat)))

    # Heterogeneity (I²)
    q_stat = np.sum(weights * (effect_sizes - pooled_effect) ** 2)
    df = n_tasks - 1
    i_squared = max(0, (q_stat - df) / q_stat) if q_stat > 0 else 0

    return {
        'pooled_effect_dz': float(pooled_effect),
        'pooled_se': float(pooled_se),
        'pooled_p_value': float(pooled_p),
        'z_statistic': float(z_stat),
        'i_squared': float(i_squared)
    }


def main():
    """Main analysis pipeline."""
    print("="*70)
    print("OBJECTIVE METRICS STATISTICAL ANALYSIS")
    print("="*70)

    # Load data
    csv_file = Path("/Users/codecrdt/evaluation/evaluation_results/objective_metrics.csv")
    df = pd.read_csv(csv_file)

    print(f"\nLoaded {len(df)} results")
    print(f"Tasks: {sorted(df['task'].unique())}")
    print(f"Modes: {sorted(df['mode'].unique())}")

    # Filter valid results only
    df = df[df['has_error'] == False]
    print(f"Valid results: {len(df)}")

    # Metrics to analyze
    metrics = [
        'ts_error_count',
        'lint_warning_count',
        'code_length'
    ]

    all_results = {}

    for metric in metrics:
        print(f"\n{'='*70}")
        print(f"Analyzing: {metric}")
        print(f"{'='*70}")

        # Per-task analysis
        per_task = wilcoxon_test_per_task(df, metric)

        # Meta-analysis
        meta = meta_analysis_fixed_effects(per_task)

        all_results[metric] = {
            'per_task': per_task,
            'meta_analysis': meta
        }

        # Print per-task results
        print("\nPer-Task Results:")
        print(f"{'Task':<30} {'Seq Mean':<10} {'Par Mean':<10} {'Diff':<10} {'p-value':<10} {'d_z':<8} {'Sig':<5}")
        print("-" * 90)

        for task, res in per_task.items():
            sig = '***' if res['p_value'] < 0.001 else '**' if res['p_value'] < 0.01 else '*' if res['p_value'] < 0.05 else ''
            print(f"{task:<30} {res['sequential_mean']:>9.2f} {res['parallel_mean']:>9.2f} "
                  f"{res['mean_difference']:>9.2f} {res['p_value']:>9.4f} {res['effect_size_dz']:>7.3f} {sig:<5}")

        # Print meta-analysis
        print(f"\nMeta-Analysis (Fixed Effects):")
        print(f"  Pooled Effect Size (d_z): {meta['pooled_effect_dz']:.3f}")
        print(f"  Pooled Standard Error: {meta['pooled_se']:.3f}")
        print(f"  Pooled p-value: {meta['pooled_p_value']:.6f}")
        print(f"  Z-statistic: {meta['z_statistic']:.3f}")
        print(f"  Heterogeneity I²: {meta['i_squared']*100:.1f}%")

        sig_level = '***' if meta['pooled_p_value'] < 0.001 else '**' if meta['pooled_p_value'] < 0.01 else '*' if meta['pooled_p_value'] < 0.05 else 'ns'
        print(f"  Significance: {sig_level}")

    # Save results
    output_file = Path("/Users/codecrdt/evaluation/evaluation_results/objective_metrics_analysis.json")
    with open(output_file, 'w') as f:
        json.dump(all_results, f, indent=2)

    print(f"\n{'='*70}")
    print(f"Results saved to: {output_file}")
    print(f"{'='*70}\n")

    return all_results


if __name__ == "__main__":
    main()
