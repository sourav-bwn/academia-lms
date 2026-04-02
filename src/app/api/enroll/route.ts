import { NextResponse } from "next/server";

const TEACHER_EMAIL = "souravbwn77@gmail.com";

export async function POST(request: Request) {
  try {
    const { name, className, medium, contact, email, course } =
      await request.json();

    if (!name || !className || !medium || !contact || !email || !course) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Send email notification using Web3Forms (free email service)
    let emailSent = false;
    try {
      const emailResponse = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_KEY || "7ec08303-325f-4c82-ad68-6e64c18b3e2d",
          subject: `New Admission Enquiry - ${name} | ACADEMIA`,
          from_name: "ACADEMIA LMS",
          to_email: TEACHER_EMAIL,
          replyto: email,
          name: name,
          class: className,
          medium: medium,
          contact: contact,
          email: email,
          course: course,
          message: `New Admission Enquiry Received\n\nStudent Details:\n- Name: ${name}\n- Class: ${className}\n- Medium: ${medium}\n- Contact: ${contact}\n- Email: ${email}\n- Desired Course: ${course}\n\nPlease contact the student at ${contact} or reply to ${email}.\n\n---\nThis email was sent from ACADEMIA LMS`,
        }),
      });
      const emailData = await emailResponse.json();
      emailSent = emailData.success === true;
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    // Try to store in database (gracefully handle if DB is not connected)
    let dbSaved = false;
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.enquiry.create({
        data: {
          name,
          className,
          medium,
          contact,
          email,
          course,
        },
      });
      dbSaved = true;
    } catch (dbError) {
      console.error("Database save failed (non-critical):", dbError);
    }

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully",
      emailSent,
      dbSaved,
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to submit enquiry. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(enquiries);
  } catch (error) {
    console.error("Fetch enquiries error:", error);
    return NextResponse.json([]);
  }
}
