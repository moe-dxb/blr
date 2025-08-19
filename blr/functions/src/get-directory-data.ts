
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const getDirectory = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
    );
  }

  const snapshot = await db.collection("users").orderBy("name").get();
  return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
});
