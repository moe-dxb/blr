import * as functions from "firebase-functions";

// Enforce Workspace-only sign-in (@blr-world.com) using Authentication Blocking Functions
// Block account creation for non-blr-world.com emails
export const enforceWorkspaceDomainOnCreate = functions.auth.user().beforeCreate((user) => {
  const email = user.email || "";
  if (!email.endsWith("@blr-world.com")) {
    throw new functions.auth.HttpsError(
      "permission-denied",
      "Only @blr-world.com accounts are allowed to sign up."
    );
  }
});

// Block sign-in if email domain does not match, as a defense-in-depth measure
export const enforceWorkspaceDomainOnSignIn = functions.auth.user().beforeSignIn((user) => {
  const email = user.email || "";
  if (!email.endsWith("@blr-world.com")) {
    throw new functions.auth.HttpsError(
      "permission-denied",
      "Only @blr-world.com accounts are allowed to sign in."
    );
  }
});