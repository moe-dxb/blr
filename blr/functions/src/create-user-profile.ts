
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  const {uid, email, displayName} = user;

  const userProfile = {
    name: displayName || "No Name",
    email: email,
    role: "Employee", // Default role
    department: "Unassigned",
    manager: "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await admin.firestore().collection("users").doc(uid).set(userProfile);
});
