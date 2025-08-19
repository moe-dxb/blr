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
exports.onLeaveRequestUpdate = void 0;
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
exports.onLeaveRequestUpdate = functions.firestore
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
//# sourceMappingURL=send-leave-request-update.js.map