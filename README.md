# BLR WORLD HUB - Company Portal

This is a Next.js starter project for an intelligent company portal, built with Firebase, Genkit, and ShadCN UI.

## Deployment & Sharing Guide for Independent Review

Follow these steps to deploy the application and provide access to an independent assessor.

### Step 1: Prerequisites

Before you can deploy, you need to have the Firebase Command Line Interface (CLI) installed and be authenticated.

1.  **Install Firebase CLI**: If you don't have it, open your terminal and run:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Log in to Firebase**: Authenticate the CLI with your Google account.
    ```bash
    firebase login
    ```

### Step 2: Deploy to Firebase App Hosting

This application is configured for Firebase App Hosting, which provides a managed, secure, and scalable environment.

1.  **Target your Firebase Project**: In your terminal, at the root of this project directory, set the CLI to use your project. Your project ID is **`blr-world-hub`**.
    ```bash
    firebase use blr-world-hub
    ```

2.  **Deploy the Backend**: Run the deployment command. This will build your Next.js application, provision the necessary cloud resources, and deploy it.
    ```bash
    firebase apphosting:backends:deploy blr-world-hub-backend --project blr-world-hub
    ```
    *Note: `blr-world-hub-backend` is the default ID for your backend instance. The deployment process will take a few minutes.*

3.  **Get the Live URL**: Once deployment is complete, the Firebase CLI will output the live, public URL for your application (e.g., `https://blr-world-hub-backend--your-site-name.web.app`). **This is the URL you will share with your assessor.**

### Step 3: Granting Access to the Assessor

For a complete and transparent review, the assessor will need access to both the live application and the underlying Firebase project.

1.  **Share the Live Application URL**: Send the public URL from the previous step to your assessor. They can now access and test the live, functional web application.

2.  **Grant IAM Access to the Firebase Project**: To allow the assessor to review the database structure, security rules, and AI configurations, grant them "Viewer" access to your Google Cloud project.

    *   Go to the Google Cloud Console: [https://console.cloud.google.com/](https://console.cloud.google.com/)
    *   Ensure you have the correct project selected (`blr-world-hub`).
    *   Navigate to **IAM & Admin** > **IAM**.
    *   Click **"+ GRANT ACCESS"**.
    *   In the "New principals" field, enter the assessor's Google account email address.
    *   In the "Select a role" dropdown, choose **Project** > **Viewer**. The "Viewer" role provides read-only access, which is perfect for a review, as it allows them to inspect configurations without being able to make any changes.
    *   Click **Save**.

The assessor now has everything they need to conduct a thorough and independent review of the live application and its underlying cloud infrastructure.