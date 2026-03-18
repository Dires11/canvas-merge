export function generateUrlSlug(url: string): string {
  return url
    .replace("https://", "")
    .replace(/\./g, "-")
    .replace(/\//g, "-")
    .replace(/-+$/, "");
}
