
"use client";

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, query, where, Timestamp } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';

const vehicleBookingSchema = z.object({
  vehicleId: z.string().nonempty("Please select a vehicle."),
  date: z.date({ required_error: "Please select a date." }),
  timeSlot: z.string().nonempty("Please select a time slot."),
});
type VehicleBookingFormData = z.infer<typeof vehicleBookingSchema>;

interface Vehicle { id: string; name: string; capacity: number }
interface Booking { vehicleId: string; date: Timestamp; timeSlot: string; status: 'approved' }
const timeSlots = [ "09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "01:00 PM - 03:00 PM", "03:00 PM - 05:00 PM" ];

export function VehicleBooking() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { control, handleSubmit, watch, formState: { isSubmitting } } = useForm<VehicleBookingFormData>({
        resolver: zodResolver(vehicleBookingSchema),
        defaultValues: { date: new Date() }
    });

    const selectedVehicle = watch('vehicleId');
    const selectedDate = watch('date');
    
    const vehiclesQuery = useMemo(() => query(collection(db, 'vehicles')), []);
    const { data: vehicles, loading: loadingVehicles } = useFirestoreSubscription<Vehicle>({ query: vehiclesQuery });

    const bookingsQuery = useMemo(() => {
        if (!selectedVehicle || !selectedDate) return null;
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        return query(
            collection(db, 'vehicleBookings'),
            where('vehicleId', '==', selectedVehicle),
            where('date', '>=', Timestamp.fromDate(startOfDay)),
            where('date', '<', Timestamp.fromDate(new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000))),
            where('status', '==', 'approved')
        );
    }, [selectedVehicle, selectedDate]);
    
    const { data: approvedBookings, loading: loadingBookings } = useFirestoreSubscription<Booking>({ query: bookingsQuery, enabled: !!selectedVehicle && !!selectedDate });
    const bookedSlots = useMemo(() => approvedBookings?.map(b => b.timeSlot) || [], [approvedBookings]);

    const onSubmit = async (data: VehicleBookingFormData) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'vehicleBookings'), {
                ...data,
                date: Timestamp.fromDate(data.date),
                userId: user.uid,
                requesterName: user.displayName,
                requesterEmail: user.email,
                status: 'pending',
            });
            toast({ title: "Request Submitted", description: "Your vehicle booking request has been sent for approval." });
        } catch (error) {
            toast({ title: "Request Failed", description: "Could not submit your request.", variant: "destructive" });
        }
    };

    return (
        <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle className="font-headline">Book a Company Vehicle</CardTitle>
                    <CardDescription>All requests require manager approval.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <Controller name="date" control={control} render={({ field }) => (
                        <div className="flex flex-col items-center">
                            <Label className="mb-2">Select Date</Label>
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} className="rounded-md border" disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}/>
                        </div>
                    )} />
                    <div className="space-y-4">
                        <Controller name="vehicleId" control={control} render={({ field, fieldState }) => (
                             <div>
                                <Label htmlFor="vehicle">Vehicle</Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="vehicle"><SelectValue placeholder="Select a vehicle..." /></SelectTrigger>
                                <SelectContent>{loadingVehicles ? <SelectItem value="loading" disabled>Loading...</SelectItem> : vehicles?.map(v => <SelectItem key={v.id} value={v.id}>{v.name} (Capacity: {v.capacity})</SelectItem>)}</SelectContent></Select>
                                {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                            </div>
                        )} />
                        <Controller name="timeSlot" control={control} render={({ field, fieldState }) => (
                            <div>
                               <Label htmlFor="time">Time Slot</Label>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedVehicle || !selectedDate || loadingBookings}>
                                <SelectTrigger id="time"><SelectValue placeholder="Select a time..." /></SelectTrigger>
                                <SelectContent>{timeSlots.map(slot => <SelectItem key={slot} value={slot} disabled={bookedSlots.includes(slot)}>{slot}</SelectItem>)}</SelectContent></Select>
                                {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                           </div>
                        )} />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Requesting...' : 'Request Booking'}
                        </Button>
                    </div>
                </CardContent>
            </form>
        </Card>
    );
}
