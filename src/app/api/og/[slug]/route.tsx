import { ImageResponse } from "@vercel/og";
import { getSlopTypeMeta, totalReactions } from "@/lib/domain/slop";
import { getSlopBySlug } from "@/lib/server/slop-service";

export const runtime = "edge";

type OgRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: OgRouteContext) {
  const { slug } = await params;
  const slop = await getSlopBySlug(slug);

  if (!slop) {
    return new Response("Not found", { status: 404 });
  }

  const type = getSlopTypeMeta(slop.type);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          padding: "54px",
          background: "#fff4e8",
          color: "#1f2430",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            border: "4px solid #1f2430",
            borderRadius: "28px",
            background: "#ffffff",
            padding: "34px",
            gap: "34px",
          }}
        >
          <div
            style={{
              width: "430px",
              borderRadius: "20px",
              background: "#da552f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "150px",
              fontWeight: 900,
            }}
          >
            {slop.title.slice(0, 1)}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "24px",
              }}
            >
              <div style={{ fontSize: "32px", fontWeight: 900, color: "#da552f" }}>
                PRODUCT SLOP CERTIFIED
              </div>
              <div
                style={{
                  border: "2px solid #d7dbe5",
                  borderRadius: "999px",
                  padding: "10px 22px",
                  fontSize: "28px",
                  fontWeight: 800,
                }}
              >
                {type.label}
              </div>
            </div>
            <div style={{ marginTop: "54px", fontSize: "78px", fontWeight: 950 }}>
              {slop.title}
            </div>
            <div
              style={{
                marginTop: "24px",
                fontSize: "38px",
                lineHeight: 1.22,
                color: "#586174",
              }}
            >
              {slop.tagline}
            </div>
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "30px",
                color: "#586174",
              }}
            >
              <span>{slop.slopperHandle ?? "anonymous slopper"}</span>
              <span>{totalReactions(slop)} reactions</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
