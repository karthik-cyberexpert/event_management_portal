import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Profile } from '@/contexts/AuthContext';

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'coordinator', 'hod', 'dean', 'principal']),
  department: z.string().optional().nullable(),
  club: z.string().optional().nullable(),
  professional_society: z.string().optional().nullable(),
});

type Department = { id: string; name: string; degree: string; };
type Club = { id: string; name: string; };
type ProfessionalSociety = { id: string; name: string; };

type UserDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: Profile | null;
};

const UserDialog = ({ isOpen, onClose, onSuccess, user }: UserDialogProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [societies, setSocieties] = useState<ProfessionalSociety[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [depts, clubsData, societiesData] = await Promise.all([
          api.departments.list(),
          api.clubs.list(),
          api.societies.list()
        ]);
        setDepartments(depts);
        setClubs(clubsData);
        setSocieties(societiesData);
      } catch (error: any) {
        toast.error('Failed to load dropdown data');
      }
    };
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        role: user.role as any,
        department: user.department || '--none--',
        club: user.club || '--none--',
        professional_society: user.professional_society || '--none--',
      });
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    const updateData = {
      firstName: values.first_name,
      lastName: values.last_name,
      email: values.email,
      role: values.role,
      department: values.department === '--none--' ? null : values.department,
      club: values.club === '--none--' ? null : values.club,
      professionalSociety: values.professional_society === '--none--' ? null : values.professional_society,
    };

    try {
      await api.users.update(user.id, updateData);
      toast.success('User profile updated successfully.');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message}`);
    }
  };

  if (!user) return null;

  const role = form.watch('role');
  const showAssignments = role === 'coordinator' || role === 'hod';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Edit User: {user.first_name} {user.last_name}</DialogTitle>
          <DialogDescription>Update the user's details, role, and assignments.</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl><SelectContent><SelectItem value="coordinator">Coordinator</SelectItem><SelectItem value="hod">HOD</SelectItem><SelectItem value="dean">Dean IR</SelectItem><SelectItem value="principal">Principal</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              
              {showAssignments && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 italic">Assignments (HOD/Coordinator only)</h4>
                  <FormField control={form.control} name="department" render={({ field }) => (<FormItem><FormLabel>Department Assignment</FormLabel><Select onValueChange={field.onChange} value={field.value || '--none--'}><FormControl><SelectTrigger><SelectValue placeholder="Choose department" /></SelectTrigger></FormControl><SelectContent><SelectItem value="--none--">-- None --</SelectItem>{departments.map((dept) => (<SelectItem key={dept.id} value={`${dept.name} (${dept.degree})`}>{dept.name} ({dept.degree})</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="club" render={({ field }) => (<FormItem><FormLabel>Club Assignment</FormLabel><Select onValueChange={field.onChange} value={field.value || '--none--'}><FormControl><SelectTrigger><SelectValue placeholder="Choose club" /></SelectTrigger></FormControl><SelectContent><SelectItem value="--none--">-- None --</SelectItem>{clubs.map((club) => (<SelectItem key={club.id} value={club.name}>{club.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="professional_society" render={({ field }) => (<FormItem><FormLabel>Professional Society Assignment</FormLabel><Select onValueChange={field.onChange} value={field.value || '--none--'}><FormControl><SelectTrigger><SelectValue placeholder="Choose society" /></SelectTrigger></FormControl><SelectContent><SelectItem value="--none--">-- None --</SelectItem>{societies.map((society) => (<SelectItem key={society.id} value={society.name}>{society.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
              )}
            </form>
          </Form>
        </div>

        <div className="p-6 border-t flex justify-end gap-2 bg-slate-50/50">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)}>Update User</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;