import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const updateLastLogin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required."
    );
  }

  const userId = context.auth.uid;
  
  try {
    await admin.firestore().collection("users").doc(userId).update({
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    functions.logger.info(`Updated last login for user: ${userId}`);
    return { success: true };
    
  } catch (error) {
    functions.logger.error("Error updating last login:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to update last login"
    );
  }
});