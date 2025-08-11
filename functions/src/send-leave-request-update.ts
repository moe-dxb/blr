
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

export const onLeaveRequestUpdate = functions.firestore
    .document("leaveRequests/{requestId}")
    .onUpdate(async (change, context) => {
      const request = change.after.data();
      const previousRequest = change.before.data();

      if (request.status !== previousRequest.status) {
        const user = await admin.auth().getUser(request.userId);
        const mailOptions = {
          from: "Your App Name <noreply@yourapp.com>",
          to: user.email,
          subject: `Leave Request ${request.status}`,
          text: `Your leave request from ${request.startDate} to ${request.endDate} has been ${request.status}.`,
        };
        await transporter.sendMail(mailOptions);
      }
    });
