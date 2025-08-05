import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const users = [
  { id: 1, name: "Aisha Khan", email: "aisha.khan@blr.com", role: "Admin" },
  { id: 2, name: "Ben Carter", email: "ben.carter@blr.com", role: "Editor" },
  { id: 3, name: "Carla Rodriguez", email: "carla.rodriguez@blr.com", role: "Viewer" },
  { id: 4, name: "David Chen", email: "david.chen@blr.com", role: "Editor" },
  { id: 5, name: "John Doe", email: "john.doe@blr.com", role: "Superadmin" },
];

const roles = ["Superadmin", "Admin", "Editor", "Viewer"];

const permissionsByRole: Record<string, string[]> = {
    Superadmin: ["All"],
    Admin: ["Edit Users", "Manage Content", "View Analytics"],
    Editor: ["Manage Content"],
    Viewer: ["View Analytics"],
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions across the application.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">User Management</CardTitle>
          <CardDescription>
            Assign roles to users to control their access and abilities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    {user.email === "john.doe@blr.com" ? (
                      <Badge variant="destructive">Superadmin</Badge>
                    ) : (
                      <Select defaultValue={user.role}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                        {permissionsByRole[user.role as keyof typeof permissionsByRole]?.map(permission => (
                            <Badge key={permission} variant="secondary">{permission}</Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.email !== "john.doe@blr.com" && (
                         <Button variant="outline" size="sm">Save</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
