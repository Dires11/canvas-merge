import { Prisma } from "@/generated/prisma/client";

export function getPrismaErrorMessage(
  error: unknown,
  fallback: string,
): { error: string; status: number } {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return { error: "A matching record already exists.", status: 409 };
      case "P2025":
        return { error: "Record not found.", status: 404 };
      default:
        return {
          error: `${fallback} (code: ${error.code})`,
          status: 400,
        };
    }
  }

  return { error: fallback, status: 500 };
}
