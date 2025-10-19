"""Configuration and data models for the evaluation framework."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel, Field, field_validator


class AgentMode(str, Enum):
    """Agent execution modes."""

    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"


class PromptCategory(str, Enum):
    """Categories of evaluation prompts."""

    SIMPLE = "simple"
    INTERMEDIATE = "intermediate"
    COMPLEX = "complex"
    GAME = "game"
    PRODUCTIVITY = "productivity"
    CREATIVE = "creative"


class EvaluationPrompt(BaseModel):
    """Model for evaluation prompts."""

    id: str
    name: str
    category: PromptCategory
    description: str
    prompt: str
    expected_components: list[str] = Field(default_factory=list)
    complexity_score: float = Field(ge=0, le=10)
    tags: list[str] = Field(default_factory=list)

    @field_validator("id")
    @classmethod
    def validate_id(cls, v: str) -> str:
        """Ensure ID is valid for filesystem."""
        return v.replace(" ", "_").replace("/", "_")


class EvaluationConfig(BaseModel):
    """Main configuration for evaluation runs."""

    backend_url: str = "http://localhost:3001"
    api_version: str = "v1"

    # Evaluation parameters
    runs_per_prompt: int = Field(default=50, ge=1)
    max_concurrent_requests: int = Field(default=1, ge=1)
    request_timeout: int = Field(default=120, ge=10)
    retry_attempts: int = Field(default=3, ge=0)
    retry_delay: float = Field(default=2.0, ge=0)

    # Output configuration
    output_dir: Path = Path("./output")
    save_raw_responses: bool = True
    save_evaluation_scores: bool = True
    generate_visualizations: bool = True

    # Statistical parameters
    confidence_level: float = Field(default=0.95, ge=0, le=1)
    outlier_detection: bool = True
    outlier_threshold: float = Field(default=3.0, ge=1)  # Standard deviations

    class Config:
        """Pydantic configuration."""

        validate_assignment = True


@dataclass
class EvaluationResult:
    """Result from a single evaluation run."""

    prompt_id: str
    prompt_name: str
    mode: AgentMode
    run_number: int
    timestamp: datetime

    # Performance metrics
    response_time: float  # seconds
    total_tokens: int | None = None

    # Response data
    response_content: str = ""
    error: str | None = None

    # Evaluation scores
    overall_score: float | None = None
    code_quality_score: float | None = None
    architecture_score: float | None = None
    performance_score: float | None = None
    accessibility_score: float | None = None

    # Additional metadata
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def success(self) -> bool:
        """Check if the evaluation was successful."""
        return self.error is None and self.overall_score is not None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "prompt_id": self.prompt_id,
            "prompt_name": self.prompt_name,
            "mode": self.mode.value,
            "run_number": self.run_number,
            "timestamp": self.timestamp.isoformat(),
            "response_time": self.response_time,
            "total_tokens": self.total_tokens,
            "response_content": self.response_content,
            "error": self.error,
            "overall_score": self.overall_score,
            "code_quality_score": self.code_quality_score,
            "architecture_score": self.architecture_score,
            "performance_score": self.performance_score,
            "accessibility_score": self.accessibility_score,
            "metadata": self.metadata,
        }


class PromptConfiguration:
    """Manager for loading and validating prompts."""

    def __init__(self, config_path: Path):
        """Initialize with configuration file path."""
        self.config_path = config_path
        self.prompts: list[EvaluationPrompt] = []
        self._load_prompts()

    def _load_prompts(self) -> None:
        """Load prompts from YAML configuration."""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Prompt configuration not found: {self.config_path}")

        with open(self.config_path) as f:
            data = yaml.safe_load(f)

        if "prompts" not in data:
            raise ValueError("Configuration must contain 'prompts' key")

        for prompt_data in data["prompts"]:
            prompt = EvaluationPrompt(**prompt_data)
            self.prompts.append(prompt)

    def get_prompts_by_category(self, category: PromptCategory) -> list[EvaluationPrompt]:
        """Get prompts filtered by category."""
        return [p for p in self.prompts if p.category == category]

    def get_prompt_by_id(self, prompt_id: str) -> EvaluationPrompt | None:
        """Get a specific prompt by ID."""
        for prompt in self.prompts:
            if prompt.id == prompt_id:
                return prompt
        return None
