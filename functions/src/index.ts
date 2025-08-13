import * as admin from "firebase-admin";
admin.initializeApp();

// Existing exports
export { createUser } from "./create-user";
export { createUserProfile } from "./create-user-profile";
export { getUserProfile } from "./get-user-profile";
export { getDirectory } from "./get-directory-data";
export { getPolicies } from "./get-policies-data";
// Content and comms
export { createAnnouncement, acknowledgeAnnouncement } from "./announcements";
export { publishPolicy, acknowledgePolicy } from "./policies";
// Events
export { createEvent, rsvpEvent } from "./events";
// Storage + personal docs access
export { generatePersonalDocUploadUrl, generatePersonalDocDownloadUrl } from "./storage";
// Exports to Google Sheets
export { exportEmployeesToSheets } from "./export";
export { setUserRole } from "./set-user-role";

// New security/auth controls
export { enforceWorkspaceDomainOnCreate, enforceWorkspaceDomainOnSignIn } from "./auth-blocking";

// Admin utilities
export { setUserRoleByEmail, seedInitialAdmin } from "./admin";

// Attendance (clock in/out with tolerance)
export { clockIn, clockOut } from "./attendance";

// Leave management
export { applyLeave, approveLeave, declineLeave, returnToWork, approveReturnToWork } from "./leave";

// Legacy function names kept to ensure CI/CD deploys do not abort when
// previously deployed functions exist in the project. These are minimal/no-op
// implementations and can be enhanced or removed later with a controlled delete.
export { onLeaveRequestUpdate, onVehicleBookingApproved } from './legacy-triggers';