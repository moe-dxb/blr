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
// Policy attachments
export { generatePolicyAttachmentUploadUrl, generatePolicyAttachmentDownloadUrl } from "./policy-attachments";
// Exports to Google Sheets
export { exportEmployeesToSheets } from "./export";
export { setUserRole } from "./set-user-role";

// Admin utilities
export { setUserRoleByEmail, seedInitialAdmin, setManagerForEmployeeByEmail } from "./admin";

// Attendance (clock in/out with tolerance)
export { clockIn, clockOut } from "./attendance";

// Leave management
export { applyLeave, approveLeave, declineLeave, returnToWork, approveReturnToWork } from "./leave";

// AI (Vertex) with cost control
export { aiGenerate } from './ai';

// Auth blocking: real triggers only on GCIP; otherwise export harmless stubs with the same names.
if (process.env.ENABLE_GCIP_BLOCKING === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const authBlocking = require('./auth-blocking');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  exports.enforceWorkspaceDomainOnCreate = authBlocking.enforceWorkspaceDomainOnCreate;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  exports.enforceWorkspaceDomainOnSignIn = authBlocking.enforceWorkspaceDomainOnSignIn;
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const stub = require('./auth-blocking-stub');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  exports.enforceWorkspaceDomainOnCreate = stub.enforceWorkspaceDomainOnCreate;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  exports.enforceWorkspaceDomainOnSignIn = stub.enforceWorkspaceDomainOnSignIn;
}

// Legacy function names kept to ensure CI/CD deploys do not abort when
// previously deployed functions exist in the project. These are minimal/no-op
// implementations and can be enhanced or removed later with a controlled delete.
export { onLeaveRequestUpdate, onVehicleBookingApproved } from './legacy-triggers';