
import {onCall} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const getUserProfile = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("Authentication required.");
  }

  const userId = request.auth.uid;
  try {
    const userRecord = await admin.auth().getUser(userId);
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      return {role: "Employee", ...userRecord};
    }
    const customClaims = userRecord.customClaims || {};

    return {
      ...userDoc.data(),
      role: customClaims.role || "Employee",
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile.");
  }
});
