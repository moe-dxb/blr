
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

export const onVehicleBookingApproved = functions.firestore
    .document("vehicleBookings/{bookingId}")
    .onUpdate(async (change, context) => {
      const booking = change.after.data();
      const previousBooking = change.before.data();

      if (booking.status === "approved" &&
        previousBooking.status !== "approved") {
        const user = await admin.auth().getUser(booking.userId);
        const mailOptions = {
          from: "Your App Name <noreply@yourapp.com>",
          to: user.email,
          subject: "Vehicle Booking Confirmation",
          text: `Your vehicle booking for ${booking.vehicle} on ${booking.date} has been approved.`,
        };
        await transporter.sendMail(mailOptions);
      }
    });
