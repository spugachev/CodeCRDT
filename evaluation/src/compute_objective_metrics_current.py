#!/usr/bin/env python3
"""
Compute objective code quality metrics for all evaluation results.

Optimized version that sets up a single TypeScript project and checks all files against it.
"""

import json
import glob
import subprocess
import os
import sys
from pathlib import Path
from typing import Dict, List, Tuple
import pandas as pd


# Enable unbuffered output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)


def setup_evaluation_project(project_dir: Path) -> None:
    """
    Create a TypeScript/React project structure for evaluation.
    """
    print(f"Setting up evaluation project in {project_dir}")

    project_dir.mkdir(parents=True, exist_ok=True)

    # Create tsconfig.json
    tsconfig = {
        "compilerOptions": {
            "target": "ES2020",
            "lib": ["ES2020", "DOM", "DOM.Iterable"],
            "jsx": "react-jsx",
            "module": "ESNext",
            "moduleResolution": "bundler",
            "resolveJsonModule": True,
            "strict": False,  # Less strict to avoid false positives
            "noEmit": True,
            "skipLibCheck": True,
            "esModuleInterop": True,
            "allowSyntheticDefaultImports": True,
            "forceConsistentCasingInFileNames": True,
            "noUnusedLocals": False,
            "noUnusedParameters": False
        },
        "include": ["generated/*.tsx"]
    }

    with open(project_dir / "tsconfig.json", "w") as f:
        json.dump(tsconfig, f, indent=2)

    # Create simple package.json
    package_json = {
        "name": "objective-evaluation",
        "version": "1.0.0",
        "private": True
    }

    with open(project_dir / "package.json", "w") as f:
        json.dump(package_json, f, indent=2)

    # Create generated directory
    generated_dir = project_dir / "generated"
    generated_dir.mkdir(exist_ok=True)

    print("✅ Project setup complete")


def count_typescript_errors(output: str) -> int:
    """
    Count actual TypeScript errors from tsc output.
    Ignores lines that are just file paths or summary lines.
    """
    error_count = 0
    for line in output.split('\n'):
        # Look for lines with error codes like "error TS2304:"
        if 'error TS' in line and '(' in line:
            error_count += 1
    return error_count


def run_typescript_check(code_file: Path, project_dir: Path) -> Tuple[bool, int]:
    """
    Run TypeScript compiler on a single file.

    Returns:
        (compile_success, diagnostic_count)
    """
    try:
        # Run tsc --noEmit on the specific file
        result = subprocess.run(
            ["npx", "tsc", "--noEmit", str(code_file)],
            cwd=project_dir,
            capture_output=True,
            text=True,
            timeout=10
        )

        # Count actual errors
        error_count = count_typescript_errors(result.stdout + result.stderr)

        # Success if return code is 0 (but we also check error count)
        compile_success = (result.returncode == 0 and error_count == 0)

        return compile_success, error_count

    except subprocess.TimeoutExpired:
        return False, 999
    except Exception as e:
        print(f"  Error running TypeScript: {e}", file=sys.stderr)
        return False, 999


def count_eslint_issues(output: str) -> Tuple[int, int]:
    """
    Parse ESLint output to count errors and warnings.
    """
    errors = 0
    warnings = 0

    for line in output.split('\n'):
        if 'error' in line.lower() and not line.strip().startswith('#'):
            errors += 1
        elif 'warning' in line.lower() and not line.strip().startswith('#'):
            warnings += 1

    return errors, warnings


def run_eslint_check_simple(code_file: Path, project_dir: Path) -> Tuple[int, int]:
    """
    Run a simple linting check by counting basic code quality issues.

    Since ESLint setup is complex, we'll do basic static analysis:
    - Count 'any' types
    - Count console.log statements
    - Count empty catch blocks
    """
    try:
        with open(code_file, 'r') as f:
            code = f.read()

        errors = 0
        warnings = 0

        # Count 'any' types (warning)
        warnings += code.count(': any')

        # Count console.log (warning)
        warnings += code.count('console.log')
        warnings += code.count('console.error')

        # Count TODO comments (warning)
        warnings += code.count('// TODO')
        warnings += code.count('//TODO')

        # Basic error patterns
        if '} catch {' in code or '} catch (e) {}' in code:
            errors += 1  # Empty catch block

        return errors, warnings

    except Exception as e:
        print(f"  Error in linting: {e}", file=sys.stderr)
        return 999, 999


def compute_metrics_for_result(result_file: str, project_dir: Path, generated_dir: Path) -> Dict:
    """
    Compute objective metrics for a single evaluation result.
    """
    with open(result_file, 'r') as f:
        result = json.load(f)

    task = result.get('prompt_id')
    mode = result.get('mode')
    run_num = result.get('run_number')
    code = result.get('response_content', '')

    # Create metrics dict
    metrics = {
        'file': result_file,
        'task': task,
        'mode': mode,
        'run_number': run_num,
        'response_time': result.get('response_time'),
        'has_error': result.get('error') is not None,
        'code_length': len(code) if code else 0,
        # LLM scores for correlation analysis
        'llm_overall_score': result.get('overall_score'),
        'llm_code_quality': result.get('code_quality_score'),
        'llm_architecture': result.get('architecture_score'),
        'llm_performance': result.get('performance_score'),
        'llm_accessibility': result.get('accessibility_score')
    }

    if not code or result.get('error'):
        metrics.update({
            'compile_success': False,
            'ts_error_count': 999,
            'lint_error_count': 999,
            'lint_warning_count': 999
        })
        return metrics

    # Save code to generated directory
    code_filename = f"{task}_{mode}_run{run_num:03d}.tsx"
    code_file = generated_dir / code_filename

    try:
        with open(code_file, 'w') as f:
            f.write(code)

        # Run TypeScript check
        compile_success, ts_errors = run_typescript_check(code_file, project_dir)

        # Run simplified linting
        lint_errors, lint_warnings = run_eslint_check_simple(code_file, project_dir)

        metrics.update({
            'compile_success': compile_success,
            'ts_error_count': ts_errors,
            'lint_error_count': lint_errors,
            'lint_warning_count': lint_warnings,
            'lint_total_count': lint_errors + lint_warnings
        })

    except Exception as e:
        print(f"  Error processing {code_filename}: {e}", file=sys.stderr)
        metrics.update({
            'compile_success': False,
            'ts_error_count': 999,
            'lint_error_count': 999,
            'lint_warning_count': 999
        })

    return metrics


