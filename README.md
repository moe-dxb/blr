# BLR WORLD HUB - Company Portal (MVP v1.0)

This document provides an overview of the BLR WORLD HUB's first official release for internal testing. This application represents a **strong Minimum Viable Product (MVP)** for a 2025-era company portal. It successfully evolves beyond the traditional, static intranet by deeply integrating real-time data into its core workflows.

## Key Features in this Version

*   **Real-Time & Collaborative**: The portal's event-driven architecture ensures that all data is live and collaborative. Changes made by one user are reflected for others instantly without needing to refresh the page.
*   **End-to-End Workflows**: Three complete, end-to-end features are ready for testing:
    *   **Resource Booking**: Request vehicles and have them approved/rejected by managers.
    *   **Leave Management**: Submit leave requests and have them actioned by managers.
    *   **Attendance Tracking**: Clock in/out from the dashboard and have it appear on a centralized report for managers.
*   **Role-Based Access Control (RBAC)**: The portal is fully secure and role-aware.
    *   **Employees** can access self-service tools.
    *   **Managers** have access to approval workflows and team reports.
    *   **Admins** have full control over user management and system configuration.
*   **Dynamic & Personalized Dashboard**: The dashboard provides a tailored overview for each user based on their role and data.
*   **Secure Authentication**: Access is restricted to company personnel via the `@blr-world.com` email domain.

---

## How to Launch the App

The portal is built on Firebase App Hosting, which makes deployment **fast, capable, and seamless**. The entire process is handled by a single command.

### Step 1: Prerequisites

Ensure you have the Firebase CLI installed and authenticated.

1.  **Install Firebase CLI**:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Log in to Firebase**:
    ```bash
    firebase login
    ```

### Step 2: Deploy the Application

This single command will build, provision, and deploy the entire portal, including the web application and all backend functions.

1.  **Target your Firebase Project**:
    ```bash
    firebase use blr-world-hub
    ```
2.  **Deploy**:
    ```bash
    firebase deploy --only apphosting
    ```

### Step 3: Access the Live Portal

Once deployment is complete, the Firebase CLI will provide the **live, public URL** for the application (e.g., `https://blr-world-hub-backend--your-site-name.web.app`).

**This URL is the entry point for your internal testing team.** Simply share it with them to get started.
