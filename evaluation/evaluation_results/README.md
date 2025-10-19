# CRDT Agentic Synchronization Evaluation Results

## Summary

- **Date**: 2025-10-15 11:48:49
- **Total Evaluations**: 600
- **Unique Prompts**: 6
- **Overall Success Rate**: 100.00%

## Mode Comparison

### Sequential Mode
- **Average Response Time**: 61.08s
- **Average Overall Score**: 56.0
- **Success Rate**: 100.00%

### Parallel Mode
- **Average Response Time**: 81.63s
- **Average Overall Score**: 56.5
- **Success Rate**: 100.00%

## Statistical Significance

### Response Time
- **Sequential Mean**: 60.92
- **Parallel Mean**: 68.90
- **Relative Improvement**: 13.1%
- **P-value**: 0.0001
- **Statistically Significant**: Yes
- **Effect Size (Cohen's d)**: 0.429

### Overall Score
- **Sequential Mean**: 55.98
- **Parallel Mean**: 56.52
- **Relative Improvement**: 1.0%
- **P-value**: 0.0235
- **Statistically Significant**: No
- **Effect Size (Cohen's d)**: 0.071

### Code Quality
- **Sequential Mean**: 17.13
- **Parallel Mean**: 15.81
- **Relative Improvement**: -7.7%
- **P-value**: 0.0000
- **Statistically Significant**: Yes
- **Effect Size (Cohen's d)**: -0.621

### Architecture
- **Sequential Mean**: 13.61
- **Parallel Mean**: 13.50
- **Relative Improvement**: -0.8%
- **P-value**: 0.5713
- **Statistically Significant**: No
- **Effect Size (Cohen's d)**: -0.062

### Performance
- **Sequential Mean**: 11.06
- **Parallel Mean**: 13.82
- **Relative Improvement**: 25.0%
- **P-value**: 0.0000
- **Statistically Significant**: Yes
- **Effect Size (Cohen's d)**: 1.167

### Accessibility
- **Sequential Mean**: 14.18
- **Parallel Mean**: 13.39
- **Relative Improvement**: -5.6%
- **P-value**: 0.0002
- **Statistically Significant**: Yes
- **Effect Size (Cohen's d)**: -0.244

## Files Generated

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