def main():
    """Main analysis pipeline."""
    print("="*70)
    print("COMPUTING OBJECTIVE METRICS FOR ALL EVALUATION RESULTS")
    print("="*70)

    results_dir = Path("/Users/spugachev/Desktop/dev/collaborative-agents/evaluation/evaluation_results")
    project_dir = results_dir / "objective_evaluation_project"
    generated_dir = project_dir / "generated"

    # Setup project
    setup_evaluation_project(project_dir)

    # Get all result files
    results_files = sorted(glob.glob(str(results_dir / "results" / "*.json")))
    print(f"\nFound {len(results_files)} result files")
    print(f"Processing... (this may take 10-15 minutes)\n")

    all_metrics = []

    for i, result_file in enumerate(results_files):
        if i % 50 == 0:
            print(f"Progress: {i}/{len(results_files)} ({i*100//len(results_files)}%)")
            sys.stdout.flush()

        try:
            metrics = compute_metrics_for_result(result_file, project_dir, generated_dir)
            all_metrics.append(metrics)
        except Exception as e:
            print(f"ERROR processing {result_file}: {e}", file=sys.stderr)
            all_metrics.append({
                'file': result_file,
                'has_error': True,
                'error_message': str(e)
            })

    print(f"Progress: {len(results_files)}/{len(results_files)} (100%)")

    # Convert to DataFrame
    df = pd.DataFrame(all_metrics)

    # Save results
    output_file = results_dir / "objective_metrics.csv"
    df.to_csv(output_file, index=False)
    print(f"\n✅ Saved objective metrics to: {output_file}")

    # Print summary statistics
    print("\n" + "="*70)
    print("OBJECTIVE METRICS SUMMARY")
    print("="*70)

    valid_df = df[df['has_error'] == False]

    print(f"\nTotal results: {len(df)}")
    print(f"Valid results: {len(valid_df)}")
    print(f"Errors: {len(df[df['has_error'] == True])}")

    # Overall statistics
    print(f"\n{'='*70}")
    print("OVERALL STATISTICS")
    print(f"{'='*70}")

    seq_df = valid_df[valid_df['mode'] == 'sequential']
    par_df = valid_df[valid_df['mode'] == 'parallel']

    print(f"\nSEQUENTIAL MODE (n={len(seq_df)}):")
    print(f"  Compile Success Rate: {seq_df['compile_success'].mean()*100:.1f}%")
    print(f"  Avg TypeScript Errors: {seq_df['ts_error_count'].mean():.2f}")
    print(f"  Median TypeScript Errors: {seq_df['ts_error_count'].median():.0f}")
    print(f"  Avg Lint Errors: {seq_df['lint_error_count'].mean():.2f}")
    print(f"  Avg Lint Warnings: {seq_df['lint_warning_count'].mean():.2f}")
    print(f"  Avg Code Length: {seq_df['code_length'].mean():.0f} chars")

    print(f"\nPARALLEL MODE (n={len(par_df)}):")
    print(f"  Compile Success Rate: {par_df['compile_success'].mean()*100:.1f}%")
    print(f"  Avg TypeScript Errors: {par_df['ts_error_count'].mean():.2f}")
    print(f"  Median TypeScript Errors: {par_df['ts_error_count'].median():.0f}")
    print(f"  Avg Lint Errors: {par_df['lint_error_count'].mean():.2f}")
    print(f"  Avg Lint Warnings: {par_df['lint_warning_count'].mean():.2f}")
    print(f"  Avg Code Length: {par_df['code_length'].mean():.0f} chars")

    # Compute differences
    print(f"\n{'='*70}")
    print("MODE COMPARISON")
    print(f"{'='*70}")

    compile_diff = (par_df['compile_success'].mean() - seq_df['compile_success'].mean()) * 100
    ts_error_diff = par_df['ts_error_count'].mean() - seq_df['ts_error_count'].mean()
    lint_error_diff = par_df['lint_error_count'].mean() - seq_df['lint_error_count'].mean()
    lint_warning_diff = par_df['lint_warning_count'].mean() - seq_df['lint_warning_count'].mean()

    print(f"\nCompile Success Rate Δ: {compile_diff:+.1f}%")
    print(f"TypeScript Errors Δ: {ts_error_diff:+.2f}")
    print(f"Lint Errors Δ: {lint_error_diff:+.2f}")
    print(f"Lint Warnings Δ: {lint_warning_diff:+.2f}")

    print(f"\n{'='*70}")
    print("✅ OBJECTIVE METRICS COMPUTATION COMPLETE")
    print(f"{'='*70}\n")

    return df


if __name__ == "__main__":
    main()
