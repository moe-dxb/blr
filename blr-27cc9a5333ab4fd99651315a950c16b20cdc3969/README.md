# BLR World Employee Portal - README

## 1. Project Overview

Welcome to the BLR World Employee Portal. This is a next-generation, cloud-native application built with Next.js and Firebase. Our mission is to create a fast, seamless, and real-time hub for all employees.

This README provides essential information for developers to set up, run, and contribute to the project effectively. For a detailed architectural overview and technical blueprint, please see [`docs/blueprint.md`](./docs/blueprint.md).

**Core Technologies:**
*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore, Authentication, Storage)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **Deployment:** [Firebase Hosting](https://firebase.google.com/docs/hosting) / [Vercel](https://vercel.com/)

---

## 2. The Golden Standard: Core Architectural Principle

**Performance is our most critical feature.** To achieve this, this project adheres to a **"Server-First"** architecture.

*   **Server Components by Default:** All new components and pages should be React Server Components (RSCs) unless they explicitly require client-side interactivity (e.g., hooks like `useState`, `useEffect`).
*   **`'use client'` with Intention:** The `'use client'` directive should only be used for small, "island" components that manage state or user events. We must avoid making entire pages client-rendered.
*   **Data Fetching on the Server:** All primary data fetching from Firestore should occur within Server Components to minimize the amount of code and data sent to the client.

Adherence to this principle is mandatory for all contributions.

---

## 3. Getting Started

### 3.1. Prerequisites

*   Node.js (v18 or later)
*   npm or yarn
*   Firebase CLI

### 3.2. Firebase Setup

1.  **Create a Firebase Project:** If you haven't already, create a new project in the [Firebase Console](https://console.firebase.google.com/).
2.  **Enable Services:** In your Firebase project, enable the following services:
    *   **Authentication:** Enable the "Google" sign-in provider and restrict the domain to `@blr-world.com`.
    *   **Firestore Database:** Create a new Firestore database.
    *   **Storage:** Set up a Cloud Storage bucket.
3.  **Get Config:** Navigate to your Project Settings and copy the Firebase configuration object.
4.  **Environment Variables:** Create a new file named `.env.local` in the root of the project and paste your Firebase configuration there. It should look like this:

    ```bash
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    ```

### 3.3. Installation and Running the App

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`. It uses Next.js's Turbopack for a fast development experience.

---

## 4. Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Creates a production-ready build of the application.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the codebase for errors.
*   `npm run test`: Runs the test suite using Vitest.

---

## 5. Contributing

All new features and bug fixes should be developed on a separate branch and submitted as a pull request. Please ensure your code adheres to the "Server-First" principle outlined above and is well-documented.
