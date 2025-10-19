# CodeCRDT Evaluation Framework

Author: Sergey Pugachev

## Overview

A comprehensive evaluation framework for comparing sequential and parallel code generation agents. This framework provides automated testing, statistical analysis, and visualization of agent performance across various prompting scenarios.

## Features

- **Multi-Agent Evaluation**: Compare sequential vs parallel (outliner) agent architectures
- **Statistical Analysis**: Rigorous statistical testing including t-tests, Mann-Whitney U tests, and effect size calculations
- **Performance Metrics**: Response time, code quality, architecture, performance, and accessibility scoring
- **Automated Evaluation**: Batch processing with configurable retry logic and error handling
- **Visualization**: Generate comprehensive charts and statistical reports
- **HTTP API Integration**: Full integration with the collaborative agents backend via REST API

## Installation

### Prerequisites

- Python 3.11 or higher
- Backend server running at `http://localhost:3001` (or configured URL)
- uv package manager (recommended) or pip

### Setup

1. Clone the repository and navigate to the evaluation directory:

```bash
cd evaluation
```

2. Install dependencies using uv (recommended):

```bash
uv sync
```

Or using pip:

```bash
pip install -r requirements.txt
```

3. Verify the backend server is running:

```bash
curl http://localhost:3001/api/v1/health
```

## Configuration

The evaluation framework uses a YAML configuration file (`config.yaml`) for runtime settings:

```yaml
backend_url: http://localhost:3001
api_version: v1
runs_per_prompt: 50
max_concurrent_requests: 1
request_timeout: 120
retry_attempts: 3
retry_delay: 2.0
output_dir: ./output
save_raw_responses: true
save_evaluation_scores: true
generate_visualizations: true
confidence_level: 0.95
outlier_detection: true
outlier_threshold: 3.0
```

### Configuration Parameters

- **backend_url**: URL of the collaborative agents backend server
- **api_version**: API version (currently v1)
- **runs_per_prompt**: Number of evaluation runs per prompt (default: 50)
- **max_concurrent_requests**: Maximum concurrent API requests (default: 1 for controlled evaluation)
- **request_timeout**: API request timeout in seconds (default: 120)
- **retry_attempts**: Number of retry attempts for failed requests (default: 3)
- **retry_delay**: Delay between retries in seconds (default: 2.0)
- **output_dir**: Directory for evaluation results (default: ./output)
- **save_raw_responses**: Save raw API responses for debugging (default: true)
- **save_evaluation_scores**: Save detailed evaluation scores (default: true)
- **generate_visualizations**: Generate charts and visualizations (default: true)
- **confidence_level**: Statistical confidence level (default: 0.95)
- **outlier_detection**: Enable outlier detection (default: true)
- **outlier_threshold**: Outlier detection threshold in standard deviations (default: 3.0)

## Prompts Configuration

Evaluation prompts are defined in `prompts.yaml`:

```yaml
prompts:
  - id: calculator_simple
    name: Simple Calculator
    category: simple
    description: Basic calculator implementation
    prompt: 'Create a simple calculator component with add, subtract, multiply, and divide functions'
    expected_components:
      - Calculator component
      - Basic arithmetic operations
      - Input handling
      - Result display
    complexity_score: 3.0
    tags:
      - math
      - basic
      - ui
```

### Prompt Categories

- **simple**: Basic single-component implementations
- **intermediate**: Multi-component features with state management
- **complex**: Full applications with multiple features
- **game**: Interactive game implementations
- **productivity**: Productivity tool implementations
- **creative**: Creative and visual applications

## Usage

### Running Evaluations

Evaluate all prompts across both agent modes:

```bash
uv run codecrdt-eval evaluate
```

Evaluate specific prompts:

```bash
uv run codecrdt-eval evaluate --prompt-ids calculator_simple todo_app
```

Evaluate specific categories:

```bash
uv run codecrdt-eval evaluate --categories simple intermediate
```

Evaluate specific modes:

```bash
# Sequential mode only
uv run codecrdt-eval evaluate --modes sequential

# Parallel mode only
uv run codecrdt-eval evaluate --modes parallel

# Both modes (default)
uv run codecrdt-eval evaluate --modes both
```

Dry run (validate configuration without running):

```bash
uv run codecrdt-eval evaluate --dry-run
```

Test single prompt with one run:

```bash
# Test with sequential mode only
uv run codecrdt-eval evaluate --prompt-ids registration_page --runs 1 --modes sequential

# Test with parallel mode only
uv run codecrdt-eval evaluate --prompt-ids registration_page --runs 1 --modes parallel

# Test with both modes
uv run codecrdt-eval evaluate --prompt-ids registration_page --runs 1 --modes sequential
```

### Analyzing Results

Analyze completed evaluation results:

```bash
uv run codecrdt-eval analyze
```

Analyze specific evaluation session:

```bash
uv run codecrdt-eval analyze --session-id 20240115_120000
```

Generate only visualizations:

```bash
uv run codecrdt-eval analyze --visualizations-only
```

Export results to different formats:

```bash
uv run codecrdt-eval analyze --export-format excel
```

## API Integration

The framework integrates with the collaborative agents backend through the following API endpoints:

### Task Creation

- **POST** `/api/v1/tasks`
  - Creates a new code generation task
  - Parameters: `roomId`, `prompt`, `agentName` (sequential or outliner)

### Task Status

- **GET** `/api/v1/tasks/{taskId}`
  - Polls for task completion status
  - Returns task status and metadata

### Room Content

- **GET** `/api/v1/rooms/{roomId}/text`
  - Retrieves generated code content from a room
  - Returns the complete generated code

### Code Evaluation

- **POST** `/api/v1/evaluation/evaluate`
  - Evaluates code quality metrics
  - Returns scores for quality, architecture, performance, and accessibility

## Output Structure

Evaluation results are organized in the output directory:

```
output/
└── evaluation_YYYYMMDD_HHMMSS/
    ├── results/                   # Combined evaluation results and raw responses
    │   └── {prompt_id}_{mode}_run{N}.json
    ├── visualizations/            # Generated charts and graphs
    │   ├── score_distributions.png
    │   ├── response_times.png
    │   └── mode_comparison.png
    ├── checkpoint.json            # Evaluation checkpoint data
    ├── evaluation_report.yaml     # Main evaluation report (YAML)
    ├── evaluation_report.json     # Main evaluation report (JSON)
    ├── evaluation_report.pdf      # PDF report
    └── README.md                  # Summary documentation
```

### Result File Structure

Each file in the `results/` folder contains:
- All evaluation metadata (prompt ID, mode, run number, timestamp)
- Response content (generated code)
- Performance metrics (response time, token count)
- Evaluation scores (overall, code quality, architecture, performance, accessibility)
- Raw API response (if `save_raw_responses` is enabled in config)
- Error information (if evaluation failed)

## Statistical Analysis

The framework performs comprehensive statistical analysis:

### Metrics Analyzed

- **Response Time**: API response latency
- **Overall Score**: Comprehensive quality score (0-100)
- **Code Quality**: Code structure and best practices
- **Architecture**: Component organization and state management
- **Performance**: Runtime efficiency considerations
- **Accessibility**: UI/UX accessibility compliance

### Statistical Tests

- **T-Test**: Parametric test for normally distributed data
- **Mann-Whitney U Test**: Non-parametric test for non-normal distributions
- **Cohen's d**: Effect size measurement
- **Confidence Intervals**: 95% confidence intervals for all metrics

### Outlier Detection

- Z-score based outlier detection
- Configurable threshold (default: 3 standard deviations)
- Automatic exclusion from statistical analysis

## Development

### Project Structure

