
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const getAnnouncements = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated",
        "The function must be called while authenticated.");
  }

  const snapshot = await db.collection("announcements")
      .orderBy("date", "desc")
      .limit(4)
      .get();
  return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
});

export const getTeamMembers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated",
        "The function must be called while authenticated.");
  }

  const userName = context.auth.token.name;
  const snapshot = await db.collection("users")
      .where("manager", "==", userName)
      .get();
  return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
});
