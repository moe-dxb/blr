
import * as admin from "firebase-admin";

import {setUserRole as setRole} from "./set-user-role";
import {onLeaveRequestUpdate as leaveUpdate} from
  "./send-leave-request-update";
import {onVehicleBookingApproved as vehicleBookingUpdate} from
  "./send-booking-confirmation";
import {createUserProfile as createProfile} from "./create-user-profile";
import {createUser} from "./create-user";
import {getUserProfile} from "./get-user-profile";

admin.initializeApp();

exports.setUserRole = setRole;
exports.createUserProfile = createProfile;
exports.createUser = createUser;
exports.onVehicleBookingApproved = vehicleBookingUpdate;
exports.onLeaveRequestUpdate = leaveUpdate;
exports.getUserProfile = getUserProfile;
