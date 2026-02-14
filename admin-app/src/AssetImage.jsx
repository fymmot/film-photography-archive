import { useState, useEffect, useRef } from "react";

/** True if URL is the proxy path (would 404 for drafts; proxy serves it for published). */
function isProxyPathUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = url.trim();
    if (u.startsWith("blob:")) return false;
    const pathname = u.startsWith("http") ? new URL(u).pathname : u;
    return pathname.includes("/src/assets/") || pathname.startsWith("src/assets/");
  } catch {
    return false;
  }
}

/**
 * Renders an image from CMS via getAsset().
 * - Blob URL (draft): use immediately.
 * - Path URL (/src/assets/...): defer and retry getAsset a few times so draft blob can appear;
 *   then use path (proxy serves published images; drafts 404 and we hide after one error).
 */
export function AssetImage({ getAsset, path, alt = "", className }) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const failedUrlRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  useEffect(() => {
    if (!path) {
      setSrc(null);
      failedUrlRef.current = null;
      return;
    }
    let cancelled = false;
    // On odd retries try the other path form (CMS may store draft as "src/..." or "/src/...").
    const pathToTry =
      retry % 2 === 1 && path.startsWith("/")
        ? path.slice(1)
        : retry % 2 === 1
          ? "/" + path.replace(/^\//, "")
          : path;
    const value = getAsset(pathToTry);
    const promise = value && typeof value.then === "function" ? value : Promise.resolve(value);
    promise
      .then((resolved) => {
        if (cancelled) return;
        const url = resolved ? (typeof resolved.toString === "function" ? resolved.toString() : String(resolved)) : null;
        if (!url) {
          setSrc(null);
          return;
        }
        if (url === failedUrlRef.current) {
          if (retry < 15) {
            retryTimeoutRef.current = setTimeout(() => setRetry((r) => r + 1), 400);
          }
          return;
        }
        if (isProxyPathUrl(url) && retry < 5) {
          // Likely draft: give CMS time to return blob before we hit the proxy (404).
          retryTimeoutRef.current = setTimeout(() => setRetry((r) => r + 1), 250);
          return;
        }
        failedUrlRef.current = null;
        setSrc(url);
        setError(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [getAsset, path, retry]);

  const handleError = () => {
    if (src) failedUrlRef.current = src;
    setSrc(null);
    if (retry < 15) {
      retryTimeoutRef.current = setTimeout(() => setRetry((r) => r + 1), 500);
    }
  };

  if (error || !src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={handleError}
    />
  );
}
