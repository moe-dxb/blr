import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/firebase';

// Safely get Functions instance only when app is available (client-side)
const functions = app ? getFunctions(app) : (null as any);

export const api = {
  // Profiles / roles
  getUserProfile: async () => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<unknown, any>(functions, 'getUserProfile');
    const res = await fn();
    return res.data;
  },

  // Admin role management
  setUserRoleByEmail: async (email: string, role: 'Admin' | 'Manager' | 'Employee') => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<{ email: string; role: 'Admin' | 'Manager' | 'Employee' }, any>(functions, 'setUserRoleByEmail');
    const res = await fn({ email, role });
    return res.data;
  },
  setManagerForEmployeeByEmail: async (employeeEmail: string, managerEmail: string) => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<{ employeeEmail: string; managerEmail: string }, any>(functions, 'setManagerForEmployeeByEmail');
    const res = await fn({ employeeEmail, managerEmail });
    return res.data as { success: boolean; employeeUid: string; managerUid: string };
  },

  // Leave flow
  applyLeave: async (payload: { leaveType: string; startDate: string; endDate: string; reason?: string }) => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<typeof payload, any>(functions, 'applyLeave');
    const res = await fn(payload);
    return res.data;
  },
  approveLeave: async (id: string) => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<{ id: string }, any>(functions, 'approveLeave');
    const res = await fn({ id });
    return res.data;
  },
  declineLeave: async (id: string) => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<{ id: string }, any>(functions, 'declineLeave');
    const res = await fn({ id });
    return res.data;
  },
  returnToWork: async (id: string) => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<{ id: string }, any>(functions, 'returnToWork');
    const res = await fn({ id });
    return res.data;
  },
  approveReturnToWork: async (id: string) => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<{ id: string }, any>(functions, 'approveReturnToWork');
    const res = await fn({ id });
    return res.data;
  },

  // Announcements ack
  acknowledgeAnnouncement: async (id: string) => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<{ id: string }, any>(functions, 'acknowledgeAnnouncement');
    const res = await fn({ id });
    return res.data;
  },

  // Personal documents
  generatePersonalDocUploadUrl: async (fileName: string, contentType: string) => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<{ fileName: string; contentType: string }, any>(functions, 'generatePersonalDocUploadUrl');
    const res = await fn({ fileName, contentType });
    return res.data as { uploadUrl: string; docId: string; path: string; expires: number };
  },
  generatePersonalDocDownloadUrl: async (userId: string, docId: string, fileName: string) => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<{ userId: string; docId: string; fileName: string }, any>(functions, 'generatePersonalDocDownloadUrl');
    const res = await fn({ userId, docId, fileName });
    return res.data as { downloadUrl: string; expires: number };
  },

  // AI (Vertex) generation with budget cap
  aiGenerate: async (payload: { prompt: string; maxOutputTokens?: number; temperature?: number; model?: string }) => {
    if (!functions) throw new Error('Firebase not initialized');
    const fn = httpsCallable<typeof payload, any>(functions, 'aiGenerate');
    const res = await fn(payload);
    return res.data as { text: string; usage: { inputTokens: number; outputTokens: number; totalTokens: number; estimatedCents: number; model: string; location: string } };
  },
};