export const prerender = false;

import { REGIONS, DEFAULT_REGION, API_HEADERS } from "../../../config/vinfast";
import crypto from "crypto";

// Restrict proxy usage to known VinFast API namespaces used by the dashboard.
const ALLOWED_PATH_PREFIXES = [
  "ccarusermgnt/api/v1/user-vehicle",
  "modelmgmt/api/v2/vehicle-model/",
  "ccaraccessmgmt/api/v1/telemetry/",
  "ccarcharging/api/v1/stations/",
  "ccarcharging/api/v1/charging-sessions/search",
];

// Paths that require X-HASH + X-HASH-2 signing (beyond Bearer token)
const SIGNED_PATH_PREFIXES = ["ccaraccessmgmt/", "ccarcharging/"];

/**
 * Generate X-HASH for VinFast API request
 * Algorithm: HMAC-SHA256(secretKey, message) -> Base64
 * From HMACInterceptor: method_path_[vin_]secret_timestamp (lowercase)
 */
function generateXHash(method, apiPath, vin, timestamp, secretKey) {
  // Remove query string from path
  const pathWithoutQuery = apiPath.split("?")[0];

  // Ensure path starts with /
  const normalizedPath = pathWithoutQuery.startsWith("/")
    ? pathWithoutQuery
    : "/" + pathWithoutQuery;

  // Build message: method_path_[vin_]secret_timestamp
  const parts = [method, normalizedPath];
  if (vin) {
    parts.push(vin);
  }
  parts.push(secretKey);
  parts.push(String(timestamp));

  // Join with underscore and lowercase
  const message = parts.join("_").toLowerCase();

  // HMAC-SHA256
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);

  // Base64 encode
  return hmac.digest("base64");
}

/**
 * Generate X-HASH-2 for VinFast API request
 * Reverse-engineered from libsecure.so (VFCrypto.signRequest)
 *
 * Algorithm:
 *   1. Strip leading "/" from path
 *   2. Replace all "/" with "_" in path
 *   3. Concatenate: platform_[vinCode_]identifier_path_method_timestamp
 *   4. Lowercase the entire string
 *   5. HMAC-SHA256 with key "ConnectedCar@6521" (from FUN_0012758c)
 *   6. Base64 encode result
 */
function generateXHash2({
  platform,
  vinCode,
  identifier,
  path,
  method,
  timestamp,
}) {
  // Step 1: Strip leading "/" from path
  let normalizedPath = path;
  if (normalizedPath.startsWith("/")) {
    normalizedPath = normalizedPath.substring(1);
  }

  // Step 2: Replace "/" with "_" in path
  normalizedPath = normalizedPath.replace(/\//g, "_");

  // Step 3: Build message parts in order from native code
  const parts = [platform];
  if (vinCode) {
    parts.push(vinCode);
  }
  parts.push(identifier);
  parts.push(normalizedPath);
  parts.push(method);
  parts.push(String(timestamp));

  // Step 4: Join with "_" and lowercase
  const message = parts.join("_").toLowerCase();

  // Step 5: HMAC-SHA256 with native secret key
  const hash2Key = "ConnectedCar@6521";
  const hmac = crypto.createHmac("sha256", hash2Key);
  hmac.update(message);
  const hash2 = hmac.digest("base64");

  return hash2;
}

export const ALL = async ({ request, params, cookies, locals }) => {
  const apiPath = params.path;

  const isAllowedPath = ALLOWED_PATH_PREFIXES.some((prefix) =>
    apiPath.startsWith(prefix),
  );
  if (!isAllowedPath) {
    return new Response(JSON.stringify({ error: "Proxy path not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const urlObj = new URL(request.url);
  const region = urlObj.searchParams.get("region") || DEFAULT_REGION;
  const regionConfig = REGIONS[region] || REGIONS[DEFAULT_REGION];

  // Strip internal params from query
  const targetSearchParams = new URLSearchParams(urlObj.search);
  targetSearchParams.delete("region");

  const searchStr = targetSearchParams.toString();
  const targetUrl = `${regionConfig.api_base}/${apiPath}${searchStr ? "?" + searchStr : ""}`;

  const accessToken = cookies.get("access_token")?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const clientHeaders = request.headers;
  const vinHeader = clientHeaders.get("x-vin-code");
  const playerHeader = clientHeaders.get("x-player-identifier");

  // Get request body for POST/PUT/PATCH
  let requestBody = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    requestBody = await request.text();
  }

  // Only telemetry endpoints require X-HASH and X-HASH-2 signing.
  // Other endpoints (user-vehicle, vehicle-model) only need Bearer token.
  const requiresSigning = SIGNED_PATH_PREFIXES.some((prefix) =>
    apiPath.startsWith(prefix),
  );

  const proxyHeaders = {
    ...API_HEADERS, // standard headers
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  if (requiresSigning) {
    const runtimeEnv = locals?.runtime?.env || import.meta.env || {};
    let secretKey =
      runtimeEnv.VINFAST_XHASH_SECRET ||
      (typeof process !== "undefined"
        ? process.env.VINFAST_XHASH_SECRET
        : undefined);

    if (!secretKey && import.meta.env.DEV) {
      secretKey = "Vinfast@2025";
      console.warn("DEV fallback: using default VINFAST_XHASH_SECRET.");
    }

    if (!secretKey) {
      console.error(
        "CRITICAL: VINFAST_XHASH_SECRET environment variable is missing",
      );
      return new Response(
        JSON.stringify({ error: "Server Configuration Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const timestamp = Date.now();
    const xTimestamp = String(timestamp);

    const xHash = generateXHash(
      request.method,
      apiPath,
      vinHeader,
      timestamp,
      secretKey,
    );

    const xHash2 = generateXHash2({
      platform: API_HEADERS["x-device-platform"] || "android",
      vinCode: vinHeader || null,
      identifier: API_HEADERS["x-device-identifier"] || "",
      path: "/" + apiPath,
      method: request.method,
      timestamp: xTimestamp,
    });

    proxyHeaders["X-HASH"] = xHash;
    proxyHeaders["X-HASH-2"] = xHash2;
    proxyHeaders["X-TIMESTAMP"] = xTimestamp;
    console.log(
      `[Proxy] Signed ${request.method} /${apiPath} with X-HASH + X-HASH-2`,
    );
  }

  if (vinHeader) proxyHeaders["x-vin-code"] = vinHeader;
  if (playerHeader) proxyHeaders["x-player-identifier"] = playerHeader;

  const init = {
    method: request.method,
    headers: proxyHeaders,
  };

  if (requestBody) {
    init.body = requestBody;
  }

  try {
    console.log(`[Proxy] → ${request.method} ${targetUrl}`);
    const response = await fetch(targetUrl, init);
    const data = await response.text();

    console.log(
      `[Proxy] ← ${response.status} (${data.length} bytes) for ${request.method} /${apiPath}`,
    );
    if (response.status >= 400) {
      console.log(`[Proxy] Error body: ${data.substring(0, 500)}`);
    }

    return new Response(data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(`[Proxy Error] ${request.method} /${apiPath}:`, e);
    return new Response(JSON.stringify({ error: "Internal Proxy Error" }), {
      status: 500,
    });
  }
};
