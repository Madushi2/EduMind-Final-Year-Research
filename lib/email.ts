import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendNewRegistrationAlert(
  applicantName: string,
  applicantEmail: string,
  role: string
) {
  await transporter.sendMail({
    from: `"EduMind Platform" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_USERNAME,
    subject: `New ${role} registration request – ${applicantName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <div style="background:#0e1f45;padding:24px 32px">
          <span style="font-size:20px;font-weight:900;color:#ffffff">Edu<span style="color:#e8a020">Mind</span></span>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 16px;color:#1a3262">New Registration Request</h2>
          <p style="color:#475569;margin:0 0 24px">A new <strong>${role}</strong> registration request has been submitted and is awaiting your review.</p>
          <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px">
            <tr><td style="padding:12px 16px;color:#64748b;font-size:14px">Name</td><td style="padding:12px 16px;font-weight:600;color:#1a3262">${applicantName}</td></tr>
            <tr style="background:#f1f5f9"><td style="padding:12px 16px;color:#64748b;font-size:14px">Email</td><td style="padding:12px 16px;font-weight:600;color:#1a3262">${applicantEmail}</td></tr>
            <tr><td style="padding:12px 16px;color:#64748b;font-size:14px">Role</td><td style="padding:12px 16px;font-weight:600;color:#1a3262;text-transform:capitalize">${role}</td></tr>
          </table>
          <div style="margin-top:28px;text-align:center">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/registrations"
               style="display:inline-block;background:#e8a020;color:#0e1f45;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
              Review in Dashboard
            </a>
          </div>
        </div>
        <div style="background:#f8fafc;padding:16px 32px;text-align:center;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0">
          EduMind University Platform – automated notification
        </div>
      </div>
    `,
  });
}

export async function sendCourseAssignmentEmail(
  lecturerName:  string,
  lecturerEmail: string,
  courseName:    string,
  courseCode:    string,
  semester:      string,
  credits:       number
) {
  await transporter.sendMail({
    from:    `"EduMind Platform" <${process.env.EMAIL_USER}>`,
    to:      lecturerEmail,
    subject: `You've been assigned to ${courseName} (${courseCode})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <div style="background:#0e1f45;padding:24px 32px">
          <span style="font-size:20px;font-weight:900;color:#ffffff">Edu<span style="color:#e8a020">Mind</span></span>
        </div>
        <div style="padding:32px">
          <div style="text-align:center;margin-bottom:28px">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:#dbeafe">
              <span style="font-size:28px">📚</span>
            </div>
          </div>
          <h2 style="margin:0 0 12px;color:#1a3262;text-align:center">Course Assignment</h2>
          <p style="color:#475569;text-align:center;margin:0 0 24px">
            Hi <strong>${lecturerName}</strong>, you have been assigned as a lecturer for a new course on the EduMind platform.
          </p>
          <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px">
            <tr><td style="padding:12px 16px;color:#64748b;font-size:14px">Course</td><td style="padding:12px 16px;font-weight:600;color:#1a3262">${courseName}</td></tr>
            <tr style="background:#f1f5f9"><td style="padding:12px 16px;color:#64748b;font-size:14px">Code</td><td style="padding:12px 16px;font-weight:600;color:#1a3262">${courseCode}</td></tr>
            <tr><td style="padding:12px 16px;color:#64748b;font-size:14px">Semester</td><td style="padding:12px 16px;font-weight:600;color:#1a3262">${semester}</td></tr>
            <tr style="background:#f1f5f9"><td style="padding:12px 16px;color:#64748b;font-size:14px">Credits</td><td style="padding:12px 16px;font-weight:600;color:#1a3262">${credits}</td></tr>
          </table>
          <div style="margin-top:28px;text-align:center">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login"
               style="display:inline-block;background:#e8a020;color:#0e1f45;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="background:#f8fafc;padding:16px 32px;text-align:center;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0">
          EduMind University Platform – automated notification
        </div>
      </div>
    `,
  });
}

export async function sendRegistrationStatusEmail(
  applicantName: string,
  applicantEmail: string,
  status: "approved" | "rejected"
) {
  const approved = status === "approved";

  await transporter.sendMail({
    from: `"EduMind Platform" <${process.env.EMAIL_USER}>`,
    to: applicantEmail,
    subject: approved
      ? "Your EduMind registration has been approved!"
      : "Update on your EduMind registration",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <div style="background:#0e1f45;padding:24px 32px">
          <span style="font-size:20px;font-weight:900;color:#ffffff">Edu<span style="color:#e8a020">Mind</span></span>
        </div>
        <div style="padding:32px">
          <div style="text-align:center;margin-bottom:28px">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:${approved ? "#dcfce7" : "#fee2e2"}">
              <span style="font-size:28px">${approved ? "✓" : "✕"}</span>
            </div>
          </div>
          <h2 style="margin:0 0 12px;color:#1a3262;text-align:center">
            ${approved ? "Registration Approved!" : "Registration Not Approved"}
          </h2>
          <p style="color:#475569;text-align:center;margin:0 0 24px">
            Hi <strong>${applicantName}</strong>,
            ${approved
              ? " congratulations! Your registration request has been approved. You can now log in to the EduMind platform."
              : " we regret to inform you that your registration request has not been approved at this time. Please contact the administration for further details."}
          </p>
          ${approved ? `
          <div style="text-align:center">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login"
               style="display:inline-block;background:#e8a020;color:#0e1f45;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
              Log In Now
            </a>
          </div>` : ""}
        </div>
        <div style="background:#f8fafc;padding:16px 32px;text-align:center;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0">
          EduMind University Platform – automated notification
        </div>
      </div>
    `,
  });
}
