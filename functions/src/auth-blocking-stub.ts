import * as functions from 'firebase-functions';

// No-op HTTPS callable stubs to replace blocking functions on non-GCIP projects.
// Keeps deploys green by ensuring functions exist and can be invoked (if ever called).

export const enforceWorkspaceDomainOnCreate = functions.https.onCall(async (_data, _context) => {
  return { ok: true, mode: 'stub', note: 'Blocking functions disabled; GCIP not enabled.' };
});

export const enforceWorkspaceDomainOnSignIn = functions.https.onCall(async (_data, _context) => {
  return { ok: true, mode: 'stub', note: 'Blocking functions disabled; GCIP not enabled.' };
});