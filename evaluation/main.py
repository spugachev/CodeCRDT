#!/usr/bin/env python3
"""
Main entry point for the CRDT Agentic Synchronization Evaluation Framework.

This script provides a convenient way to run the evaluation framework
directly without using the installed CLI command.
"""

import sys
from pathlib import Path

# Add src to path so we can import the evaluation module
sys.path.insert(0, str(Path(__file__).parent / "src"))

from evaluation.cli import main

if __name__ == "__main__":
    main()
