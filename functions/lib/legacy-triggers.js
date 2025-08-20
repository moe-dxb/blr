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
exports.onVehicleBookingApproved = exports.onLeaveRequestUpdate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// These triggers are provided to satisfy existing deployed function names
// seen by Firebase during CI so deploys don't abort. They are intentionally
// minimal and safe to run in production. We can extend their logic later.
// Firestore onUpdate for leave requests
exports.onLeaveRequestUpdate = functions
    .region('us-central1')
    .firestore.document('leaveRequests/{leaveId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    // No-op: write an audit stamp when status changes
    try {
        if (before?.status !== after?.status) {
            await admin.firestore()
                .collection('leaveRequests')
                .doc(context.params.leaveId)
                .set({ lastStatusChangeAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        }
    }
    catch (e) {
        // swallow errors to avoid retries storm; logs visible in Cloud Logging
        console.error('onLeaveRequestUpdate error', e);
    }
    return;
});
// Firestore onUpdate for vehicle bookings (e.g., set approvedAt timestamp)
exports.onVehicleBookingApproved = functions
    .region('us-central1')
    .firestore.document('vehicleBookings/{bookingId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    try {
        const becameApproved = before?.status !== 'Approved' && after?.status === 'Approved';
        if (becameApproved) {
            await admin.firestore()
                .collection('vehicleBookings')
                .doc(context.params.bookingId)
                .set({ approvedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        }
    }
    catch (e) {
        console.error('onVehicleBookingApproved error', e);
    }
    return;
});
//# sourceMappingURL=legacy-triggers.js.map