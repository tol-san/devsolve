import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import {
  badJson,
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import { categoryPatchSchema } from "@/lib/validations/category";

const idSchema = z.uuid("Category id must be a UUID");

type Context = { params: Promise<{ id: string }> };

async function resolveId(context: Context) {
  const { id } = await context.params;
  return idSchema.safeParse(id);
}

const badId = () =>
  NextResponse.json({ message: "Category id must be a UUID" }, { status: 400 });

export async function GET(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const id = await resolveId(context);
  if (!id.success) return badId();

  try {
    const upstream = await upstreamFetch(`/categories/${id.data}`, token);
    return relay(upstream, "Unable to load that category.");
  } catch {
    return unreachable("category");
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const id = await resolveId(context);
  if (!id.success) return badId();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = categoryPatchSchema.safeParse(payload);
  if (!parsed.success) {
    const { formErrors, fieldErrors } = z.flattenError(parsed.error);
    return NextResponse.json(
      { message: "Validation failed", formErrors, fieldErrors },
      { status: 400 },
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { message: "No updatable fields were provided" },
      { status: 400 },
    );
  }

  try {
    const upstream = await upstreamFetch(`/categories/${id.data}`, token, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
    });
    return relay(upstream, "The category could not be updated.");
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
    const upstream = await upstreamFetch(`/categories/${id.data}`, token, {
      method: "DELETE",
    });
    return relay(upstream, "The category could not be deleted.");
  } catch {
    return unreachable("category");
  }
}
