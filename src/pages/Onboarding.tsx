import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';

const onboardingSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const OnboardingPage = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof onboardingSchema>) => {
    setLoading(true);
    try {
      await api.auth.onboard({ password: values.password });
      toast.success('Account personalized successfully!');
      await refreshProfile();
      navigate('/');
    } catch (error: any) {
      toast.error(`Setup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-transparent animate-in fade-in zoom-in duration-500">
      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-md border-primary/10 shadow-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-rose-500" />
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-primary/5">
            <ShieldCheck className="w-8 h-8 text-primary shadow-sm" />
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
            Personalize Your Account
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium text-lg mt-2">
            Welcome, <span className="text-primary font-bold">{profile.first_name}</span>. Please set a secure password to complete your account activation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 font-bold uppercase text-[11px] tracking-widest flex items-center gap-2">
                      <Lock className="w-3 h-3" /> New Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput 
                        placeholder="••••••••" 
                        {...field} 
                        className="h-12 rounded-xl border-slate-200 focus:ring-primary/20 bg-slate-50/50 font-medium transition-all"
                      />
                    </FormControl>
                    <FormMessage className="font-bold text-rose-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 font-bold uppercase text-[11px] tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> Confirm Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput 
                        placeholder="••••••••" 
                        {...field} 
                        className="h-12 rounded-xl border-slate-200 focus:ring-primary/20 bg-slate-50/50 font-medium transition-all"
                      />
                    </FormControl>
                    <FormMessage className="font-bold text-rose-500" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg tracking-tight shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                disabled={loading}
              >
                {loading ? 'Processing...' : (
                  <span className="flex items-center justify-center gap-2">
                    Complete Activation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="bg-slate-50/50 p-6 flex justify-center border-t border-slate-100">
          <p className="text-sm text-slate-400 font-medium">
            This security step is mandatory for institutional accounts.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingPage;
