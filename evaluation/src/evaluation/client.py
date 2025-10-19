"""HTTP client for interacting with the backend API."""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from typing import Any

from aiohttp import ClientError, ClientSession, ClientTimeout
from asyncio_throttle import Throttler

logger = logging.getLogger(__name__)


class BackendClient:
    """Client for interacting with the collaborative agents backend via HTTP API.

    This client handles HTTP communication with the backend for task creation,
    prompt submission, and code evaluation.

    Attributes:
        base_url: The base URL for HTTP requests.
        timeout: Request timeout in seconds.
        throttler: Rate limiter for concurrent requests.
        session: The aiohttp client session.
    """

    def __init__(
        self,
        base_url: str,
        timeout: int = 120,
        max_concurrent: int = 1,
    ) -> None:
        """Initialize the backend client.

        Args:
            base_url: Base URL for HTTP requests (e.g., "http://localhost:3001").
            timeout: Request timeout in seconds (default: 120).
            max_concurrent: Maximum concurrent requests (default: 1).
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = ClientTimeout(total=timeout)
        self.throttler = Throttler(rate_limit=max_concurrent)
        self.session: ClientSession | None = None

    async def __aenter__(self) -> BackendClient:
        """Async context manager entry.

        Returns:
            Self reference for use in async with statements.
        """
        self.session = ClientSession(timeout=self.timeout)
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: Any | None,
    ) -> None:
        """Async context manager exit.

        Args:
            exc_type: Exception type if an exception occurred.
            exc_val: Exception value if an exception occurred.
            exc_tb: Exception traceback if an exception occurred.
        """
        if self.session:
            await self.session.close()

    async def create_document(self) -> str:
        """Create a new room ID for collaboration.

        Returns:
            A unique room ID.
        """
        # Generate a unique room ID client-side since there's no document creation endpoint
        return f"eval_room_{uuid.uuid4().hex[:12]}"

    async def send_prompt(
        self, document_id: str, prompt: str, mode: str = "sequential"
    ) -> dict[str, Any]:
        """Send a prompt to generate code via the tasks API.

        Args:
            document_id: The room ID for the task.
            prompt: The prompt text for code generation.
            mode: Execution mode ("sequential" or "parallel").

        Returns:
            A dictionary containing the response data, including:
            - document_id: The room ID
            - mode: The execution mode
            - prompt: The original prompt
            - content: Generated code content
            - error: Error message if any
            - elapsed_time: Time taken in seconds
            - success: Whether the task succeeded
        """
        async with self.throttler:
            if not self.session:
                raise RuntimeError("Session not initialized. Use async context manager.")

            start_time = time.time()

            try:
                # Map mode to agentName
                agent_name = "sequential" if mode == "sequential" else "outliner"

                # Create task via /api/v1/tasks endpoint
                async with self.session.post(
                    f"{self.base_url}/api/v1/tasks",
                    json={
                        "roomId": document_id,
                        "prompt": prompt,
                        "agentName": agent_name,
                    },
                ) as response:
                    response.raise_for_status()
                    result = await response.json()
                    task_id = result.get("taskId")

                    if not task_id:
                        return {
                            "document_id": document_id,
                            "mode": mode,
                            "prompt": prompt,
                            "content": "",
                            "error": "Failed to create task",
                            "elapsed_time": time.time() - start_time,
                            "success": False,
                        }

                    # Poll for task completion with exponential backoff
                    poll_interval = 0.5  # Start with 500ms
                    max_polls = 240  # Max 2 minutes total
                    for attempt in range(max_polls):
                        await asyncio.sleep(poll_interval)

                        async with self.session.get(
                            f"{self.base_url}/api/v1/tasks/{task_id}"
                        ) as task_response:
                            if task_response.status == 404:
                                # Task not found, might be completed and cleaned up
                                break

                            task_response.raise_for_status()
                            task_data = await task_response.json()

                            if task_data.get("status") == "completed":
                                break
                            elif task_data.get("status") == "failed":
                                return {
                                    "document_id": document_id,
                                    "mode": mode,
                                    "prompt": prompt,
                                    "content": "",
                                    "error": task_data.get("error", "Task failed"),
                                    "elapsed_time": time.time() - start_time,
                                    "success": False,
                                }

                        # Exponential backoff with max of 5 seconds
                        poll_interval = min(poll_interval * 1.1, 5.0)

                    # Get the generated content from the room
                    content = await self._get_room_text(document_id)

                    return {
                        "document_id": document_id,
                        "mode": mode,
                        "prompt": prompt,
                        "content": content,
                        "error": None,
                        "elapsed_time": time.time() - start_time,
                        "success": True,
                    }

            except Exception as e:
                logger.error(f"Failed to send prompt: {e}")
                return {
                    "document_id": document_id,
                    "mode": mode,
                    "prompt": prompt,
                    "content": "",
                    "error": str(e),
                    "elapsed_time": time.time() - start_time,
                    "success": False,
                }

    async def _get_room_text(self, room_id: str) -> str:
        """Get the current text content of a room.

        Args:
            room_id: The ID of the room to retrieve.

        Returns:
            The room text content as a string.
        """
        if not self.session:
            return ""

        try:
            async with self.session.get(f"{self.base_url}/api/v1/rooms/{room_id}/text") as response:
                response.raise_for_status()
                data = await response.json()
                content: str = data.get("text", "")
                return content
        except Exception as e:
            logger.error(f"Failed to get room text: {e}")
            return ""

    async def evaluate_code(self, code: str) -> dict[str, Any]:
        """Evaluate code quality using the backend evaluation API.

        Args:
            code: The code to evaluate.

        Returns:
            A dictionary containing evaluation results:
            - success: Whether evaluation succeeded
            - overall_score: Overall quality score (0-100)
            - code_quality: Code quality score
            - architecture: Architecture score
            - performance: Performance score
            - accessibility: Accessibility score
            - summary: Summary text
            - error: Error message if evaluation failed
        """
        async with self.throttler:
            if not self.session:
                raise RuntimeError("Session not initialized. Use async context manager.")

            try:
                async with self.session.post(
                    f"{self.base_url}/api/v1/evaluation/evaluate", json={"code": code}
                ) as response:
                    response.raise_for_status()
                    data = await response.json()

                    # Check if this is an error response
                    if "error" in data:
                        return {
                            "success": False,
                            "error": data.get("error", "Evaluation failed"),
                        }

                    # Backend returns the evaluation directly
                    return {
                        "success": True,
                        "overall_score": data.get("overallScore", 0),
                        "code_quality": data.get("codeQuality", {}).get("score", 0),
                        "architecture": data.get("architectureAndState", {}).get("score", 0),
                        "performance": data.get("runtimePerformance", {}).get("score", 0),
                        "accessibility": data.get("accessibilityAndUX", {}).get("score", 0),
                        "summary": data.get("summary", ""),
                    }

            except ClientError as e:
                logger.error(f"Failed to evaluate code: {e}")
                return {
                    "success": False,
                    "error": str(e),
                }


class MockBackendClient(BackendClient):
    """Mock client for testing without a real backend.

    This client simulates backend responses for testing purposes.
    All methods return mock data with simulated delays.
    """

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        """Initialize mock client.

        Args:
            *args: Positional arguments (ignored).
            **kwargs: Keyword arguments (ignored).
        """
        super().__init__(base_url=kwargs.get("base_url", "http://mock"))
        self.mock_delay = 0.5

    async def __aenter__(self) -> MockBackendClient:
        """Mock context manager entry."""
        # Don't create a real session for mock
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: Any | None,
    ) -> None:
        """Mock context manager exit."""
        pass

    async def create_document(self) -> str:
        """Create a mock room ID.

        Returns:
            A mock room ID.
        """
        await asyncio.sleep(self.mock_delay)
        return f"mock_room_{int(time.time())}"

    async def send_prompt(
        self, document_id: str, prompt: str, mode: str = "sequential"
    ) -> dict[str, Any]:
        """Send a mock prompt.

        Args:
            document_id: The room ID.
            prompt: The prompt text.
            mode: The execution mode.

        Returns:
            Mock response data.
        """
        await asyncio.sleep(self.mock_delay * 2)

        # Generate mock code based on prompt
        mock_code = f"""// Generated code for: {prompt[:50]}...
import React from 'react';

const MockComponent: React.FC = () => {{
  return (
    <div className="mock-component">
      <h1>Mock Component</h1>
      <p>This is a mock generated component.</p>
    </div>
  );
}};

export default MockComponent;"""

        return {
            "document_id": document_id,
            "mode": mode,
            "prompt": prompt,
            "content": mock_code,
            "error": None,
            "elapsed_time": self.mock_delay * 2,
            "success": True,
        }

    async def evaluate_code(self, code: str) -> dict[str, Any]:
        """Mock code evaluation.

        Args:
            code: The code to evaluate.

        Returns:
            Mock evaluation scores.
        """
        await asyncio.sleep(self.mock_delay)

        import random

        random.seed(len(code))  # Deterministic based on code

        base_score = 75 + random.uniform(-5, 20)

        return {
            "success": True,
            "overall_score": base_score,
            "code_quality": base_score + random.uniform(-5, 5),
            "architecture": base_score + random.uniform(-5, 5),
            "performance": base_score + random.uniform(-5, 5),
            "accessibility": base_score + random.uniform(-5, 5),
            "summary": "Mock evaluation: Code shows good structure with room for improvement.",
        }
