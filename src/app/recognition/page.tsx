import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp } from "lucide-react";

const employees = [
    { id: 1, name: 'Aisha Khan' },
    { id: 2, name: 'Ben Carter' },
    { id: 3, name: 'Carla Rodriguez' },
    { id: 4, name: 'David Chen' },
    { id: 5, name: 'Emily White' },
];

const recognitions = [
  {
    id: 1,
    recognizer: "Ben Carter",
    recognized: "Aisha Khan",
    message: "Aisha's leadership on the new feature launch was incredible. She kept the team focused and motivated, and her technical expertise was invaluable in overcoming some tough challenges.",
    avatar: "https://placehold.co/100x100.png",
    hint: "man face",
  },
  {
    id: 2,
    recognizer: "Emily White",
    recognized: "David Chen",
    message: "Huge thanks to David for his insightful product feedback. His detailed analysis helped us prioritize the most impactful features for our users.",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman professional",
  },
];

export default function RecognitionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Peer Recognition</h1>
        <p className="text-muted-foreground">
          Recognize your colleagues for their hard work and contributions.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Give Recognition</CardTitle>
              <CardDescription>
                Acknowledge a team member's great work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Recognize a Colleague</Label>
                <Select>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.name}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Why are you recognizing them?"
                  rows={5}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <ThumbsUp className="mr-2 h-4 w-4" />
                Submit Recognition
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold font-headline">Recognition Feed</h2>
            {recognitions.map((rec) => (
                 <Card key={rec.id}>
                 <CardContent className="p-4 flex gap-4 items-start">
                   <Avatar className="h-12 w-12">
                     <AvatarImage src={rec.avatar} data-ai-hint={rec.hint}/>
                     <AvatarFallback>{rec.recognizer.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div className="flex-1">
                     <p className="font-semibold">
                       {rec.recognizer}{" "}
                       <span className="font-normal text-muted-foreground">
                         recognized
                       </span>{" "}
                       {rec.recognized}
                     </p>
                     <p className="text-sm text-muted-foreground mt-1">{rec.message}</p>
                   </div>
                   <div className="text-primary flex items-center gap-1 text-sm font-semibold">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Kudos</span>
                   </div>
                 </CardContent>
               </Card>
            ))}
        </div>
      </div>
    </div>
  );
}