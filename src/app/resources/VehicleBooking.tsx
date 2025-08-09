"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

// NOTE: In a real app, this would come from the auth context
const CURRENT_USER = {
    uid: "user123",
    name: "John Doe",
    email: "john.doe@blr-world.com"
};

interface Vehicle {
    id: string;
    name: string;
    capacity: number;
}

interface Booking {
    vehicleId: string;
    userId: string;
    requesterName: string;
    requesterEmail: string;
    date: Timestamp;
    timeSlot: string;
    status: 'pending' | 'approved' | 'rejected';
}

export function VehicleBooking() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const vehiclesCollection = collection(db, 'vehicles');
                const vehicleSnapshot = await getDocs(vehiclesCollection);
                const vehicleList = vehicleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
                setVehicles(vehicleList);
            } catch (error) {
                console.error("Error fetching vehicles:", error);
                toast({
                    title: "Error",
                    description: "Could not fetch company vehicles.",
                    variant: "destructive",
                });
            }
        };
        fetchVehicles();
    }, [toast]);

    useEffect(() => {
        const fetchBookings = async () => {
            if (selectedVehicle && selectedDate) {
                try {
                    const bookingsCollection = collection(db, 'vehicleBookings');
                    const startOfDay = new Date(selectedDate);
                    startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(selectedDate);
                    endOfDay.setHours(23, 59, 59, 999);

                    const q = query(
                        bookingsCollection,
                        where('vehicleId', '==', selectedVehicle),
                        where('date', '>=', Timestamp.fromDate(startOfDay)),
                        where('date', '<=', Timestamp.fromDate(endOfDay)),
                        where('status', '==', 'approved') // Only approved bookings block slots
                    );
                    const bookingSnapshot = await getDocs(q);
                    const approvedTimes = bookingSnapshot.docs.map(doc => (doc.data() as Booking).timeSlot);
                    setBookedSlots(approvedTimes);
                } catch (error) {
                    console.error("Error fetching approved bookings:", error);
                }
            }
        };
        fetchBookings();
    }, [selectedVehicle, selectedDate]);


    const handleBookingRequest = async () => {
        if (!selectedVehicle || !selectedDate || !selectedTime) {
            toast({
                title: "Incomplete Information",
                description: "Please select a vehicle, date, and time slot.",
                variant: "destructive",
            });
            return;
        }

        try {
            const newBookingRequest: Omit<Booking, 'id'> = {
                vehicleId: selectedVehicle,
                userId: CURRENT_USER.uid,
                requesterName: CURRENT_USER.name,
                requesterEmail: CURRENT_USER.email,
                date: Timestamp.fromDate(selectedDate),
                timeSlot: selectedTime,
                status: 'pending', // All new requests are pending
            };

            await addDoc(collection(db, 'vehicleBookings'), newBookingRequest);

            toast({
                title: "Request Submitted",
                description: `Your request for a vehicle on ${selectedDate.toDateString()} at ${selectedTime} has been submitted for approval.`,
            });
            
            // Reset form
            setSelectedVehicle('');
            setSelectedDate(new Date());
            setSelectedTime('');
            
        } catch (error) {
            console.error("Error creating booking request:", error);
            toast({
                title: "Request Failed",
                description: "Could not submit your request. Please try again.",
                variant: "destructive",
            });
        }
    };

    const timeSlots = [
        "09:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "12:00 PM - 01:00 PM",
        "01:00 PM - 02:00 PM",
        "02:00 PM - 03:00 PM",
        "03:00 PM - 04:00 PM",
        "04:00 PM - 05:00 PM",
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Book a Company Vehicle</CardTitle>
                <CardDescription>
                    Choose a vehicle and a time slot to request a booking. All requests require manager approval.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <Label>Select Date</Label>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                        />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="vehicle">Vehicle</Label>
                            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                                <SelectTrigger id="vehicle">
                                    <SelectValue placeholder="Select a vehicle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicles.map(vehicle => (
                                        <SelectItem key={vehicle.id} value={vehicle.id}>
                                            {vehicle.name} (Capacity: {vehicle.capacity})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="time">Time Slot</Label>
                            <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedVehicle || !selectedDate}>
                                <SelectTrigger id="time">
                                    <SelectValue placeholder="Select a time" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map(slot => (
                                         <SelectItem key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
                                            {slot}
                                         </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full" onClick={handleBookingRequest} disabled={!selectedVehicle || !selectedDate || !selectedTime}>
                            Request Booking
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