```
evaluation/
├── src/
│   └── evaluation/
│       ├── __init__.py
│       ├── cli.py              # CLI commands
│       ├── client.py           # Backend API client
│       ├── config.py           # Configuration models
│       ├── evaluator.py        # Core evaluation logic
│       ├── analyzer.py         # Statistical analysis
│       └── visualizer.py       # Chart generation
├── config.yaml                 # Runtime configuration
├── prompts.yaml               # Evaluation prompts
├── pyproject.toml             # Project dependencies
└── README.md
```

### Running Tests

```bash
uv run pytest
```

### Type Checking

```bash
uv run mypy src
```

### Code Formatting

```bash
uv run ruff format src
uv run ruff check src --fix
```

## Objective Code Quality Metrics

Additional scripts for computing and analyzing objective code quality metrics:

### Computing Objective Metrics

Compute objective metrics (TypeScript errors, lint warnings, code length) for all evaluation results:

```bash
uv run python src/compute_objective_metrics_current.py
```

This script:
- Extracts generated TypeScript/React code from all evaluation results
- Runs `tsc --noEmit` to count TypeScript compilation errors
- Performs simplified linting (pattern matching for `: any`, `console.log`, TODOs)
- Measures code length in characters
- Outputs `evaluation_results/objective_metrics.csv`

### Analyzing Objective Metrics

Perform statistical analysis on objective metrics:

```bash
uv run python src/analyze_objective_metrics_current.py
```

This script:
- Loads objective metrics from CSV
- Computes normalized error rates (errors per 1000 characters)
- Performs Mann-Whitney U tests per task (independent samples)
- Calculates Cohen's d effect sizes
- Checks heterogeneity (I² statistic)
- Outputs `evaluation_results/objective_metrics_corrected.json`

**Key Features:**
- Uses Mann-Whitney U (not Wilcoxon) - appropriate for independent samples
- Normalizes error counts by code length for fair comparison
- Reports per-task results when heterogeneity (I² > 75%) makes pooling invalid
- Identifies task-dependent effects that aggregate metrics would mask

### File Organization

```
evaluation/
├── main.py                                      # Main entry point (legacy)
├── src/
│   ├── compute_objective_metrics_current.py     # CURRENT: Objective metrics computation
│   ├── analyze_objective_metrics_current.py     # CURRENT: Statistical analysis (corrected)
│   ├── analyze_objective_metrics.py             # OLD: incorrect paired Wilcoxon analysis
│   ├── compute_objective_metrics.py             # OLD: initial version with bugs
│   ├── paired_statistical_analysis.py           # OLD: paired analysis (deprecated)
│   └── evaluation/                              # Main evaluation package
│       ├── __init__.py
│       ├── cli.py
│       ├── client.py
│       ├── config.py
│       ├── evaluator.py
│       ├── metrics.py
│       └── report.py
```

**Important:** Use the `*_current.py` scripts in `src/`. Other scripts in `src/` without `_current` suffix are deprecated versions kept for reference.

## Troubleshooting

### Common Issues

1. **Connection Refused Error**

   - Ensure the backend server is running at the configured URL
   - Check firewall settings and network connectivity

2. **Task Timeout**

   - Increase `request_timeout` in config.yaml
   - Check backend server logs for errors

3. **Invalid API Response**

   - Verify API version compatibility
   - Check backend server health endpoint

4. **Statistical Analysis Failures**
   - Ensure sufficient runs per prompt (minimum 30 recommended)
   - Check for data quality issues in raw responses

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=DEBUG
uv run codecrdt-eval evaluate
```

## Performance Considerations

- **Max Concurrent Requests**: Set to 1 by default for controlled evaluation and to avoid overwhelming the backend
- **Batch Size**: Large evaluation sets are automatically batched
- **Memory Usage**: Results are streamed to disk for large evaluations
- **Retry Logic**: Automatic retry with exponential backoff for transient failures
