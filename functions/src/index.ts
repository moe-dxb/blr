
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";
import * as dotenv from "dotenv";
dotenv.config(); // Load environment variables first
import * as nodemailer from "nodemailer";
import {runFlow} from "@genkit-ai/flow";
import {summarizePolicyFlow} from "./flows/summarize-policy";
import {getStorage} from "firebase-admin/storage";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Cloud Function to trigger on new user creation (v1 syntax)
export const enforceEmailDomainAndCreateProfile = functions.auth.user()
  .onCreate(async (user) => {
    const email = user.email;

    if (email && email.endsWith("@blr-world.com")) {
      // User has the correct domain, proceed with creating profile
      console.log(`New user with valid domain: ${email}`);

      try {
        // Create a user profile document in Firestore
        await admin.firestore().collection("users").doc(user.uid).set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          createdAt: FieldValue.serverTimestamp(),
        });
        console.log(`User profile created in Firestore for: ${email}`);

        console.log(`Attempting to send welcome email to: ${email}`);

        // Configure the email transporter using Gmail SMTP
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD,
          },
        });

        const displayName = user.displayName || user.email;

        // Define the email options
        const mailOptions = {
          from: "Your Company Portal <people@blr-world.com>",
          to: email,
          subject: "Welcome to BLR WORLD HUB!",
          text: `Welcome to BLR WORLD HUB, ${displayName}!\n\n` +
                "We're excited to have you onboard.",
          html: `<p>Welcome to BLR WORLD HUB, ${displayName}!</p>` +
                "<p>We're excited to have you onboard.</p>",
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent successfully to: ${email}`);
      } catch (error) {
        console.error(
          "Error creating user profile or sending welcome email for " +
          `${email}:`,
          error
        );
      }
    } else {
      // User does not have the correct domain, disable the user
      console.warn(`Blocking user with invalid domain: ${email}`);
      try {
        await admin.auth().updateUser(user.uid, {disabled: true});
        console.log(`Disabled user with invalid domain: ${email}`);
      } catch (error) {
        console.error(
          `Error disabling user with invalid domain ${email}:`,
          error
        );
      }
    }
  });

export const summarizeDocument = functions.https.onCall(async (data, context) => {
  const filePath = data.filePath;

  if (!filePath) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with " +
      "one arguments 'filePath' containing the path to the document to summarize."
    );
  }

  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(filePath);
    const fileBuffer = await file.download();
    const documentText = fileBuffer.toString("utf8");

    // Call the Genkit flow to summarize the document.
    const summary = await runFlow(summarizePolicyFlow, {documentText});

    const documentId = filePath.split("/").pop()?.split(".")[0];
    if (documentId) {
      const summaryData = {
        summary,
        filePath,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await admin.firestore()
        .collection("documentSummaries")
        .doc(documentId)
        .set(summaryData);
      console.log(
        `Summary for document ${documentId} saved to Firestore.`
      );
    }

    return {summary};
  } catch (error) {
    console.error("Error processing document:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error processing document",
      error
    );
  }
});
