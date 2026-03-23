import { z } from "zod";

const HAS_ANY_PROTOCOL = /^[a-z][a-z0-9+.-]*:\/\//i;

export const BaseUrlSchema = z
  .string()
  .trim()
  .min(1, "Institution URL is required")
  .transform((s) => {
    // If user provided some protocol but it's not https → reject later
    if (HAS_ANY_PROTOCOL.test(s)) {
      return s;
    }
    return `https://${s}`;
  })
  .superRefine((s, ctx) => {
    let u: URL;
    try {
      u = new URL(s);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Please enter a valid institution URL",
      });
      return;
    }

    // UX: require https (matches your backend)
    if (u.protocol !== "https:") {
      ctx.addIssue({
        code: "custom",
        message: "Only https:// URLs are allowed for Canvas institutions.",
      });
      return;
    }

    if (u.username || u.password) {
      ctx.addIssue({
        code: "custom",
        message: "URL must not include credentials",
      });
      return;
    }

    // Still strict on path
    if (u.pathname !== "" && u.pathname !== "/") {
      ctx.addIssue({
        code: "custom",
        message: "Please enter only the base Canvas URL (no extra path).",
      });
      return;
    }

    const labels = u.hostname.split(".");
    if (labels.length < 2 || labels.some((p) => p.length === 0)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Please enter a full Canvas domain (e.g. canvas.mycollege.edu).",
      });
      return;
    }
  })
  .transform((s) => {
    const u = new URL(s);
    return `${u.protocol}//${u.hostname}`;
  });

export const AddSchema = z.object({
  domainName: z
    .string()
    .trim()
    .min(1, "Institution name is required")
    .max(40, "Institution name is too long"),
  baseUrl: BaseUrlSchema,
  token: z
    .string()
    .min(10, "Personal token too short. Make sure it's correct."),
});

export const UpdateTokenSchema = z.object({
  token: z
    .string()
    .min(10, "Personal token too short. Make sure it's correct."),
});
