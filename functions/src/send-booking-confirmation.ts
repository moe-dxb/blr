import * as functions from "firebase-functions";
import * as nodemailer from "nodemailer";

// Initialize the transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().env.email_user,
    pass: functions.config().env.email_pass,
  },
});

export const onVehicleBookingApproved = functions.firestore
  .document("vehicleBookings/{bookingId}")
  .onUpdate(async (change) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if the booking was just approved
    if (beforeData.status === "pending" && afterData.status === "approved") {
      const {requesterEmail, requesterName, date, timeSlot} = afterData;

      // Email options
      const mailOptions = {
        from: `BLR WORLD HUB <${functions.config().env.email_user}>`,
        to: requesterEmail,
        subject: "Your Vehicle Booking is Confirmed!",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Vehicle Booking Confirmation</h2>
            <p>Hello ${requesterName},</p>
            <p>Your vehicle booking has been <strong>approved</strong>.</p>
            <p><strong>Booking Details:</strong></p>
            <ul>
              <li>Date: ${new Date(
    date.seconds * 1000
  ).toLocaleDateString()}</li>
              <li>Time Slot: ${timeSlot}</li>
            </ul>
            <p>Thank you,</p>
            <p><strong>The BLR WORLD HUB Team</strong></p>
          </div>
        `,
      };

      // Send the email
      try {
        await transporter.sendMail(mailOptions);
        functions.logger.log(`Confirmation email sent to ${requesterEmail}`);
      } catch (error) {
        functions.logger.error(
          `Failed to send email to ${requesterEmail}`,
          error
        );
      }
    }
  });
