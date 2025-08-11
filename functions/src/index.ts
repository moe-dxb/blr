
// This is the "central nervous system" for all our Firebase Functions.
// By exporting them from this single file, we ensure they are all
// deployed and managed consistently.

export { getDashboardData } from "./get-dashboard-data";

// The following functions are still part of the application, but
// we can consolidate them in the future if it makes sense.
export { createUser } from "./create-user";
export { createUserProfile } from "./create-user-profile";
export { getUserProfile } from "./get-user-profile";
export { getDirectory } from "./get-directory-data";
export { getPolicies } from "./get-policies-data";
export { onVehicleBookingApproved } from "./send-booking-confirmation";
export { onLeaveRequestUpdate } from "./send-leave-request-update";
export { setUserRole } from "./set-user-role";
