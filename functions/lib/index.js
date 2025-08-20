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
exports.onVehicleBookingApproved = exports.onLeaveRequestUpdate = exports.aiGenerate = exports.approveReturnToWork = exports.returnToWork = exports.declineLeave = exports.approveLeave = exports.applyLeave = exports.clockOut = exports.clockIn = exports.setManagerForEmployeeByEmail = exports.seedInitialAdmin = exports.setUserRoleByEmail = exports.setUserRole = exports.updateLastLogin = exports.seedAdminRole = exports.exportEmployeesToSheets = exports.generatePolicyAttachmentDownloadUrl = exports.generatePolicyAttachmentUploadUrl = exports.generatePersonalDocDownloadUrl = exports.generatePersonalDocUploadUrl = exports.rsvpEvent = exports.createEvent = exports.acknowledgePolicy = exports.publishPolicy = exports.acknowledgeAnnouncement = exports.createAnnouncement = exports.getPolicies = exports.getDirectory = exports.getUserProfile = exports.createUserProfile = exports.createUser = void 0;
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// Existing exports
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
// Content and comms
var announcements_1 = require("./announcements");
Object.defineProperty(exports, "createAnnouncement", { enumerable: true, get: function () { return announcements_1.createAnnouncement; } });
Object.defineProperty(exports, "acknowledgeAnnouncement", { enumerable: true, get: function () { return announcements_1.acknowledgeAnnouncement; } });
var policies_1 = require("./policies");
Object.defineProperty(exports, "publishPolicy", { enumerable: true, get: function () { return policies_1.publishPolicy; } });
Object.defineProperty(exports, "acknowledgePolicy", { enumerable: true, get: function () { return policies_1.acknowledgePolicy; } });
// Events
var events_1 = require("./events");
Object.defineProperty(exports, "createEvent", { enumerable: true, get: function () { return events_1.createEvent; } });
Object.defineProperty(exports, "rsvpEvent", { enumerable: true, get: function () { return events_1.rsvpEvent; } });
// Storage + personal docs access
var storage_1 = require("./storage");
Object.defineProperty(exports, "generatePersonalDocUploadUrl", { enumerable: true, get: function () { return storage_1.generatePersonalDocUploadUrl; } });
Object.defineProperty(exports, "generatePersonalDocDownloadUrl", { enumerable: true, get: function () { return storage_1.generatePersonalDocDownloadUrl; } });
// Policy attachments
var policy_attachments_1 = require("./policy-attachments");
Object.defineProperty(exports, "generatePolicyAttachmentUploadUrl", { enumerable: true, get: function () { return policy_attachments_1.generatePolicyAttachmentUploadUrl; } });
Object.defineProperty(exports, "generatePolicyAttachmentDownloadUrl", { enumerable: true, get: function () { return policy_attachments_1.generatePolicyAttachmentDownloadUrl; } });
// Exports to Google Sheets
var export_1 = require("./export");
Object.defineProperty(exports, "exportEmployeesToSheets", { enumerable: true, get: function () { return export_1.exportEmployeesToSheets; } });
// Admin seeding
var seed_admin_1 = require("./seed-admin");
Object.defineProperty(exports, "seedAdminRole", { enumerable: true, get: function () { return seed_admin_1.seedAdminRole; } });
// Auth utilities
var update_last_login_1 = require("./update-last-login");
Object.defineProperty(exports, "updateLastLogin", { enumerable: true, get: function () { return update_last_login_1.updateLastLogin; } });
var set_user_role_1 = require("./set-user-role");
Object.defineProperty(exports, "setUserRole", { enumerable: true, get: function () { return set_user_role_1.setUserRole; } });
// Admin utilities
var admin_1 = require("./admin");
Object.defineProperty(exports, "setUserRoleByEmail", { enumerable: true, get: function () { return admin_1.setUserRoleByEmail; } });
Object.defineProperty(exports, "seedInitialAdmin", { enumerable: true, get: function () { return admin_1.seedInitialAdmin; } });
Object.defineProperty(exports, "setManagerForEmployeeByEmail", { enumerable: true, get: function () { return admin_1.setManagerForEmployeeByEmail; } });
// Attendance (clock in/out with tolerance)
var attendance_1 = require("./attendance");
Object.defineProperty(exports, "clockIn", { enumerable: true, get: function () { return attendance_1.clockIn; } });
Object.defineProperty(exports, "clockOut", { enumerable: true, get: function () { return attendance_1.clockOut; } });
// Leave management
var leave_1 = require("./leave");
Object.defineProperty(exports, "applyLeave", { enumerable: true, get: function () { return leave_1.applyLeave; } });
Object.defineProperty(exports, "approveLeave", { enumerable: true, get: function () { return leave_1.approveLeave; } });
Object.defineProperty(exports, "declineLeave", { enumerable: true, get: function () { return leave_1.declineLeave; } });
Object.defineProperty(exports, "returnToWork", { enumerable: true, get: function () { return leave_1.returnToWork; } });
Object.defineProperty(exports, "approveReturnToWork", { enumerable: true, get: function () { return leave_1.approveReturnToWork; } });
// AI (Vertex) with cost control
var ai_1 = require("./ai");
Object.defineProperty(exports, "aiGenerate", { enumerable: true, get: function () { return ai_1.aiGenerate; } });
// Auth blocking: real triggers only on GCIP; otherwise export harmless stubs with the same names.
if (process.env.ENABLE_GCIP_BLOCKING === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const authBlocking = require('./auth-blocking');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    exports.enforceWorkspaceDomainOnCreate = authBlocking.enforceWorkspaceDomainOnCreate;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    exports.enforceWorkspaceDomainOnSignIn = authBlocking.enforceWorkspaceDomainOnSignIn;
}
else {
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
var legacy_triggers_1 = require("./legacy-triggers");
Object.defineProperty(exports, "onLeaveRequestUpdate", { enumerable: true, get: function () { return legacy_triggers_1.onLeaveRequestUpdate; } });
Object.defineProperty(exports, "onVehicleBookingApproved", { enumerable: true, get: function () { return legacy_triggers_1.onVehicleBookingApproved; } });
//# sourceMappingURL=index.js.map