import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ProfilePage = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
      });
    }
  }, [profile, form]);

  useEffect(() => {
    if (window.location.hash === '#security-password') {
      setTimeout(() => {
        const element = document.getElementById('security-password');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Small delay to ensure render
    }
  }, []);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!profile) return;

    try {
      await api.auth.updateMe({
        firstName: values.first_name,
        lastName: values.last_name,
      });
      toast.success('Profile updated successfully!');
      await refreshProfile();
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsPasswordLoading(true);
    try {
      await api.auth.updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password updated successfully!');
      passwordForm.reset();
    } catch (error: any) {
      toast.error(`Failed to update password: ${error.message}`);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!profile || !user) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center animate-pulse">
        <div className="w-12 h-12 bg-primary/20 rounded-full mb-4" />
        <div className="h-4 w-32 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-700">
      <div>
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Profile</h2>
        <p className="text-slate-500 font-medium mt-1">Manage your personal information and preferences.</p>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-primary/10 shadow-lg overflow-hidden group">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b pb-8">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary-70 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-200 group-hover:rotate-3 transition-transform">
              {profile.first_name[0]}{profile.last_name[0]}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">Profile Information</CardTitle>
              <CardDescription className="text-slate-500 font-medium mt-1">
                Your personal details and institutional assignments.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <FormField 
                  control={form.control} 
                  name="first_name" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} className="rounded-xl border-slate-200 focus:ring-primary/20 h-12 font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="last_name" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} className="rounded-xl border-slate-200 focus:ring-primary/20 h-12 font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>
              
              <FormItem>
                <FormLabel className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Email Address</FormLabel>
                <Input value={user.email || 'N/A'} disabled className="rounded-xl bg-slate-50 border-slate-200 h-12 font-medium text-slate-500 cursor-not-allowed" />
                <p className="text-[10px] text-slate-400 font-medium">Email cannot be changed as it is linked to your institutional account.</p>
              </FormItem>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Assignments & Role</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FormItem>
                    <FormLabel className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Department</FormLabel>
                    <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                      {profile.department || 'N/A'}
                    </div>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Club</FormLabel>
                    <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                      {profile.club || 'N/A'}
                    </div>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Society</FormLabel>
                    <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                      {profile.professional_society || 'N/A'}
                    </div>
                  </FormItem>
                </div>
                <div className="mt-6">
                  <FormLabel className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">System Role</FormLabel>
                  <Badge className="ml-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase font-black tracking-tighter text-xs px-4 py-1.5 rounded-full">
                    {profile.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t p-8 flex justify-end">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="rounded-xl h-12 px-8 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-indigo-100 transition-all"
              >
                {form.formState.isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card id="security-password" className="bg-white/70 backdrop-blur-sm border-primary/10 shadow-lg overflow-hidden group mt-8">
        <CardHeader className="bg-gradient-to-r from-rose-50/50 to-transparent border-b pb-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-100 group-hover:rotate-3 transition-transform">
              <KeyRound className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">Security & Password</CardTitle>
              <CardDescription className="text-slate-500 font-medium mt-1">
                Update your security credentials to keep your account safe.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <CardContent className="space-y-8 p-8">
              <FormField
                control={passwordForm.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                       Current Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="Enter current password" {...field} className="rounded-xl border-slate-200 h-12 font-medium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                         New Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} className="rounded-xl border-slate-200 h-12 font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                         Confirm New Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} className="rounded-xl border-slate-200 h-12 font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t p-8 flex justify-end">
              <Button 
                type="submit" 
                disabled={isPasswordLoading}
                className="rounded-xl h-12 px-8 font-bold bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all"
              >
                {isPasswordLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;
