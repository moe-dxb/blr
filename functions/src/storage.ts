// functions/src/storage.ts
import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';

const storage = admin.storage();

const signedUrlRequestSchema = z.object({
  fileName: z.string().min(1, 'File name is required.'),
  contentType: z.string().regex(/^image\//, 'Only image content types are allowed.'),
  claimId: z.string().min(1, 'Claim ID is required.'), // To associate the upload with an expense claim
});

/**
 * Creates a signed URL that allows a client to upload a receipt to a secure, user-specific location.
 */
export const getReceiptUploadUrl = functions.https.onCall(async (request) => {
  const auth = request.auth;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const { fileName, contentType, claimId } = signedUrlRequestSchema.parse(request.data);

  // Define the path in Cloud Storage where the file will be uploaded.
  // This path ensures users can only upload to a folder corresponding to their UID and a specific claim.
  const filePath = `receipts/${auth.uid}/${claimId}/${fileName}`;

  const options = {
    version: 'v4' as const,
    action: 'write' as const,
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  };

  try {
    // Get a v4 signed URL for uploading file
    const [url] = await storage.bucket().file(filePath).getSignedUrl(options);
    return { success: true, url, filePath };

  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw new HttpsError('internal', 'Could not create upload URL.');
  }
});
