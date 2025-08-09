
import * as admin from "firebase-admin";
import {setUserRole as setRole} from "./set-user-role";
import {onLeaveRequestUpdate as leaveUpdate} from
  "./send-leave-request-update";
import {onVehicleBookingApproved as vehicleBookingUpdate} from
  "./send-booking-confirmation";
import {createUserProfile as createProfile} from "./create-user-profile";

// Initialize Firebase Admin SDK
admin.initializeApp();

exports.setUserRole = setRole;
exports.createUserProfile = createProfile;

// --- Resource Booking Functions ---

// Triggers when a 'vehicleBookings' doc is updated.
// If status changes to "approved", it sends a confirmation email.
exports.onVehicleBookingApproved = vehicleBookingUpdate;

exports.onLeaveRequestUpdate = leaveUpdate;
