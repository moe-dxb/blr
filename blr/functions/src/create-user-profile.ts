
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  // Extract name from email if displayName is not available
  const extractedName = displayName || 
    (email ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'New User');

  const userProfile = {
    name: extractedName,
    email: email,
    photoURL: photoURL || null,
    role: "Employee", // Default role
    department: "Unassigned",
    manager: "",
    managerId: "",
    phoneNumber: user.phoneNumber || "",
    isActive: true,
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await admin.firestore().collection("users").doc(uid).set(userProfile);
    functions.logger.info(`User profile created for ${email}`);
  } catch (error) {
    functions.logger.error("Error creating user profile:", error);
  }
});
