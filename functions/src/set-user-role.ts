import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// This function can only be called by an authenticated user.
// It sets a custom user claim (e.g., role) on another user's account.
export const setUserRole = functions.https.onCall(async (data, context) => {
  // 1. --- Authentication and Authorization Check ---
  // Ensure the user calling the function is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated user."
    );
  }

  // Check if the calling user is an Admin.
  const callerRole = context.auth.token.role;
  if (callerRole !== "Admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You must be an Admin to perform this action."
    );
  }

  // 2. --- Input Validation ---
  const {userId, newRole} = data;
  if (!userId || !newRole) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with 'userId' and 'newRole' arguments."
    );
  }

  const validRoles = ["Admin", "Manager", "Employee"];
  if (!validRoles.includes(newRole)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Invalid role. Must be one of: ${validRoles.join(", ")}`
    );
  }

  // 3. --- Core Logic: Set Custom Claim ---
  try {
    // Set the custom claim on the target user's authentication token.
    await admin.auth().setCustomUserClaims(userId, {role: newRole});

    // Also, update the role in the user's Firestore document.
    await admin.firestore().collection("users").doc(userId).update({
      role: newRole,
    });

    return {
      status: "success",
      message: `Successfully set role for user ${userId} to ${newRole}.`,
    };
  } catch (error) {
    console.error(`Error setting user role for ${userId}:`, error);
    throw new functions.https.HttpsError(
      "internal",
      "An internal error occurred while setting the user role."
    );
  }
});
