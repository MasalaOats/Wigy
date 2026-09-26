import { storageStatus } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(storageStatus(), {
    headers: { "Cache-Control": "no-store" }
  });
}
