import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";

export const createUserProfile = functions.auth.user()
  .onCreate(async (user) => {
    const email = user.email;

    const ALLOWED_DOMAIN = "@blr-world.com";

    if (email && email.endsWith(ALLOWED_DOMAIN)) {
      console.log(`Creating user profile for: ${email}`);
      try {
        await admin.firestore().collection("users").doc(user.uid).set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "New User",
          photoURL: user.photoURL || "",
          role: "Employee",
          department: "Unassigned",
          manager: "",
          createdAt: FieldValue.serverTimestamp(),
        });
        console.log(`User profile created for: ${email}`);
      } catch (error) {
        console.error(`Error creating user profile for ${email}:`, error);
      }
    } else {
      console.warn(`Blocking user with invalid domain: ${email}`);
      try {
        await admin.auth().updateUser(user.uid, {disabled: true});
        console.log(`Disabled user: ${email}`);
      } catch (error) {
        console.error(`Failed to disable user ${email}:`, error);
      }
    }
  });
