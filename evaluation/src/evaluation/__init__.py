"""
CodeCRDT Evaluation Framework

A comprehensive evaluation system for benchmarking collaborative agents
with CRDT-based synchronization in code generation tasks.

Author: CodeCRDT Research Team
License: MIT
"""

__version__ = "1.0.0"
__author__ = "CodeCRDT Research Team"
__all__ = [
    # Main components
    "main",
    "AgentEvaluator",
    "MetricsCollector",
    "ReportGenerator",
    # Configuration
    "EvaluationConfig",
    "EvaluationPrompt",
    "PromptConfiguration",
    "AgentMode",
    "PromptCategory",
    # Results
    "EvaluationResult",
    # Clients
    "BackendClient",
    "MockBackendClient",
]

from .cli import main
from .client import BackendClient, MockBackendClient
from .config import (
    AgentMode,
    EvaluationConfig,
    EvaluationPrompt,
    EvaluationResult,
    PromptCategory,
    PromptConfiguration,
)
from .evaluator import AgentEvaluator
from .metrics import MetricsCollector
from .report import ReportGenerator
