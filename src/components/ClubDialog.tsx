import { useEffect } from 'react';
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
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Club name is required'),
});

type Club = {
  id: string;
  name: string;
};

type ClubDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  club?: Club | null;
};

const ClubDialog = ({ isOpen, onClose, onSuccess, club }: ClubDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (club) {
      form.reset({ name: club.name });
    } else {
      form.reset({ name: '' });
    }
  }, [club, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (club) {
        await api.clubs.update(club.id, values);
        toast.success('Club updated successfully.');
      } else {
        await api.clubs.create(values);
        toast.success('Club added successfully.');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(`Failed to save club: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{club ? 'Edit Club' : 'Add New Club'}</DialogTitle>
          <DialogDescription>
            {club ? 'Update the details for this club.' : 'Enter the details for the new club.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Coding Club" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Club'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClubDialog;