/**
 * Validates a URL is safe to use in an href attribute.
 * Blocks javascript:, data:, vbscript: and other dangerous protocols.
 * Returns the URL if safe, or "#" if dangerous.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "#";

  const trimmed = url.trim();
  if (!trimmed) return "#";

  // Block dangerous protocols
  const lower = trimmed.toLowerCase().replace(/\s/g, "");
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return "#";
  }

  // Allow http, https, and protocol-relative URLs
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("//")
  ) {
    return trimmed;
  }

  // If no protocol, prepend https://
  return `https://${trimmed}`;
}
