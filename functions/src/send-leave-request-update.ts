import * as functions from "firebase-functions";
import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().env.email_user,
    pass: functions.config().env.email_pass,
  },
});

export const onLeaveRequestUpdate = functions.firestore
  .document("leaveRequests/{requestId}")
  .onUpdate(async (change) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (
      beforeData.status === "pending" &&
      (afterData.status === "approved" || afterData.status === "rejected")
    ) {
      const {
        requesterEmail,
        requesterName,
        leaveType,
        startDate,
        endDate,
        status,
      } = afterData;

      const mailOptions = {
        from: `BLR WORLD HUB <${functions.config().env.email_user}>`,
        to: requesterEmail,
        subject: `Your Leave Request has been ${status}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Leave Request Update</h2>
            <p>Hello ${requesterName},</p>
            <p>Your request for ${leaveType} leave from ${new Date(
  startDate.seconds * 1000
).toLocaleDateString()} to ${new Date(
  endDate.seconds * 1000
).toLocaleDateString()} has been <strong>${status}</strong>.</p>
            <p>Thank you,</p>
            <p><strong>The BLR WORLD HUB Team</strong></p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        functions.logger.log(
          `Leave request update email sent to ${requesterEmail}`
        );
      } catch (error) {
        functions.logger.error(
          `Failed to send leave request update email to ${requesterEmail}`,
          error
        );
      }
    }
  });
