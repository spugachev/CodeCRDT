#!/usr/bin/env python3
"""
Compute objective code quality metrics for all evaluation results.

This script addresses W2 by computing:
1. Compile success rate (TypeScript compilation without errors)
2. TypeScript diagnostics count (warnings + errors)
3. ESLint violation count

For each of the 600 evaluation results, we:
- Extract the generated code
- Save it to a temporary TypeScript file
- Run tsc --noEmit to check compilation
- Run eslint to count violations
- Record results
"""

import json
import glob
import subprocess
import tempfile
import os
from pathlib import Path
from typing import Dict, List, Tuple
import pandas as pd
import re


def setup_typescript_project(temp_dir: Path) -> None:
    """
    Create a minimal TypeScript/React project structure for compilation.
    """
    # Create tsconfig.json
    tsconfig = {
        "compilerOptions": {
            "target": "ES2020",
            "lib": ["ES2020", "DOM", "DOM.Iterable"],
            "jsx": "react-jsx",
            "module": "ESNext",
            "moduleResolution": "bundler",
            "resolveJsonModule": True,
            "allowImportingTsExtensions": True,
            "strict": True,
            "noEmit": True,
            "skipLibCheck": True,
            "esModuleInterop": True,
            "allowSyntheticDefaultImports": True,
            "forceConsistentCasingInFileNames": True
        },
        "include": ["*.tsx", "*.ts"]
    }

    with open(temp_dir / "tsconfig.json", "w") as f:
        json.dump(tsconfig, f, indent=2)

    # Create .eslintrc.json
    eslintrc = {
        "env": {
            "browser": True,
            "es2021": True
        },
        "extends": [
            "eslint:recommended",
            "plugin:react/recommended",
            "plugin:@typescript-eslint/recommended"
        ],
        "parser": "@typescript-eslint/parser",
        "parserOptions": {
            "ecmaFeatures": {
                "jsx": True
            },
            "ecmaVersion": 12,
            "sourceType": "module"
        },
        "plugins": [
            "react",
            "@typescript-eslint"
        ],
        "settings": {
            "react": {
                "version": "detect"
            }
        },
        "rules": {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "react/react-in-jsx-scope": "off"
        }
    }

    with open(temp_dir / ".eslintrc.json", "w") as f:
        json.dump(eslintrc, f, indent=2)

    # Create package.json with type declarations
    package_json = {
        "name": "evaluation-temp",
        "version": "1.0.0",
        "dependencies": {
            "react": "^18.0.0",
            "react-dom": "^18.0.0",
            "framer-motion": "^10.0.0",
            "lucide-react": "^0.263.0"
        },
        "devDependencies": {
            "@types/react": "^18.0.0",
            "@types/react-dom": "^18.0.0",
            "typescript": "^5.0.0"
        }
    }

    with open(temp_dir / "package.json", "w") as f:
        json.dump(package_json, f, indent=2)


def run_typescript_check(code: str, temp_dir: Path) -> Tuple[bool, int, str]:
    """
    Run TypeScript compiler on the code.

    Returns:
        (success, diagnostic_count, error_output)
    """
    # Save code to temp file
    code_file = temp_dir / "Component.tsx"
    with open(code_file, "w") as f:
        f.write(code)

    try:
        # Run tsc --noEmit
        result = subprocess.run(
            ["npx", "tsc", "--noEmit", "--project", str(temp_dir)],
            cwd=temp_dir,
            capture_output=True,
            text=True,
            timeout=30
        )

        # Count diagnostics (errors and warnings)
        diagnostics = result.stdout + result.stderr

        # Count lines that contain error/warning patterns
        error_lines = [
            line for line in diagnostics.split('\n')
            if 'error TS' in line or 'warning TS' in line
        ]

        diagnostic_count = len(error_lines)
        success = result.returncode == 0

        return success, diagnostic_count, diagnostics

    except subprocess.TimeoutExpired:
        return False, 999, "Compilation timeout"
    except Exception as e:
        return False, 999, f"Error: {str(e)}"


