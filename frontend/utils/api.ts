/**
 * Resolves the backend API URL for KrishiKotha AI.
 * Automatically falls back to the live Render cloud backend when running in production (e.g. on Vercel),
 * preventing Mixed Content / localhost connection failures when NEXT_PUBLIC_API_URL is omitted or set to localhost.
 */
export function getApiUrl(): string {
  if (
    process.env.NEXT_PUBLIC_API_URL &&
    !process.env.NEXT_PUBLIC_API_URL.includes("localhost") &&
    !process.env.NEXT_PUBLIC_API_URL.includes("127.0.0.1")
  ) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    window.location.hostname !== "::1"
  ) {
    return "https://hackos-multiagent-agri-solution.onrender.com";
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}
