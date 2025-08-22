// src/app/timesheet/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUserTimesheet } from '@/lib/firebase/get-timesheet-data';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';

interface TimesheetEntry {
  id: string;
  clockInTime: string; // ISO String
  clockOutTime?: string | null; // ISO String or null
}

function calculateDuration(startTime: string, endTime?: string | null): string {
    if (!endTime) return 'In Progress';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = differenceInHours(end, start);
    const minutes = differenceInMinutes(end, start) % 60;
    return `${hours}h ${minutes}m`;
}

// This is now a React Server Component
export default async function TimesheetPage() {
  const entries = await getUserTimesheet();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Your Weekly Timesheet</h1>
      <Card>
        <CardHeader><CardTitle>This Week's Entries</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length > 0 ? entries.map((entry: TimesheetEntry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.clockInTime), 'PPP')}</TableCell>
                  <TableCell>{format(new Date(entry.clockInTime), 'p')}</TableCell>
                  <TableCell>{entry.clockOutTime ? format(new Date(entry.clockOutTime), 'p') : '...'}</TableCell>
                  <TableCell>{calculateDuration(entry.clockInTime, entry.clockOutTime)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="text-center">No entries for this week.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