def run_eslint_check(code: str, temp_dir: Path) -> Tuple[int, int, str]:
    """
    Run ESLint on the code.

    Returns:
        (error_count, warning_count, output)
    """
    code_file = temp_dir / "Component.tsx"

    try:
        # Run eslint with JSON output
        result = subprocess.run(
            ["npx", "eslint", "--format", "json", str(code_file)],
            cwd=temp_dir,
            capture_output=True,
            text=True,
            timeout=30
        )

        # Parse JSON output
        if result.stdout:
            try:
                eslint_results = json.loads(result.stdout)
                if eslint_results and len(eslint_results) > 0:
                    errors = eslint_results[0].get('errorCount', 0)
                    warnings = eslint_results[0].get('warningCount', 0)
                    return errors, warnings, result.stdout
            except json.JSONDecodeError:
                pass

        return 0, 0, result.stdout

    except subprocess.TimeoutExpired:
        return 999, 999, "ESLint timeout"
    except Exception as e:
        return 999, 999, f"Error: {str(e)}"


def compute_metrics_for_result(result_file: str) -> Dict:
    """
    Compute objective metrics for a single evaluation result.
    """
    with open(result_file, 'r') as f:
        result = json.load(f)

    code = result.get('response_content', '')

    if not code or result.get('error'):
        return {
            'file': result_file,
            'task': result.get('prompt_id'),
            'mode': result.get('mode'),
            'run_number': result.get('run_number'),
            'has_error': True,
            'compile_success': False,
            'ts_diagnostic_count': 999,
            'eslint_error_count': 999,
            'eslint_warning_count': 999,
            'eslint_total_count': 999
        }

    # Create temporary directory for this evaluation
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        setup_typescript_project(temp_path)

        # Run TypeScript check
        compile_success, ts_diagnostics, ts_output = run_typescript_check(code, temp_path)

        # Run ESLint check
        eslint_errors, eslint_warnings, eslint_output = run_eslint_check(code, temp_path)

        return {
            'file': result_file,
            'task': result.get('prompt_id'),
            'mode': result.get('mode'),
            'run_number': result.get('run_number'),
            'response_time': result.get('response_time'),
            'has_error': False,
            'compile_success': compile_success,
            'ts_diagnostic_count': ts_diagnostics,
            'eslint_error_count': eslint_errors,
            'eslint_warning_count': eslint_warnings,
            'eslint_total_count': eslint_errors + eslint_warnings,
            # Keep LLM scores for correlation analysis
            'llm_overall_score': result.get('overall_score'),
            'llm_code_quality': result.get('code_quality_score'),
            'llm_architecture': result.get('architecture_score'),
            'llm_performance': result.get('performance_score'),
            'llm_accessibility': result.get('accessibility_score')
        }


def main():
    """Main analysis pipeline."""
    results_dir = "/Users/spugachev/Desktop/dev/collaborative-agents/evaluation/evaluation_results"

    print("Computing objective metrics for all evaluation results...")
    print("This will take several minutes (~600 files × ~5 seconds each)...")

    results_files = sorted(glob.glob(f"{results_dir}/results/*.json"))
    print(f"Found {len(results_files)} result files")

    all_metrics = []

    for i, result_file in enumerate(results_files):
        if i % 50 == 0:
            print(f"Processing {i}/{len(results_files)}...")

        try:
            metrics = compute_metrics_for_result(result_file)
            all_metrics.append(metrics)
        except Exception as e:
            print(f"Error processing {result_file}: {e}")
            # Add error entry
            all_metrics.append({
                'file': result_file,
                'has_error': True,
                'error_message': str(e)
            })

    # Convert to DataFrame
    df = pd.DataFrame(all_metrics)

    # Save results
    output_file = f"{results_dir}/objective_metrics.csv"
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

    # Group by mode
    for mode in ['sequential', 'parallel']:
        mode_df = valid_df[valid_df['mode'] == mode]
        print(f"\n{mode.upper()} MODE (n={len(mode_df)}):")
        print(f"  Compile Success Rate: {mode_df['compile_success'].mean()*100:.1f}%")
        print(f"  Avg TS Diagnostics: {mode_df['ts_diagnostic_count'].mean():.2f}")
        print(f"  Avg ESLint Errors: {mode_df['eslint_error_count'].mean():.2f}")
        print(f"  Avg ESLint Warnings: {mode_df['eslint_warning_count'].mean():.2f}")
        print(f"  Avg ESLint Total: {mode_df['eslint_total_count'].mean():.2f}")

    return df


if __name__ == "__main__":
    main()
