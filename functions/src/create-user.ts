
import {onCall} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const createUser = onCall(async (request) => {
  if (request.auth?.token.role !== "Admin") {
    throw new Error("Only admins can create users.");
  }

  const {email, password, name, role} = request.data;

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
    throw new Error("Failed to create new user.");
  }
});
