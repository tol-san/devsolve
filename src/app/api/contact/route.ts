import { NextResponse, type NextRequest } from "next/server";
import { badJson, validationFailed } from "@/lib/api/proxy";
import { contactMessageSchema } from "@/lib/validations/contact";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badJson();
  }

  const parsed = contactMessageSchema.safeParse(payload);
  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  const { name, email, subject, message } = parsed.data;

  // Log the received contact message for operations & audit
  console.info(`[Contact Submission] from "${name}" <${email}> | Subject: "${subject}" | Length: ${message.length} chars`);

  return NextResponse.json(
    {
      success: true,
      message: "Thank you for reaching out! We have received your message and will reply within one business day.",
      data: {
        name,
        email,
        subject,
        receivedAt: new Date().toISOString(),
      },
    },
    { status: 200 }
  );
}
