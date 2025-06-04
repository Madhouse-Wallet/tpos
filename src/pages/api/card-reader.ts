// Add this function to your services/apiService.js file or create a new service file

export const listenForHardwareInput = async () => {
  try {
    const response = await fetch("/api/listen-input/route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // No body needed for this request
    });

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(
        `Expected JSON response but got: ${text.substring(0, 100)}...`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error calling listen-input API:", error);
    throw error;
  }
};
