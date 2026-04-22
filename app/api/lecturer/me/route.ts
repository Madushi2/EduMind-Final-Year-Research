import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import { getSession } from "@/lib/auth";
import { profilePictureToDataUrl } from "@/lib/profile-picture";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export async function GET() {
  const session = await getSession();
  if (session?.role !== "lecturer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const lecturer = await Registration.findOne({ _id: session.id, role: "lecturer" })
    .select("name email contact position profilePicture profilePictureData profilePictureMimeType")
    .lean();

  if (!lecturer) {
    return NextResponse.json({ error: "Lecturer not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: String(lecturer._id),
    name: lecturer.name,
    email: lecturer.email,
    contact: lecturer.contact,
    position: lecturer.position ?? "",
    profilePicture: profilePictureToDataUrl(lecturer),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "lecturer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("profilePicture");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Image must be 2 MB or smaller." }, { status: 400 });
  }

  const profilePictureData = Buffer.from(await file.arrayBuffer());
  const profilePicture = `data:${file.type};base64,${profilePictureData.toString("base64")}`;

  await connectDB();
  const lecturer = await Registration.findOneAndUpdate(
    { _id: session.id, role: "lecturer" },
    {
      $set: {
        profilePicture,
        profilePictureData,
        profilePictureMimeType: file.type,
        profilePictureSize: file.size,
        profilePictureFileName: file.name,
      },
    },
    { new: true, runValidators: true }
  ).select("profilePicture profilePictureData profilePictureMimeType");

  if (!lecturer) {
    return NextResponse.json({ error: "Lecturer not found." }, { status: 404 });
  }

  return NextResponse.json({ profilePicture: profilePictureToDataUrl(lecturer) });
}
