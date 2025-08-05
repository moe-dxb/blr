import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Feedback & Suggestions</h1>
        <p className="text-muted-foreground">
          We value your input! Share your ideas, feedback, and suggestions with us.
        </p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Submit Your Feedback</CardTitle>
          <CardDescription>
            Your submission can be anonymous if you choose.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="e.g., Idea for improving team meetings" />
          </div>
          <div className="space-y-2">
            <Label>Type of Feedback</Label>
            <RadioGroup defaultValue="suggestion" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="suggestion" id="r1" />
                <Label htmlFor="r1">Suggestion</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="concern" id="r2" />
                <Label htmlFor="r2">Concern</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compliment" id="r3" />
                <Label htmlFor="r3">Compliment</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Describe your feedback in detail..."
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Your Name (Optional)</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Submit Feedback</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
