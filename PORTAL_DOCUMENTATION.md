# Project Golden Standard: The BLR World Employee Portal

## 1. Vision & Purpose

This document outlines the vision for the BLR World Employee Portal, a comprehensive, cloud-native platform designed to serve as the central nervous system for all employees. Our mission is to create a seamless, intelligent, and high-performance digital environment that streamlines administrative tasks, fosters community, and empowers employees.

The portal is not merely a collection of features; it is an integrated ecosystem built on a "Server-First" architecture to ensure a fast, responsive, and scalable experience that can handle heavy data loads and integrate deeply with our Google Workspace environment.

---

## 2. Core User Stories & Roles

The portal is designed around three key user roles, each with a specific set of capabilities.

### 2.1. The Employee
The primary user of the portal. Their experience is defined by self-service and immediate access to information.

*   **Authentication:** Can sign up and log in securely using their `@blr-world.com` Google account.
*   **Dashboard:** Views a personalized dashboard with at-a-glance information, such as leave balance, pending requests, and important announcements.
*   **Profile Management:** Can view and manage their own profile information.
*   **Core Actions:**
    *   **Attendance:** Clock in and out daily.
    *   **Leave:** Apply for leave and view the real-time status of their requests.
    *   **Expenses:** Submit expense claims for reimbursement.
    *   **Documents:** Access and acknowledge company policies, memos, and other critical documents.
*   **Engagement:**
    *   **Community:** Participate in company-wide discussions and groups.
    *   **Wellbeing:** RSVP to wellbeing events and access resources.
    *   **Learning:** Access onboarding materials and other learning resources.
    *   **Directory:** Navigate a comprehensive company directory to find colleagues.
    *   **Feedback:** Provide feedback through structured channels.

### 2.2. The Manager
A user with direct reports. Their experience is focused on team oversight and efficient approvals.

*   **All Employee Capabilities:** Has access to all features available to an Employee.
*   **Team Management:**
    *   **Team View:** Can view the profiles and key information of their direct reports.
    *   **Approval Workflow:** Receives, reviews, and approves/denies requests from their team (e.g., leave, expenses) through a dedicated dashboard widget.

### 2.3. The Administrator (Super Admin / HR)
A power user responsible for maintaining the integrity and content of the entire portal.

*   **All Manager Capabilities:** Has access to all features available to a Manager.
*   **User & Data Management:**
    *   **User Profiles:** Can create, update, and delete user profiles.
    *   **Role Assignment:** Can assign roles (Employee, Manager, Admin) and line managers to users.
    *   **Leave Management:** Can view, amend, and manage leave balances for all employees.
*   **Content Management:**
    *   **Documents:** Can upload, update, and delete all company documents and policies.
    *   **Announcements:** Can create and broadcast company-wide announcements.
    *   **Directory Management:** Can update and maintain the company directory.
*   **System Oversight:** Has a comprehensive view of all portal activity and data.

---

## 3. The Golden Standard: Guiding Principles

These principles guide our development and architectural decisions.

*   **Performance is Paramount:** We adhere to a strict **"Server-First"** architecture, leveraging Next.js Server Components by default to ensure a fast, lightweight, and scalable application. Client-side rendering is used sparingly and intentionally.
*   **Real-Time by Default:** The user experience must be dynamic. Data, such as the status of a request or a new announcement, should update in real-time without requiring a page refresh. We use Firestore's real-time listeners to achieve this.
*   **Deep Integration:** The portal will be tightly integrated with Google Workspace, starting with authentication and with future plans for calendar and drive integrations.
*   **Modular & Scalable:** The application is built with a feature-based folder structure, allowing for modular and scalable development. Each feature should be a self-contained unit where possible.
*   **Code is Communication:** We maintain clear, well-documented code and components to ensure long-term maintainability and ease of onboarding for new developers.
