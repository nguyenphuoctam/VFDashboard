export const prerender = false;

import { REGIONS, DEFAULT_REGION, API_HEADERS } from "../../../config/vinfast";

export const ALL = async ({ request, params }) => {
  const path = params.path;
  const urlObj = new URL(request.url);
  const region = urlObj.searchParams.get("region") || DEFAULT_REGION;
  const regionConfig = REGIONS[region] || REGIONS[DEFAULT_REGION];

  // Determine target base URL
  // Vinfast sets different bases for different services, but our config.js seemed to use a single api_base.
  // We need to route properly.
  // telemetry -> ccaraccessmgmt
  // user-vehicle -> ccarusermgnt

  // Actually, our previous implementation in backend/server.js was cleaner because it used the VinFastAPI class which handled path construction.
  // Here we are building a raw proxy. Ideally the CLIENT should send the full path relative to the base, or we decide here.
  // The client sends `api/proxy/ccarusermgnt/api/v1/...`.

  const targetUrl = `${regionConfig.api_base}/${path}${urlObj.search}`;

  const clientHeaders = request.headers;

  // Forward Auth Header
  const authHeader = clientHeaders.get("Authorization");
  const vinHeader = clientHeaders.get("x-vin-code");

  const proxyHeaders = {
    ...API_HEADERS, // standard headers
    "Content-Type": "application/json",
  };

  if (authHeader) proxyHeaders["Authorization"] = authHeader;
  if (vinHeader) proxyHeaders["x-vin-code"] = vinHeader;

  const init = {
    method: request.method,
    headers: proxyHeaders,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const response = await fetch(targetUrl, init);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
