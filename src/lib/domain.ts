export function normalizeAndValidateDomain(input: string): string {
  let d = input.trim();

  //  Add https:// if missing
  if (!/^https?:\/\//i.test(d)) d = "https://" + d;

  // Remove trailing slashes
  d = d.replace(/\/+$/, "");

  // Validate and parse as a real URL
  let url: URL;
  try {
    url = new URL(d);
  } catch {
    throw new Error("Invalid URL format.");
  }

  // Check that the path is only "/" (i.e. no subpath like /courses/123)
  if (url.pathname !== "/" && url.pathname !== "") {
    throw new Error("Please enter only the base Canvas URL (no extra path).");
  }

  // Hostname sanity check
  const hostname = url.hostname.toLowerCase();
  if (!hostname.includes("."))
    throw new Error("Domain must include a dot, e.g. canvas.mycollege.edu");

  // Return normalized URL: always include protocol, no trailing slash
  return `${url.protocol}//${hostname}`;
}
