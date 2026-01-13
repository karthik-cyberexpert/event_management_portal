import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle, Upload, MoreVertical, Lock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import UserDialog from '@/components/UserDialog';
import AddUserDialog from '@/components/AddUserDialog';
import BulkUserUploadDialog from '@/components/BulkUserUploadDialog';
import { toast } from 'sonner';
import { Profile } from '@/contexts/AuthContext';

type UserWithEmail = Profile & {
  email: string;
};

const ALL_ROLES = ['coordinator', 'hod', 'dean', 'principal', 'admin'] as const;
type Role = typeof ALL_ROLES[number];
type AssignmentFilter = 'department' | 'club' | 'society' | 'direct';

const roleDisplayMap: Record<Role, string> = {
  coordinator: 'Coordinators',
  hod: 'HODs',
  dean: 'Dean IRs',
  principal: 'Principals',
  admin: 'Admins',
};

const ManageUsers = () => {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  
  const [activeRole, setActiveRole] = useState<Role>('coordinator');
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>('department');

  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      const data = await api.users.list();
      setUsers(data as UserWithEmail[]);
    } catch (error: any) {
      toast.error(`Failed to fetch users: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: Profile) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleResetPassword = async (user: UserWithEmail) => {
    if (!confirm(`Are you sure you want to reset password for ${user.first_name} ${user.last_name}? It will be reset to "welcome123" and the user will be forced to change it on their next login.`)) {
      return;
    }

    try {
      await api.users.resetPassword(user.id);
      toast.success(`Password for ${user.first_name} reset to welcome123`);
    } catch (error: any) {
      toast.error(`Failed to reset password: ${error.message}`);
    }
  };

  const filteredUsers = useMemo(() => {
    const roleFiltered = users.filter(user => user.role === activeRole);

    if (activeRole === 'coordinator' || activeRole === 'hod') {
      if (assignmentFilter === 'department') return roleFiltered.filter(user => user.department);
      if (assignmentFilter === 'club') return roleFiltered.filter(user => user.club);
      if (assignmentFilter === 'society') return roleFiltered.filter(user => user.professional_society);
      if (assignmentFilter === 'direct') return roleFiltered.filter(user => !user.department && !user.club && !user.professional_society);
    }
    
    return roleFiltered;
  }, [users, activeRole, assignmentFilter]);

  const getAssignmentValue = (user: UserWithEmail) => {
    if (user.role === 'coordinator' || user.role === 'hod') {
      const assignments = [];
      if (user.department) assignments.push(user.department);
      if (user.club) assignments.push(user.club);
      if (user.professional_society) assignments.push(user.professional_society);
      
      return assignments.length > 0 ? assignments.join(', ') : 'Direct (No HOD)';
    }
    return 'N/A';
  };

  const getAssignmentHeader = () => {
    return 'Assignments';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Manage Users</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Bulk Upload
          </Button>
          <Button onClick={() => setIsAddUserDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <UserDialog isOpen={isUserDialogOpen} onClose={() => setIsUserDialogOpen(false)} onSuccess={fetchUsers} user={selectedUser} />
      <AddUserDialog isOpen={isAddUserDialogOpen} onClose={() => setIsAddUserDialogOpen(false)} onSuccess={fetchUsers} />
      <BulkUserUploadDialog isOpen={isBulkUploadDialogOpen} onClose={() => setIsBulkUploadDialogOpen(false)} onSuccess={fetchUsers} />

      <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as Role)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {ALL_ROLES.map(role => (<TabsTrigger key={role} value={role}>{roleDisplayMap[role]}</TabsTrigger>))}
        </TabsList>

        {ALL_ROLES.map(role => (
          <TabsContent key={role} value={role} className="mt-4">
            {(role === 'coordinator' || role === 'hod') && (
              <div className="flex items-center gap-4 mb-4 bg-card p-4 rounded-lg shadow">
                <Label className="font-semibold">Assignment Type:</Label>
                <RadioGroup value={assignmentFilter} onValueChange={(value: AssignmentFilter) => setAssignmentFilter(value)} className="flex space-x-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="department" id="r1" /><Label htmlFor="r1">Department</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="club" id="r2" /><Label htmlFor="r2">Club</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="society" id="r3" /><Label htmlFor="r3">Professional Society</Label></div>
                  {role === 'coordinator' && <div className="flex items-center space-x-2"><RadioGroupItem value="direct" id="r4" /><Label htmlFor="r4" className="text-primary font-bold">Direct (No HOD)</Label></div>}
                </RadioGroup>
              </div>
            )}

            <div className="bg-card rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <TableHead className="text-primary-foreground">Name</TableHead>
                    <TableHead className="text-primary-foreground">Email Address</TableHead>
                    <TableHead className="text-primary-foreground">{getAssignmentHeader()}</TableHead>
                    <TableHead className="text-primary-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No {role}s found for this filter.</TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="bg-card hover:bg-accent transition-colors">
                        <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getAssignmentValue(user)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleResetPassword(user)} className="text-destructive focus:text-destructive">
                                <Lock className="mr-2 h-4 w-4" /> Reset Password
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ManageUsers;
