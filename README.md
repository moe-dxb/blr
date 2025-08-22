# BLR WORLD HUB - Company Portal

This repository contains the source code for the BLR WORLD HUB, a comprehensive company portal built on a modern, server-first technology stack.

## Core Features Implemented

- **Leave Management:** Employees can request leave; managers/admins can approve or decline.
- **Expense Claims:** Employees can submit multi-item expense claims; managers/admins can approve or decline.
- **Time Clock & Timesheets:** Secure, transactional clock-in/clock-out functionality with weekly timesheet views for employees.
- **In-App Notifications:** A real-time notification system for status updates on requests.
- **Role-Based Access Control (RBAC):** Secure access control for Employees, Managers, HR, and Admins.
- **Data Export:** Admins can export employee and expense data directly to Google Sheets.
- **Internationalization (i18n):** Fully bilingual support for English and Arabic, including RTL layouts.
- **Architectural Standard:** A "Server-First" architecture using Next.js Server Components for optimal performance.

## Technology Stack

- **Framework:** Next.js 15 (with App Router)
- **Language:** TypeScript
- **Backend:** Firebase (Authentication, Firestore, Storage) and Cloud Functions (Node.js 20)
- **UI:** Tailwind CSS with shadcn/ui
- **Forms:** React Hook Form with Zod for validation

## Deployment

This project is configured for continuous deployment using GitHub Actions.

**To deploy the application:**

1.  **Merge to `main`:** All code merged into the `main` branch will automatically trigger the `firebase-deploy.yml` workflow.
2.  **Monitor the Action:** Check the "Actions" tab in the GitHub repository to monitor the progress of the deployment.

The workflow will deploy all necessary components:
- Firebase Hosting (for the Next.js app)
- Cloud Functions
- Firestore Rules and Indexes
- Storage Rules

---

**This project is now ready for production deployment.** The CI/CD pipeline is active, and the codebase is clean, secure, and feature-complete according to the P0 and P1 priorities.

You can now merge your branch into `main` to trigger the final deployment.
