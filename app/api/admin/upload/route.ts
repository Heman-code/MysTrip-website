import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    console.error("admin/upload: failed to parse request body", {
      contentType: req.headers.get("content-type"),
      contentLength: req.headers.get("content-length"),
      userAgent: req.headers.get("user-agent"),
    });
    return NextResponse.json(
      { error: "The upload request arrived incomplete. Please try again." },
      { status: 400 }
    );
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        const role = (session?.user as { role?: string } | undefined)?.role;
        if (!session || role !== "admin") {
          throw new Error("Forbidden");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
