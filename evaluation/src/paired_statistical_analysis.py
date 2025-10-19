#!/usr/bin/env python3
"""
Proper paired statistical analysis for multi-agent evaluation.

This script corrects the statistical methodology by using paired tests
that account for the task-level pairing structure (6 tasks × 50 runs per mode).
"""

import json
import glob
from pathlib import Path
from typing import Dict, List, Tuple
import numpy as np
from scipy import stats
import pandas as pd


def load_evaluation_data(results_dir: str) -> pd.DataFrame:
    """Load all evaluation results into a structured DataFrame."""
    results_files = glob.glob(f"{results_dir}/results/*.json")

    data = []
    for file_path in results_files:
        with open(file_path, 'r') as f:
            result = json.load(f)
            data.append({
                'task': result['prompt_id'],
                'mode': result['mode'],
                'run_number': result['run_number'],
                'response_time': result['response_time'],
                'overall_score': result['overall_score'],
                'code_quality': result['code_quality_score'],
                'architecture': result['architecture_score'],
                'performance': result['performance_score'],
                'accessibility': result['accessibility_score'],
            })

    df = pd.DataFrame(data)
    print(f"Loaded {len(df)} evaluation results")
    print(f"Tasks: {sorted(df['task'].unique())}")
    print(f"Modes: {sorted(df['mode'].unique())}")

    return df


def cohens_d_paired(diff: np.ndarray) -> float:
    """
    Calculate Cohen's d_z for paired samples.

    For paired data, d_z = mean(diff) / std(diff)
    This is the standardized mean difference of the paired differences.
    """
    return np.mean(diff) / np.std(diff, ddof=1)


def wilcoxon_test_per_task(
    df: pd.DataFrame,
    metric: str
) -> Dict[str, Dict]:
    """
    Perform Wilcoxon signed-rank test for each task separately.

    Returns per-task results including p-values and effect sizes.
    """
    tasks = sorted(df['task'].unique())
    results = {}

    for task in tasks:
        task_data = df[df['task'] == task]

        # Get sequential and parallel data for this task
        seq_data = task_data[task_data['mode'] == 'sequential'][metric].values
        par_data = task_data[task_data['mode'] == 'parallel'][metric].values

        # Ensure equal sample sizes
        n_seq = len(seq_data)
        n_par = len(par_data)

        if n_seq != n_par:
            print(f"Warning: {task} has unequal samples (seq={n_seq}, par={n_par})")
            min_n = min(n_seq, n_par)
            seq_data = seq_data[:min_n]
            par_data = par_data[:min_n]

        # Calculate paired differences
        diff = par_data - seq_data

        # Wilcoxon signed-rank test
        statistic, p_value = stats.wilcoxon(seq_data, par_data, alternative='two-sided')

        # Effect size (Cohen's d_z for paired data)
        effect_size = cohens_d_paired(diff)

        results[task] = {
            'n': len(seq_data),
            'sequential_mean': np.mean(seq_data),
            'parallel_mean': np.mean(par_data),
            'mean_difference': np.mean(diff),
            'statistic': statistic,
            'p_value': p_value,
            'effect_size_dz': effect_size,
            'is_significant': bool(p_value < 0.05)
        }

    return results


