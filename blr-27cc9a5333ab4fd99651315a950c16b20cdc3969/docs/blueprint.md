# Technical Blueprint: The BLR World Employee Portal

## 1. Guiding Philosophy: The Golden Standard

This document provides the definitive technical architecture and engineering standards for the BLR World Employee Portal. Our philosophy is to build a highly-performant, scalable, and maintainable application by adhering to a strict set of technical principles.

**The Prime Directive: Performance via Server-First Architecture.**
Every technical decision must be weighed against its impact on performance. Our primary strategy for achieving this is a "Server-First" architecture, as detailed below. This is not a suggestion; it is the mandatory standard for all development.

---

## 2. Core Architecture: Next.js with the App Router

We leverage the Next.js App Router to enforce our Server-First model.

### 2.1. React Server Components (RSCs) are the Default
-   **What:** Components that render on the server, fetching data and generating HTML before being sent to the client. They produce zero client-side JavaScript.
-   **When:** **Always**, unless client-side interactivity is absolutely required. All data display, layout, and non-interactive content MUST be an RSC.
-   **Example:** A list of company policies, a user's profile information, the main application layout.

### 2.2. Client Components (`'use client'`) are the Exception
-   **What:** Components that render on the server for the initial page load, but are then "hydrated" and run on the client, enabling interactivity.
-   **When:** **Only** for components that require hooks (`useState`, `useEffect`, `useContext`) or event listeners (`onClick`, `onChange`).
-e  **Best Practice:** Keep Client Components as small as possible. They should be "islands" of interactivity within a sea of Server Components. Instead of making a whole page a Client Component, isolate the interactive part (e.g., a `LeaveRequestForm` button) into its own component and import that into a Server Component parent.

### 2.3. Data Fetching Strategy
-   **Server-Side is Primary:** All primary data fetching from Firestore MUST happen inside Server Components. This minimizes latency and prevents shipping large data-fetching libraries to the client.
-   **Real-Time on the Client:** For features requiring real-time updates (e.g., a notification bell, a list of pending requests), we will use Firestore's `onSnapshot` listeners. These listeners should be attached within small, dedicated Client Components that do nothing else, ensuring they are the only parts of the page that re-render when data changes.

---

## 3. Backend & Database: Firebase

Firebase provides our authentication, database, and storage.

### 3.1. Firestore Database
-   **Collections:** Data is organized by feature. The top-level collections should correspond to the main features of the portal. Example collections include:
    *   `users`: Stores user profile data, including their role and manager ID.
    *   `leaveRequests`: Contains all leave request documents.
    *   `expenseClaims`: Contains all expense claim documents.
    *   `policies`: Stores policy documents and metadata.
    *   `announcements`: For company-wide announcements.
-   **Security Rules (`firestore.rules`):** We will implement robust security rules to ensure data integrity and enforce our role-based access control.
    *   Users can only read/write their own documents (e.g., their own user profile, their own leave requests).
    *   Managers can read the documents of their direct reports.
    *   Admins have comprehensive read/write access to all collections.
    *   **All new collections MUST have corresponding security rules before being deployed.**

### 3.2. Authentication
-   **Provider:** Google Authentication is the sole provider, restricted to the `@blr-world.com` domain.
-   **User Profile Creation:** Upon first login, a new document will be created in the `users` collection. This document will be populated with basic information from their Google profile and assigned the default "Employee" role.

### 3.3. Cloud Functions (for server-side logic)
- We will use Cloud Functions for any backend logic that should not run on the client, such as:
    - Sending email notifications (e.g., leave request approval).
    - Performing complex data aggregations.
    - Integrating with third-party APIs.

---

## 4. Code & Component Standards

### 4.1. Component Structure
-   **Feature-Based Colocation:** All files related to a single feature (e.g., `leave`) should be located within the same folder (`/src/app/leave`). This includes pages, components, and type definitions.
-   **UI vs. Feature Components:**
    *   **UI Components (`/src/components/ui`):** These are general-purpose, reusable components (e.g., Button, Card, Input). They should be stateless and dumb.
    *   **Feature Components (`/src/app/feature/...`):** These are components specific to a feature, often composing multiple UI components to build a piece of functionality.

### 4.2. State Management
-   **Local State:** Use `useState` within Client Components for simple, local UI state.
-   **URL State:** For state that should be preserved on refresh or be shareable (e.g., filters, search queries), use the URL query parameters.
-   **Global State:** Avoid complex global state managers. The combination of Server Components for data fetching and `useContext` for passing down essential, low-frequency data (like the authenticated user object via `AuthProvider`) is sufficient.

### 4.3. Naming Conventions
-   **Components:** PascalCase (e.g., `LeaveRequestForm.tsx`).
-   **Files:** kebab-case for non-component files (e.g., `firebase-config.ts`).
-   **Variables:** camelCase.

This document is a living artifact. It will be updated as the project evolves, but the core principles herein are our foundation.
