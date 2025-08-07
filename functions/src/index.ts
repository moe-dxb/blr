import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables first
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Cloud Function to trigger on new user creation (v1 syntax)
export const enforceEmailDomainAndCreateProfile = functions.auth.user().onCreate(async (user) => {
  const email = user.email;

  if (email && email.endsWith("@blr-world.com")) {
    // User has the correct domain, proceed with creating profile in Firestore
    console.log(`New user with valid domain: ${email}`);

    try {
      // Create a user profile document in Firestore
      await admin.firestore().collection("users").doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: FieldValue.serverTimestamp(), // Use the imported FieldValue
        // Add any other default profile fields here
      });
      console.log(`User profile created in Firestore for: ${email}`);

      console.log(`Attempting to send welcome email to: ${email}`);

      // Configure the email transporter using Gmail SMTP
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_EMAIL, // Your Google Workspace email
          pass: process.env.GMAIL_PASSWORD, // App password or your Google Account password (less secure)
        },
      });

      // Define the email options
      const mailOptions = {
        from: 'Your Company Portal <people@blr-world.com>', // Sender address
        to: email, // Recipient address
        subject: 'Welcome to BLR WORLD HUB!', // Subject line
        text: `Welcome to BLR WORLD HUB, ${user.displayName || user.email}!\n\nWe\'re excited to have you onboard.`, // Plain text body
        html: `<p>Welcome to BLR WORLD HUB, ${user.displayName || user.email}!</p><p>We\'re excited to have you onboard.</p>`, // HTML body
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to: ${email}`);


    } catch (error) {
      console.error(`Error creating user profile or sending welcome email for ${email}:`, error);
      // You might want to log this error more robustly or send an alert
    }

  } else {
    // User does not have the correct domain, disable the user
    console.warn(`Blocking user with invalid domain: ${email}`);
    try {
      await admin.auth().updateUser(user.uid, { disabled: true });
      console.log(`Disabled user with invalid domain: ${email}`);
      // TODO: Optionally delete the user or notify an administrator
    } catch (error) {
      console.error(`Error disabling user with invalid domain ${email}:`, error);
    }
  }
});