def meta_analysis_fixed_effects(per_task_results: Dict[str, Dict]) -> Dict:
    """
    Combine per-task results using fixed-effects meta-analysis.

    Uses inverse-variance weighting to combine effect sizes and p-values.
    """
    tasks = list(per_task_results.keys())

    # Extract effect sizes and sample sizes
    effect_sizes = np.array([per_task_results[t]['effect_size_dz'] for t in tasks])
    ns = np.array([per_task_results[t]['n'] for t in tasks])

    # Calculate standard errors (SE = 1/sqrt(n) for paired Cohen's d_z)
    ses = 1.0 / np.sqrt(ns)

    # Inverse-variance weights
    weights = 1.0 / (ses ** 2)
    weights = weights / np.sum(weights)  # Normalize

    # Weighted mean effect size
    pooled_effect_size = np.sum(weights * effect_sizes)
    pooled_se = np.sqrt(1.0 / np.sum(1.0 / (ses ** 2)))

    # Z-test for pooled effect
    z_statistic = pooled_effect_size / pooled_se
    pooled_p_value = 2 * (1 - stats.norm.cdf(abs(z_statistic)))

    # Heterogeneity (I² statistic)
    Q = np.sum(weights * (effect_sizes - pooled_effect_size) ** 2)
    df = len(tasks) - 1
    I2 = max(0, (Q - df) / Q) * 100 if Q > 0 else 0

    return {
        'pooled_effect_size': pooled_effect_size,
        'pooled_se': pooled_se,
        'pooled_p_value': pooled_p_value,
        'z_statistic': z_statistic,
        'heterogeneity_I2': I2,
        'heterogeneity_Q': Q,
        'heterogeneity_df': df,
        'n_tasks': len(tasks)
    }


def analyze_metric(df: pd.DataFrame, metric: str) -> Dict:
    """
    Complete analysis pipeline for a single metric.
    """
    print(f"\n{'='*70}")
    print(f"Analyzing: {metric}")
    print('='*70)

    # Per-task Wilcoxon tests
    per_task = wilcoxon_test_per_task(df, metric)

    # Display per-task results
    print(f"\nPer-Task Results:")
    print(f"{'Task':<25} {'n':>4} {'Seq Mean':>10} {'Par Mean':>10} {'Diff':>10} {'p-value':>10} {'d_z':>8} {'Sig':>5}")
    print('-' * 100)
    for task, result in per_task.items():
        sig = '***' if result['p_value'] < 0.001 else '**' if result['p_value'] < 0.01 else '*' if result['p_value'] < 0.05 else ''
        print(f"{task:<25} {result['n']:>4} {result['sequential_mean']:>10.2f} {result['parallel_mean']:>10.2f} "
              f"{result['mean_difference']:>10.2f} {result['p_value']:>10.4f} {result['effect_size_dz']:>8.3f} {sig:>5}")

    # Meta-analysis
    meta = meta_analysis_fixed_effects(per_task)

    print(f"\nMeta-Analysis (Fixed Effects):")
    print(f"  Pooled Effect Size (d_z): {meta['pooled_effect_size']:.3f}")
    print(f"  Pooled Standard Error: {meta['pooled_se']:.3f}")
    print(f"  Pooled p-value: {meta['pooled_p_value']:.6f}")
    print(f"  Z-statistic: {meta['z_statistic']:.3f}")
    print(f"  Heterogeneity I²: {meta['heterogeneity_I2']:.1f}%")
    print(f"  Significance: {'***' if meta['pooled_p_value'] < 0.001 else '**' if meta['pooled_p_value'] < 0.01 else '*' if meta['pooled_p_value'] < 0.05 else 'ns'}")

    return {
        'per_task': per_task,
        'meta_analysis': meta
    }


def main():
    """Main analysis pipeline."""
    results_dir = "/Users/spugachev/Desktop/dev/collaborative-agents/evaluation/evaluation_results"

    print("Loading evaluation data...")
    df = load_evaluation_data(results_dir)

    # Analyze each metric
    metrics = [
        'response_time',
        'overall_score',
        'code_quality',
        'architecture',
        'performance',
        'accessibility'
    ]

    all_results = {}
    for metric in metrics:
        all_results[metric] = analyze_metric(df, metric)

    # Save results
    output_file = f"{results_dir}/paired_statistical_analysis.json"

    # Convert numpy types to native Python for JSON serialization
    def convert_types(obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {k: convert_types(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_types(item) for item in obj]
        return obj

    all_results_converted = convert_types(all_results)

    with open(output_file, 'w') as f:
        json.dump(all_results_converted, f, indent=2)

    print(f"\n{'='*70}")
    print(f"Results saved to: {output_file}")
    print('='*70)

    return all_results


if __name__ == "__main__":
    main()
