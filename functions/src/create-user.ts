
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createUser = functions.https.onCall(async (data, context) => {
  if (context.auth?.token.role !== "Admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can create users."
    );
  }

  const {email, password, name, role} = data;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, {role});

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      name,
      email,
      role,
      department: "Unassigned",
      manager: "",
    });

    return {uid: userRecord.uid};
  } catch (error) {
    console.error("Error creating new user:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to create new user."
    );
  }
});
