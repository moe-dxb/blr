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

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Resource Booking</h1>
        <p className="text-muted-foreground">
          Book meeting rooms and other company resources with ease.
        </p>
      </div>

      <Tabs defaultValue="meeting-rooms" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="meeting-rooms">
            <Building className="h-4 w-4 mr-2" />
            Meeting Rooms
          </TabsTrigger>
          <TabsTrigger value="vehicles">
            <Car className="h-4 w-4 mr-2" />
            Company Vehicles
          </TabsTrigger>
        </TabsList>
        <TabsContent value="meeting-rooms">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Book a Meeting Room</CardTitle>
              <CardDescription>
                Select a date and time to book a meeting room.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={new Date()}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="room">Room</Label>
                  <Select>
                    <SelectTrigger id="room">
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conf-a">Conference Room A (10 people)</SelectItem>
                      <SelectItem value="conf-b">Conference Room B (6 people)</SelectItem>
                      <SelectItem value="focus-1">Focus Room 1 (2 people)</SelectItem>
                      <SelectItem value="focus-2">Focus Room 2 (2 people)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Time Slot</Label>
                  <Select>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9-10">09:00 AM - 10:00 AM</SelectItem>
                      <SelectItem value="10-11">10:00 AM - 11:00 AM</SelectItem>
                      <SelectItem value="11-12">11:00 AM - 12:00 PM</SelectItem>
                      <SelectItem value="1-2">01:00 PM - 02:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Book Room</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vehicles">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Book a Company Vehicle</CardTitle>
              <CardDescription>
                Vehicles are available for business-related travel.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center p-8">
                <Car className="h-16 w-16 text-muted-foreground mb-4"/>
                <h3 className="text-xl font-semibold">Coming Soon</h3>
                <p className="text-muted-foreground">The vehicle booking module is currently under development.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
