"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onVehicleBookingApproved = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
    },
});
exports.onVehicleBookingApproved = functions.firestore
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
//# sourceMappingURL=send-booking-confirmation.js.map