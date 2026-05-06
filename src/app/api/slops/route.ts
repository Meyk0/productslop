import { createSlopFromUnknown } from "@/lib/server/slop-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slop = await createSlopFromUnknown(body);
    return Response.json({ slop }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to submit slop." },
      { status: 400 },
    );
  }
}
