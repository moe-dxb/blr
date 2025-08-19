'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore, orderBy, query, where, DocumentData, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { isAdminOrManager, Role } from '@/lib/auth/roles';
import { api } from '@/lib/firebase/callables';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Clock, User, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequest {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  leaveType: string;
  startDate: any;
  endDate: any;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: any;
  decidedAt?: any;
  decidedBy?: string;
  returnedAt?: any;
  returnStatus?: string;
}

export function LeaveHistory() {
  const db = app ? getFirestore(app) : null as any;
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isManagerOrAdmin = isAdminOrManager(role as Role);

  useEffect(() => {
    const loadRequests = async () => {
      if (!db || !user) return;
      setLoading(true);
      try {
        let q: any;
        if (isManagerOrAdmin) {
          // Admin/Manager: show all requests, pending first
          q = query(collection(db, 'leaveRequests'), orderBy('requestedAt', 'desc'));
        } else {
          // Employee: show only their requests
          q = query(collection(db, 'leaveRequests'), where('userId', '==', user.uid), orderBy('requestedAt', 'desc'));
        }
        
        const snap = await getDocs(q as any);
        const requestsData = await Promise.all(
          snap.docs.map(async (d) => {
            const data = { id: d.id, ...(d.data() as DocumentData) } as LeaveRequest;
            
            // Fetch user details for managers/admins
            if (isManagerOrAdmin && data.userId) {
              try {
                const userDoc = await getDoc(doc(db, 'users', data.userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  data.userName = userData.name;
                  data.userEmail = userData.email;
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
              }
            }
            
            return data;
          })
        );
        
        // Sort by status priority for managers (pending first)
        if (isManagerOrAdmin) {
          requestsData.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (b.status === 'pending' && a.status !== 'pending') return 1;
            return 0;
          });
        }
        
        setRequests(requestsData);
      } catch (error) {
        console.error('Error loading leave requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load leave requests',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadRequests();
  }, [db, user, role, isManagerOrAdmin]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.approveLeave(id);
      toast({
        title: 'Leave Approved',
        description: 'The leave request has been approved successfully.'
      });
      // Refresh the list
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve leave request',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id: string) => {
    setActionLoading(id);
    try {
      await api.declineLeave(id);
      toast({
        title: 'Leave Declined',
        description: 'The leave request has been declined.'
      });
      // Refresh the list
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Decline Failed',
        description: error.message || 'Failed to decline leave request',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      annual: 'bg-blue-500',
      sick: 'bg-red-500',
      personal: 'bg-purple-500',
      emergency: 'bg-orange-500',
      maternity: 'bg-pink-500',
      paternity: 'bg-green-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading leave requests...</div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No leave requests found</p>
            <p className="text-sm">Submit your first leave request to see it here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          {isManagerOrAdmin ? 'All Leave Requests' : 'My Leave History'}
          <Badge variant="outline" className="ml-auto">{requests.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getLeaveTypeColor(request.leaveType)}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium capitalize">{request.leaveType} Leave</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    {isManagerOrAdmin && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        {request.userName || request.userEmail || request.userId}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {request.requestedAt?.toDate ? 
                      format(request.requestedAt.toDate(), 'MMM dd, yyyy') : 
                      'Unknown date'
                    }
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Start Date:</span>
                  <p className="font-medium">
                    {request.startDate?.toDate ? 
                      format(request.startDate.toDate(), 'PPP') : 
                      request.startDate
                    }
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date:</span>
                  <p className="font-medium">
                    {request.endDate?.toDate ? 
                      format(request.endDate.toDate(), 'PPP') : 
                      request.endDate
                    }
                  </p>
                </div>
              </div>

              {/* Reason */}
              {request.reason && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Reason:</span>
                  <p className="mt-1 text-gray-700">{request.reason}</p>
                </div>
              )}

              {/* Manager Actions */}
              {isManagerOrAdmin && request.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    size="sm" 
                    onClick={() => handleApprove(request.id)}
                    disabled={actionLoading === request.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {actionLoading === request.id ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDecline(request.id)}
                    disabled={actionLoading === request.id}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    {actionLoading === request.id ? 'Declining...' : 'Decline'}
                  </Button>
                </div>
              )}

              {/* Decision Info */}
              {request.status !== 'pending' && request.decidedAt && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {request.status === 'approved' ? 'Approved' : 'Declined'} on{' '}
                  {format(request.decidedAt.toDate(), 'PPP')}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}