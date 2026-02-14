import { Handler } from "@netlify/functions";

/**
 * Proxies image requests from DecapCMS admin to the GitHub repo.
 * Uses GITHUB_REPO_OWNER and GITHUB_REPO_NAME from env (no hardcoded repo).
 * GITHUB_TOKEN optional: set for private repos, omit for public.
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;
const MAIN_BRANCH = process.env.GITHUB_BRANCH ?? "main";

/** Path when request hits the function (rewrite includes :splat) */
const FUNCTION_PREFIX = "/.netlify/functions/serve-cms-image/";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!REPO_OWNER || !REPO_NAME) {
    return {
      statusCode: 500,
      body:
        "Missing GITHUB_REPO_OWNER or GITHUB_REPO_NAME. Set them in Netlify environment variables.",
    };
  }

  const path = event.path ?? event.rawUrl ?? "";
  const filePath = path.startsWith(FUNCTION_PREFIX)
    ? path.slice(FUNCTION_PREFIX.length).replace(/^\/+/, "")
    : path.startsWith("/src/assets/images/photos/")
      ? path.replace(/^\/src\/assets\/images\/photos\/?/, "")
      : "";
  if (!filePath || filePath.includes("..")) {
    return { statusCode: 400, body: "Invalid path" };
  }

  const apiPath = `src/assets/images/photos/${encodeURIComponent(filePath)}`;
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";

  // Optional ref (branch/tag/SHA) for draft content; default is main
  const ref =
    event.queryStringParameters?.ref ?? event.queryStringParameters?.branch ?? MAIN_BRANCH;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${apiPath}?ref=${encodeURIComponent(ref)}`,
      { headers }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("GitHub API error", res.status, apiPath, text.slice(0, 200));
      if (res.status === 404) {
        return { statusCode: 404, body: "Image not found" };
      }
      if (res.status === 401) {
        return { statusCode: 502, body: "GitHub auth failed (check GITHUB_TOKEN for private repos)" };
      }
      if (res.status === 403) {
        const isRateLimit = text.includes("rate limit");
        return {
          statusCode: 502,
          body: isRateLimit
            ? "GitHub rate limit exceeded. Set GITHUB_TOKEN in .env (and Netlify) for a higher limit."
            : "GitHub forbidden (token scope or repo access)",
        };
      }
      return { statusCode: 502, body: `GitHub API ${res.status}` };
    }

    const body = await res.arrayBuffer();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
      },
      body: Buffer.from(body).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error("serve-cms-image error", err);
    return { statusCode: 500, body: "Internal server error" };
  }
};
