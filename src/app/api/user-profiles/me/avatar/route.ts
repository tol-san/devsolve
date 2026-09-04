import { NextResponse, type NextRequest } from "next/server";
import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import { validateAvatarFile } from "@/lib/validations/avatar";

export async function PUT(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Request must be multipart/form-data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "A `file` part is required" },
      { status: 400 },
    );
  }

  const reason = validateAvatarFile(file);
  if (reason) {
    return NextResponse.json({ message: reason }, { status: 400 });
  }

  const body = new FormData();
  body.append("file", file, file.name);

  try {
    const upstream = await upstreamFetch("/user-profiles/me/avatar", token, {
      method: "PUT",
      body,
    });
    return relay(upstream, "Your photo could not be uploaded.");
  } catch {
    return unreachable("profile");
  }
}

export async function DELETE(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const upstream = await upstreamFetch("/user-profiles/me/avatar", token, {
      method: "DELETE",
    });
    return relay(upstream, "Your photo could not be removed.");
  } catch {
    return unreachable("profile");
  }
}
