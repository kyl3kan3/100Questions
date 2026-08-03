export function GET() {
  return Response.json(
    { status: "ok", service: "100 Questions public API" },
    { headers: { "cache-control": "no-store" } },
  );
}
