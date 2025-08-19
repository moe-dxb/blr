
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const getUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required."
    );
  }

  const userId = context.auth.uid;
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
    throw new functions.https.HttpsError(
        "internal",
        "Failed to fetch user profile."
    );
  }
});
