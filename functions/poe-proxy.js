export async function handlePoeProxy(request, env, ctx) {
  // CORS headers (lock down origin later if desired)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Preflight
  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { model, messages, max_tokens, temperature } = payload;

    const apiKey = env.POE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server missing POE_API_KEY" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    console.log("Making request to Poe API with model:", model);

    const response = await fetch("https://api.poe.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature,
      }),
    });

    const data = await response.json().catch(() => null);
    console.log("Poe API response status:", response.status);

    if (!response.ok) {
      console.error("Poe API error:", data);
      const message =
        data?.error?.message ||
        data?.message ||
        "API request failed";

      return new Response(JSON.stringify({ error: message }), {
        status: response.status,
        headers: corsHeaders,
      });
    }

    console.log("Success from Poe API");
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error: " + (error?.message || String(error)) }),
      { status: 500, headers: corsHeaders }
    );
  }
}