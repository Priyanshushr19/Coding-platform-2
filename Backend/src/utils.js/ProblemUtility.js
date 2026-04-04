import axios from "axios";

function getLanguageById(language) {
  const map = {
    "cpp": 54,          // C++ (GCC)
    "c++": 54,          // alternate written form
    "java": 62,         // Java (OpenJDK)
    "javascript": 63,   // Node.js
    "js": 63            // optional alias
  };

  return map[language?.toLowerCase()] || null;
}




// const submitBatch = async (submissions) => {

//   console.log("object");
//   const options = {
//     method: 'POST',
//     url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//     params: {
//       base64_encoded: 'false'
//     },
//     headers: {
//       'x-rapidapi-key': process.env.JUDGE0_KEY,
//       'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//       'Content-Type': 'application/json'
//     },
//     data: {
//       submissions
//     }
//   };

//   async function fetchData() {
//     try {
//       const response = await axios.request(options);
//       return response.data;
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   return await fetchData();

// }


const submitBatch = async (submissions, retries = 3) => {
  if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
    throw new Error('Invalid submissions payload');
  }

  // Limit batch size to prevent overwhelming Judge0
  const MAX_BATCH_SIZE = 50;
  if (submissions.length > MAX_BATCH_SIZE) {
    throw new Error(`Batch size exceeds maximum of ${MAX_BATCH_SIZE}`);
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions/batch",
        { submissions },
        {
          params: { base64_encoded: "false", wait: false },
          headers: {
            "x-rapidapi-key": process.env.JUDGE0_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "Content-Type": "application/json"
          },
          timeout: 15000 // 15 second timeout
        }
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from Judge0');
      }

      return response.data;

    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      const errorMessage = error.response?.data?.error || error.message;
      
      console.error(`submitBatch ERROR (attempt ${attempt + 1}/${retries}):`, errorMessage);
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw new Error(`Judge0 client error: ${errorMessage}`);
      }
      
      if (isLastAttempt) {
        throw new Error(`Judge0 service unavailable after ${retries} attempts: ${errorMessage}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};


const waiting = async (timer) => {
  setTimeout(() => {
    return 1;
  }, timer);
}

// ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

const submitToken = async (tokens, maxWaitTime = 60000) => {
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    throw new Error('Invalid tokens array');
  }

  const startTime = Date.now();
  const maxPollingTime = maxWaitTime;
  const pollInterval = 1000; // 1 second
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 5;

  while (true) {
    // Check timeout
    if (Date.now() - startTime > maxPollingTime) {
      throw new Error(`Judge0 polling timeout after ${maxPollingTime}ms`);
    }

    try {
      const response = await axios.get(
        "https://judge0-ce.p.rapidapi.com/submissions/batch",
        {
          params: {
            tokens: tokens.join(","),
            base64_encoded: "false",
            fields: "*"
          },
          headers: {
            "x-rapidapi-key": process.env.JUDGE0_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com"
          },
          timeout: 10000 // 10 second timeout per request
        }
      );

      if (!response.data || !response.data.submissions) {
        throw new Error('Invalid response format from Judge0');
      }

      const results = response.data.submissions;

      if (!Array.isArray(results) || results.length !== tokens.length) {
        throw new Error('Mismatch between tokens and results');
      }

      consecutiveErrors = 0; // Reset error counter on success

      // Check if any result is still processing (status 1 = In Queue, 2 = Processing)
      const isPending = results.some(
        (r) => r.status?.id === 1 || r.status?.id === 2
      );

      if (!isPending) {
        // All results are ready
        return results;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

    } catch (error) {
      consecutiveErrors++;
      const errorMessage = error.response?.data?.error || error.message;
      
      console.error(`submitToken ERROR (consecutive: ${consecutiveErrors}):`, errorMessage);
      
      if (consecutiveErrors >= maxConsecutiveErrors) {
        throw new Error(`Judge0 polling failed after ${maxConsecutiveErrors} consecutive errors: ${errorMessage}`);
      }
      
      // Wait longer on errors before retrying
      await new Promise((resolve) => setTimeout(resolve, pollInterval * 2));
    }
  }
};



// const submitToken = async (resultToken) => {

//   const options = {
//     method: 'GET',
//     url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//     params: {
//       tokens: resultToken.join(","),
//       base64_encoded: 'false',
//       fields: '*'
//     },
//     headers: {
//       'x-rapidapi-key': process.env.JUDGE0_KEY,
//       'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//     }
//   };

//   async function fetchData() {
//     try {
//       const response = await axios.request(options);
//       return response.data;
//     } catch (error) {
//       console.error(error);
//     }
//   }


//   while (true) {

//     const result = await fetchData();

//     const IsResultObtained = result.submissions.every((r) => r.status_id > 2);

//     if (IsResultObtained)
//       return result.submissions;


//     await waiting(1000);
//   }
// }


export { getLanguageById, submitBatch, submitToken };
