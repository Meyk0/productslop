import { type NextRequest, NextResponse } from "next/server";
import { parseReslopRequest } from "@/lib/domain/reslop";
import { reslopByToken } from "@/lib/server/slop-service";

type ReslopRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: NextRequest, { params }: ReslopRouteProps) {
  try {
    const { slug } = await params;
    const parsed = parseReslopRequest(await request.json());

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    const slop = await reslopByToken(parsed.manageToken, slug);
    return NextResponse.json({ slop });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to reslop this launch." },
      { status: 400 },
    );
  }
}
