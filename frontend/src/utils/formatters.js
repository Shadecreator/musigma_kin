const MAX_FILENAME_CHARS = 40;

export function truncateName(name) {
  if (!name) return "";
  if (name.length <= MAX_FILENAME_CHARS) return name;
  return `${name.slice(0, MAX_FILENAME_CHARS)}...`;
}

export function prettyPrintContent(content) {
  if (content === null || content === undefined) return "";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
}
