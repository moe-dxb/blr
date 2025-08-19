import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const seedAdminRole = functions.https.onCall(async (data, context) => {
  // One-time admin seeding function
  // This function should only be called once to set up the initial admin
  
  const { email } = data;
  
  if (!email || !email.endsWith("@blr-world.com")) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Valid @blr-world.com email required"
    );
  }
  
  try {
    // Find user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Set admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "Admin" });
    
    // Update user profile in Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      name: userRecord.displayName || "Admin User",
      email: userRecord.email,
      role: "Admin",
      department: "Management",
      manager: "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    functions.logger.info(`Admin role granted to ${email}`);
    
    return { 
      success: true, 
      message: `Successfully granted Admin role to ${email}`,
      uid: userRecord.uid 
    };
    
  } catch (error) {
    functions.logger.error("Error seeding admin:", error);
    
    if (error instanceof Error && error.message.includes("no user record")) {
      throw new functions.https.HttpsError(
        "not-found",
        "User not found. Please ensure the user has signed up first."
      );
    }
    
    throw new functions.https.HttpsError(
      "internal",
      "Failed to seed admin role"
    );
  }
});