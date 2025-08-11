"use strict";
// This is the "central nervous system" for all our Firebase Functions.
// By exporting them from this single file, we ensure they are all
// deployed and managed consistently.
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserRole = exports.onLeaveRequestUpdate = exports.onVehicleBookingApproved = exports.getPolicies = exports.getDirectory = exports.getUserProfile = exports.createUserProfile = exports.createUser = exports.getDashboardData = void 0;
var get_dashboard_data_1 = require("./get-dashboard-data");
Object.defineProperty(exports, "getDashboardData", { enumerable: true, get: function () { return get_dashboard_data_1.getDashboardData; } });
// The following functions are still part of the application, but
// we can consolidate them in the future if it makes sense.
var create_user_1 = require("./create-user");
Object.defineProperty(exports, "createUser", { enumerable: true, get: function () { return create_user_1.createUser; } });
var create_user_profile_1 = require("./create-user-profile");
Object.defineProperty(exports, "createUserProfile", { enumerable: true, get: function () { return create_user_profile_1.createUserProfile; } });
var get_user_profile_1 = require("./get-user-profile");
Object.defineProperty(exports, "getUserProfile", { enumerable: true, get: function () { return get_user_profile_1.getUserProfile; } });
var get_directory_data_1 = require("./get-directory-data");
Object.defineProperty(exports, "getDirectory", { enumerable: true, get: function () { return get_directory_data_1.getDirectory; } });
var get_policies_data_1 = require("./get-policies-data");
Object.defineProperty(exports, "getPolicies", { enumerable: true, get: function () { return get_policies_data_1.getPolicies; } });
var send_booking_confirmation_1 = require("./send-booking-confirmation");
Object.defineProperty(exports, "onVehicleBookingApproved", { enumerable: true, get: function () { return send_booking_confirmation_1.onVehicleBookingApproved; } });
var send_leave_request_update_1 = require("./send-leave-request-update");
Object.defineProperty(exports, "onLeaveRequestUpdate", { enumerable: true, get: function () { return send_leave_request_update_1.onLeaveRequestUpdate; } });
var set_user_role_1 = require("./set-user-role");
Object.defineProperty(exports, "setUserRole", { enumerable: true, get: function () { return set_user_role_1.setUserRole; } });
//# sourceMappingURL=index.js.map