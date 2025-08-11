
import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase-admin";
import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

interface TeamMember {
  id: string;
  name: string;
  department: string;
}

// A single, consolidated function to fetch all dashboard data.
// This is more efficient than making multiple separate calls from the client.
export const getDashboardData = onCall(async (request) => {
  // Check for authentication
  if (!request.auth) {
    throw new Error("User must be authenticated to call this function.");
  }

  const userId = request.auth.uid;
  logger.info(`Fetching dashboard data for user: ${userId}`);

  try {
    // 1. Fetch user profile to get their role and other info
    const userProfileSnap = await db.collection("users").doc(userId).get();
    const userProfile = userProfileSnap.data();
    const userRole = userProfile?.role;

    // 2. Fetch announcements (everyone gets these)
    const announcementsSnap = await db.collection("announcements").orderBy("date", "desc").limit(5).get();
    const announcements = announcementsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() }));

    // 3. Fetch team members (only for Admins or Managers)
    let teamMembers: TeamMember[] = [];
    if (userRole === 'Admin' || userRole === 'Manager') {
      const teamQuery = db.collection("users").where("managerId", "==", userId);
      const teamSnaps = await teamQuery.get();
      teamMembers = teamSnaps.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
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

  } catch (error) {
    logger.error(`Error fetching dashboard data for user ${userId}:`, error);
    // Propagate a more generic error to the client
    throw new Error("An error occurred while fetching dashboard data.");
  }
});
