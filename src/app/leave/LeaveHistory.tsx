// src/app/leave/LeaveHistory.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'submitted' | 'approved' | 'declined';
  createdAt: string; // ISO string
}

interface LeaveHistoryProps {
  initialHistory: LeaveRequest[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'submitted':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'declined':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><X className="h-3 w-3 mr-1" />Declined</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function LeaveHistory({ initialHistory }: LeaveHistoryProps) {
  if (initialHistory.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>You haven't requested any leave yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Leave History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {initialHistory.map((request) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold capitalize">{request.leaveType} Leave</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(request.startDate), 'PPP')} to {format(new Date(request.endDate), 'PPP')}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>
              {request.reason && <p className="text-sm text-gray-600 mt-2">{request.reason}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
