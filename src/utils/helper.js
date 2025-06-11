export function filterHexInput(value, allowedCharsRegex, maxLength) {
  if (!value || typeof value !== "string") return "";

  // Filter invalid characters
  let filtered = value.replace(allowedCharsRegex, "");

  // Trim to max length
  if (filtered.length > maxLength) {
    filtered = filtered.slice(0, maxLength);
  }

  return filtered;
}
