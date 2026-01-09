import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProfessionalSocietyDialog from '@/components/ProfessionalSocietyDialog';
import { toast } from 'sonner';
import { Profile } from '@/contexts/AuthContext';

type ProfessionalSociety = {
  id: string;
  name: string;
};

type SocietyDetails = ProfessionalSociety & {
  coordinators: Profile[];
};

const ManageProfessionalSocieties = () => {
  const [societies, setSocieties] = useState<SocietyDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState<ProfessionalSociety | null>(null);

  const fetchSocieties = async () => {
    setLoading(true);
    
    try {
      const societiesData = await api.societies.list();
      const profilesData = await api.users.list();

      const societiesWithDetails = societiesData.map(society => {
        const coordinators = profilesData.filter(p => p.professional_society === society.name);
        return { ...society, coordinators };
      });

      setSocieties(societiesWithDetails);
    } catch (error: any) {
      toast.error('Failed to fetch societies.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  const handleAdd = () => {
    setSelectedSociety(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (society: ProfessionalSociety) => {
    setSelectedSociety(society);
    setIsDialogOpen(true);
  };

  const handleDelete = async (societyId: string) => {
    try {
      await api.societies.delete(societyId);
      toast.success('Professional society deleted successfully.');
      fetchSocieties();
    } catch (error: any) {
      toast.error(`Failed to delete society: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Manage Professional Societies</h2>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Society
        </Button>
      </div>

      <ProfessionalSocietyDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchSocieties}
        society={selectedSociety}
      />

      <div className="bg-card rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <TableHead className="text-primary-foreground">Name</TableHead>
              <TableHead className="text-primary-foreground">Coordinators</TableHead>
              <TableHead className="text-primary-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : societies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">No professional societies found.</TableCell>
              </TableRow>
            ) : (
              societies.map((society) => (
                <TableRow key={society.id} className="bg-card hover:bg-accent transition-colors">
                  <TableCell className="font-medium">{society.name}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          {society.coordinators?.length || 0} { (society.coordinators?.length || 0) === 1 ? 'Coordinator' : 'Coordinators'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {(society.coordinators?.length || 0) > 0 ? (
                          society.coordinators.map(c => (
                            <DropdownMenuItem key={c.id}>
                              {c.first_name} {c.last_name}
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <DropdownMenuItem disabled>No coordinators assigned</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(society)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the professional society.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(society.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManageProfessionalSocieties;