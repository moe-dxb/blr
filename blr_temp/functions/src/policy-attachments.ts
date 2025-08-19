import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

const db = admin.firestore();
const bucket = admin.storage().bucket();

function assertAuth(context: functions.https.CallableContext) {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth required');
}
function isAdmin(token: any) { return (token?.role || 'Employee') === 'Admin'; }

export const generatePolicyAttachmentUploadUrl = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  if (!isAdmin(context.auth!.token)) throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const { fileName, contentType, policyId } = data as { fileName: string; contentType: string; policyId?: string };
  if (!fileName || !contentType) throw new functions.https.HttpsError('invalid-argument', 'fileName and contentType required');

  const id = uuidv4();
  const objectPath = `policy-attachments/${policyId || 'drafts'}/${id}/${fileName}`;

  const expires = Date.now() + 10 * 60 * 1000; // 10 min
  const [url] = await bucket.file(objectPath).getSignedUrl({ action: 'write', expires, contentType, version: 'v4' });

  return { uploadUrl: url, path: objectPath, id, expires };
});

// Verify audience access against policy document and then create a signed read URL
export const generatePolicyAttachmentDownloadUrl = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const uid = context.auth!.uid;
  const claims = context.auth!.token as any;
  const { policyId, attachmentPath, fileName } = data as { policyId: string; attachmentPath: string; fileName: string };
  if (!policyId || !attachmentPath || !fileName) throw new functions.https.HttpsError('invalid-argument', 'policyId, attachmentPath, fileName required');

  const policyRef = db.collection('policies').doc(policyId);
  const snap = await policyRef.get();
  if (!snap.exists) throw new functions.https.HttpsError('not-found', 'policy not found');
  const policy = snap.data() as any;

  // Simple audience enforcement
  const audience = policy.audience || { type: 'all' };
  let allowed = false;
  if (audience.type === 'all') allowed = true;
  else if (audience.type === 'role') allowed = (claims?.role || 'Employee') === audience.role;
  else if (audience.type === 'department') {
    const userDoc = await db.collection('users').doc(uid).get();
    const dept = userDoc.exists ? (userDoc.data() as any).department : undefined;
    allowed = dept && audience.department && dept === audience.department;
  }
  if (!allowed) throw new functions.https.HttpsError('permission-denied', 'Not allowed');

  const expires = Date.now() + 10 * 60 * 1000; // 10 min
  const [url] = await bucket.file(attachmentPath).getSignedUrl({ action: 'read', expires, version: 'v4', responseDisposition: `attachment; filename="${fileName}"` });
  return { downloadUrl: url, expires };
});