import { textFor } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ text: await textFor("plain") }, {
    headers: { "Cache-Control": "no-store" }
  });
}
