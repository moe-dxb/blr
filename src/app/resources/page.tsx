
"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Car } from "lucide-react";
import { VehicleBooking } from "./VehicleBooking";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/hooks/useAuth";

const roomBookingSchema = z.object({
    date: z.date({ required_error: "Please select a date." }),
    roomId: z.string().nonempty("Please select a room."),
    timeSlot: z.string().nonempty("Please select a time slot."),
});

type RoomBookingFormData = z.infer<typeof roomBookingSchema>;

const rooms = [
    { id: "conf-a", name: "Conference Room A (10 people)"},
    { id: "conf-b", name: "Conference Room B (6 people)"},
    { id: "focus-1", name: "Focus Room 1 (2 people)"},
    { id: "focus-2", name: "Focus Room 2 (2 people)"},
];

const timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
];

export default function ResourcesPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { control, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<RoomBookingFormData>({
        resolver: zodResolver(roomBookingSchema),
        defaultValues: { date: new Date() }
    });

    const onRoomBook = async (data: RoomBookingFormData) => {
        if(!user) return;
        try {
            await addDoc(collection(db, "roomBookings"), {
                ...data,
                userId: user.uid,
                userName: user.displayName,
                createdAt: serverTimestamp()
            });
            toast({ title: "Room Booked!", description: "The meeting room has been booked successfully."});
            reset();
        } catch (error) {
            toast({ title: "Error", description: "Could not book the room. Please try again.", variant: "destructive"});
        }
    }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <h1 className="text-3xl font-bold font-headline">Resource Booking</h1>
            <p className="text-muted-foreground">
            Book meeting rooms and other company resources with ease.
            </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="meeting-rooms" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="meeting-rooms"><Building className="h-4 w-4 mr-2" />Meeting Rooms</TabsTrigger>
          <TabsTrigger value="vehicles"><Car className="h-4 w-4 mr-2" />Company Vehicles</TabsTrigger>
        </TabsList>
        <TabsContent value="meeting-rooms">
          <Card>
            <form onSubmit={handleSubmit(onRoomBook)}>
                <CardHeader>
                <CardTitle className="font-headline">Book a Meeting Room</CardTitle>
                <CardDescription>Select a date and time to book a meeting room.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="flex justify-center items-start">
                    <Controller name="date" control={control} render={({ field }) => (
                         <Calendar mode="single" selected={field.value} onSelect={field.onChange} className="rounded-md border" disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}/>
                    )} />
                </div>
                <div className="space-y-4">
                    <Controller name="roomId" control={control} render={({ field }) => (
                        <div>
                            <Label htmlFor="room">Room</Label>
                            <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="room"><SelectValue placeholder="Select a room" /></SelectTrigger>
                            <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
                            {errors.roomId && <p className="text-sm text-destructive mt-1">{errors.roomId.message}</p>}
                        </div>
                    )} />
                    <Controller name="timeSlot" control={control} render={({ field }) => (
                        <div>
                            <Label htmlFor="time">Time Slot</Label>
                            <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="time"><SelectValue placeholder="Select a time" /></SelectTrigger>
                            <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                            {errors.timeSlot && <p className="text-sm text-destructive mt-1">{errors.timeSlot.message}</p>}
                        </div>
                    )} />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Booking..." : "Book Room"}
                    </Button>
                </div>
                </CardContent>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="vehicles">
          <VehicleBooking />
        </TabsContent>
      </Tabs>
    </div>
  );
}
