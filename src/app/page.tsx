import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Calendar, User, Users, Megaphone } from "lucide-react";
import Image from "next/image";

const announcements = [
  {
    id: 1,
    title: "New Quarter Kick-off",
    date: "2024-07-01",
    content: "Join us for the Q3 kick-off meeting on Monday at 10 AM.",
  },
  {
    id: 2,
    title: "Updated Work From Home Policy",
    date: "2024-06-28",
    content: "Please review the updated WFH policy available in the documents section.",
  },
  {
    id: 3,
    title: "Summer Outing Event",
    date: "2024-06-25",
    content: "Get ready for our annual summer outing next Friday! More details to come.",
  },
];

const teamMembers = [
  { name: "Alice Johnson", role: "UX Designer", avatar: "https://placehold.co/40x40.png", hint: "woman face" },
  { name: "Bob Williams", role: "Frontend Developer", avatar: "https://placehold.co/40x40.png", hint: "man face" },
  { name: "Charlie Brown", role: "Backend Developer", avatar: "https://placehold.co/40x40.png", hint: "man face" },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Welcome Back, John!</h1>
        <p className="text-muted-foreground">Here's your dashboard overview for today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clock In/Out</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">09:05 AM</div>
            <p className="text-xs text-muted-foreground">Clocked in</p>
            <Button className="mt-4 w-full">Clock Out</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Days</div>
            <p className="text-xs text-muted-foreground">Annual leave remaining</p>
            <Button variant="outline" className="mt-4 w-full">Request Leave</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">75% Complete</div>
             <p className="text-xs text-muted-foreground">Keep your profile updated</p>
             <Button variant="outline" className="mt-4 w-full">View Profile</Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Directory</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">150+ Employees</div>
             <p className="text-xs text-muted-foreground">Connect with your colleagues</p>
             <Button variant="outline" className="mt-4 w-full">Open Directory</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5"/>
              <CardTitle className="font-headline">HR Announcements</CardTitle>
            </div>
            <CardDescription>Latest updates from the HR department.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-semibold">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground">{announcement.date}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">My Team</CardTitle>
            <CardDescription>Your direct reporting team.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} data-ai-hint={member.hint} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
