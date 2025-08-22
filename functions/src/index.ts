import * as admin from "firebase-admin";
admin.initializeApp();

// --- Core API ---

// Onboarding & Profile
export { createUser } from "./create-user";
export { createUserProfile } from "./create-user-profile";
export { getUserProfile } from "./get-user-profile";

// Data & Admin
export { getDirectory } from "./get-directory-data";
export { getPolicies } from "./get-policies-data";
export { exportEmployeesToSheets, exportExpensesToSheets } from "./export";
export { setUserRoleByEmail, seedInitialAdmin, setManagerForEmployeeByEmail } from "./admin";

// Leave Management
export { createLeaveRequest } from "./http/leave";
export { getLeaveRequests, updateLeaveRequestStatus } from "./http/leave-admin";

// Expense Management
export { createExpenseClaim } from "./http/expense";
export { getExpenseClaims, updateExpenseClaimStatus } from "./http/expense-admin";

// Timesheet & Attendance
export { clockInV2, clockOutV2, getMyTimesheet } from "./http/timesheet";

// Storage & Files
export { getReceiptUploadUrl } from "./storage";

// --- Scheduled Tasks ---
export { accrueLeaveBalances } from "./scheduled/accrue-leave";

// --- Other Utilities ---
export { updateLastLogin } from "./update-last-login";
export { setUserRole } from "./set-user-role";
export { aiGenerate } from './ai';

// --- Auth Blocking Triggers ---
// These are only enabled in production environments
if (process.env.ENABLE_GCIP_BLOCKING === 'true') {
  const authBlocking = require('./auth-blocking');
  exports.enforceWorkspaceDomainOnCreate = authBlocking.enforceWorkspaceDomainOnCreate;
  exports.enforceWorkspaceDomainOnSignIn = authBlocking.enforceWorkspaceDomainOnSignIn;
} else {
  const stub = require('./auth-blocking-stub');
  exports.enforceWorkspaceDomainOnCreate = stub.enforceWorkspaceDomainOnCreate;
  exports.enforceWorkspaceDomainOnSignIn = stub.enforceWorkspaceDomainOnSignIn;
}
