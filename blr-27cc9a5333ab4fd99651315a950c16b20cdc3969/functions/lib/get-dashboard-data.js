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
exports.getDashboardData = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("./firebase-admin");
// A single, consolidated function to fetch all dashboard data.
// This is more efficient than making multiple separate calls from the client.
exports.getDashboardData = (0, https_1.onCall)(async (request) => {
    // Check for authentication
    if (!request.auth) {
        throw new Error("User must be authenticated to call this function.");
    }
    const userId = request.auth.uid;
    logger.info(`Fetching dashboard data for user: ${userId}`);
    try {
        // 1. Fetch user profile to get their role and other info
        const userProfileSnap = await firebase_admin_1.db.collection("users").doc(userId).get();
        const userProfile = userProfileSnap.data();
        const userRole = userProfile?.role;
        // 2. Fetch announcements (everyone gets these)
        const announcementsSnap = await firebase_admin_1.db.collection("announcements").orderBy("date", "desc").limit(5).get();
        const announcements = announcementsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // 3. Fetch team members (only for Admins or Managers)
        let teamMembers = [];
        if (userRole === 'Admin' || userRole === 'Manager') {
            const teamQuery = firebase_admin_1.db.collection("users").where("managerId", "==", userId);
            const teamSnaps = await teamQuery.get();
            teamMembers = teamSnaps.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().displayName,
                department: doc.data().department,
                // Add any other fields you need for the team view
            }));
        }
        // 4. Fetch other stats (e.g., leave balance)
        // This is a placeholder - you'd implement your actual leave balance logic here
        const leaveBalance = 12;
        const profileCompletion = 75; // Placeholder
        logger.info(`Successfully fetched dashboard data for user: ${userId}`);
        // Consolidate all data into a single response object
        return {
            userProfile,
            announcements,
            teamMembers,
            leaveBalance,
            profileCompletion
        };
    }
    catch (error) {
        logger.error(`Error fetching dashboard data for user ${userId}:`, error);
        // Propagate a more generic error to the client
        throw new Error("An error occurred while fetching dashboard data.");
    }
});
//# sourceMappingURL=get-dashboard-data.js.map