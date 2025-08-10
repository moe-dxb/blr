
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Users, PlusCircle } from "lucide-react";

const groups = [
  { id: 1, name: 'Running Club', members: 24, image: 'https://placehold.co/600x400.png', hint: 'people running' },
  { id: 2, name: 'Bookworms Society', members: 15, image: 'https://placehold.co/600x400.png', hint: 'books library' },
  { id: 3, name: 'Board Game Geeks', members: 32, image: 'https://placehold.co/600x400.png', hint: 'board games' },
  { id: 4, name: 'Sustainability Squad', members: 18, image: 'https://placehold.co/600x400.png', hint: 'nature recycling' },
];

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Community & Groups</h1>
          <p className="text-muted-foreground">
            Connect with colleagues who share your interests.
          </p>
        </div>
        <Button>
            <PlusCircle className="mr-2" />
            Create New Group
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {groups.map(group => (
          <Card key={group.id} className="overflow-hidden">
            <CardHeader className="p-0">
                <Image src={group.image} alt={group.name} width={600} height={400} className="w-full h-40 object-cover" data-ai-hint={group.hint} />
            </CardHeader>
            <CardContent className="p-4">
                <CardTitle className="font-headline text-lg">{group.name}</CardTitle>
                <div className="flex items-center text-muted-foreground text-sm mt-2">
                    <Users className="h-4 w-4 mr-2" />
                    {group.members} members
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full">Join Group</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
