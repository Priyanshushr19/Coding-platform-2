import axios from "axios";

// Service to run a single custom code execution against Judge0.
// This uses the single-submission endpoint with wait=true to get the result in one call.
export const runCustomCode = async ({ language_id, source_code, stdin }) => {
  if (!language_id || !source_code) {
    throw new Error("language_id and source_code are required");
  }

  try {
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions",
      {
        language_id,
        source_code,
        stdin: stdin ?? "",
      },
      {
        params: {
          base64_encoded: "false",
          wait: true,
        },
        headers: {
          "x-rapidapi-key": process.env.JUDGE0_KEY,
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const data = response.data || {};

    return {
      stdout: data.stdout ?? null,
      stderr: data.stderr ?? null,
      compile_output: data.compile_output ?? null,
      time: data.time ?? null,
      memory: data.memory ?? null,
    };
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.error || error.message || "Judge0 execution failed";

    // For 4xx errors, treat as client error.
    if (status && status >= 400 && status < 500) {
      const clientError = new Error(`Judge0 client error: ${message}`);
      clientError.status = 400;
      throw clientError;
    }

    const serverError = new Error(
      `Judge0 service unavailable: ${message}`
    );
    serverError.status = 502;
    throw serverError;
  }
};

