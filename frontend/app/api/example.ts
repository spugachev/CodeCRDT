/**
 * API Client Usage Examples
 */

import { getApi, ApiError, ErrorCode } from "./index";

// Basic usage
async function basicExample() {
  const api = getApi();

  // Health check
  const health = await api.health.check();
  console.log("Health:", health);

  // Submit task
  const { taskId } = await api.task.submit("room-id", "Generate code");

  // Get task status
  const task = await api.task.getTask(taskId);
  console.log("Task:", task);
}

// With error handling
async function errorHandling() {
  const api = getApi();

  try {
    const result = await api.task.submit("room-id", "test");
    console.log("Success:", result);
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.code) {
        case ErrorCode.UNAUTHORIZED:
          console.log("Please login");
          break;
        case ErrorCode.NETWORK_ERROR:
          console.log("Check your connection");
          break;
        default:
          console.log("Error:", error.message);
      }
    }
  }
}

// With polling
async function pollingExample() {
  const api = getApi();

  const { taskId } = await api.task.submit(
    "room-id",
    "Generate React component"
  );

  const result = await api.task.pollTask(taskId, {
    interval: 1000,
    maxAttempts: 30,
    onProgress: (task) => {
      console.log(`Status: ${task.status}`);
    },
  });

  console.log("Completed:", result);
}

// Authentication
async function authExample() {
  const api = getApi();

  // Set token
  api.auth.setToken({
    accessToken: "your-token",
    refreshToken: "refresh-token",
  });

  // Listen for auth events
  api.auth.onUnauthorized(() => {
    window.location.href = "/login";
  });

  // Check auth status
  if (api.auth.isAuthenticated()) {
    // Make authenticated requests
    const tasks = await api.task.getAllTasks();
    console.log("Tasks:", tasks);
  }

  // Clear auth
  api.auth.clearToken();
}

// SSR usage
export function createSSRApi(token?: string) {
  const api = getApi();

  if (token) {
    api.auth.setToken({ accessToken: token });
  }

  return api;
}
