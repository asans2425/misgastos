export function getRequestOrigin(requestHeaders: Headers) {
  const requestOrigin = requestHeaders.get("origin");

  if (requestOrigin) {
    return requestOrigin;
  }

  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0];
  const protocol = forwardedProto ?? (host?.startsWith("localhost") ? "http" : "https");

  return host ? `${protocol}://${host}` : null;
}
