/**
 * Serverless Function - Token Verification
 *
 * Verifies Salla Embedded SDK tokens using
 * Salla's current Token Introspection API.
 */

export default async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    // Read request body
    const body = await req.json();

    const token = body?.token;
    const appId = body?.appId;

    // Validate token
    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate App ID
    if (!appId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "App ID is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Verifying Salla token", {
      appId,
      token: "[REDACTED]",
    });

    // Current Salla Token Introspection API
    const response = await fetch(
      "https://api.salla.dev/exchange-authority/v1/introspect",
      {
        method: "POST",
        headers: {
          "S-Source": appId,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      }
    );

    console.log(
      "Salla introspection response:",
      response.status
    );

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      result = {
        success: false,
        error: text || "Invalid response from Salla",
      };
    }

    return new Response(
      JSON.stringify(result),
      {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error) {
    console.error(
      "Token verification error:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
