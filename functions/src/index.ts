
import * as admin from "firebase-admin";
admin.initializeApp();

// This is the "central nervous system" for all our Firebase Functions.
// By exporting them from this single file, we ensure they are all
// deployed and managed consistently.

// The following functions are still part of the application, but
// we can consolidate them in the future if it makes sense.
export { createUser } from "./create-user";
export { createUserProfile } from "./create-user-profile";
export { getUserProfile } from "./get-user-profile";
export { getDirectory } from "./get-directory-data";
export { getPolicies } from "./get-policies-data";
export { setUserRole } from "./set-user-role";
