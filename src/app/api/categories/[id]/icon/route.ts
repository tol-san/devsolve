import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import { validateIconFile } from "@/lib/validations/category";

const idSchema = z.uuid("Category id must be a UUID");

type Context = { params: Promise<{ id: string }> };

async function resolveId(context: Context) {
  const { id } = await context.params;
  return idSchema.safeParse(id);
}

const badId = () =>
  NextResponse.json({ message: "Category id must be a UUID" }, { status: 400 });

export async function PUT(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const id = await resolveId(context);
  if (!id.success) return badId();

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

  const reason = validateIconFile(file);
  if (reason) {
    return NextResponse.json({ message: reason }, { status: 400 });
  }

  const body = new FormData();
  body.append("file", file, file.name);

  try {
    const upstream = await upstreamFetch(`/categories/${id.data}/icon`, token, {
      method: "PUT",
      body,
    });
    return relay(upstream, "The icon could not be uploaded.");
  } catch {
    return unreachable("category");
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const id = await resolveId(context);
  if (!id.success) return badId();

  try {
    const upstream = await upstreamFetch(`/categories/${id.data}/icon`, token, {
      method: "DELETE",
    });
    return relay(upstream, "The icon could not be removed.");
  } catch {
    return unreachable("category");
  }
}
