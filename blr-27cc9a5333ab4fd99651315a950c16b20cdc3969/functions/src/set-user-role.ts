
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const setUserRole = functions.https.onCall(async (data, context) => {
  if (context.auth?.token.role !== "Admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can set user roles."
    );
  }

  const {uid, role} = data;
  await admin.auth().setCustomUserClaims(uid, {role});
  return {message: `Success! ${uid} has been made a ${role}.`};
});
