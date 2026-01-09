import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import EventActionDialog from '@/components/EventActionDialog';
import EventDialog from '@/components/EventDialog';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List, ShieldCheck, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Calendar as MiniCalendar } from '@/components/ui/calendar';

const statusColors = {
  pending_hod: 'bg-yellow-500',
  resubmitted: 'bg-indigo-500',
  returned_to_coordinator: 'bg-orange-500',
  pending_dean: 'bg-yellow-600',
  returned_to_hod: 'bg-orange-600',
  pending_principal: 'bg-yellow-700',
  returned_to_dean: 'bg-orange-700',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-gray-500',
};

const HodDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchEvents = async () => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.events.list();
      const departmentEvents = data.filter((event: any) => 
        (event.department === profile.department) || (event.department_club === profile.department)
      );
      setAllEvents(departmentEvents);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchEvents();
    }
  }, [profile]);

  const handleActionSuccess = () => {
    fetchEvents();
    setSelectedEvent(null);
  };

  const handleViewDetails = (event: any) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };
  
  const isReviewable = (event: any) => {
    const status = event.status;
    return status === 'pending_hod' || status === 'returned_to_hod' || status === 'resubmitted';
  };

  const pendingEvents = allEvents.filter(e => isReviewable(e));
  const eventDays = allEvents.map(e => new Date(e.event_date));

  const renderEventTable = (eventsList: any[], title: string) => (
    <Card className="bg-white rounded-lg shadow h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-background border-b">
              <TableHead className="text-primary">Title</TableHead>
              <TableHead className="text-primary">Submitted By</TableHead>
              <TableHead className="text-primary">Venue</TableHead>
              <TableHead className="text-primary">Date</TableHead>
              <TableHead className="text-primary">Status</TableHead>
              <TableHead className="text-primary text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : eventsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No events found in this category.</TableCell>
              </TableRow>
            ) : (
              eventsList.map((event: any) => {
                const isPending = isReviewable(event);
                return (
                  <TableRow key={event.id} className="bg-accent hover:bg-accent/80 transition-colors">
                    <TableCell className="font-medium text-blue-600">{event.title}</TableCell>
                    <TableCell>{event.profiles?.first_name} {event.profiles?.last_name}</TableCell>
                    <TableCell className={isPending ? "font-semibold text-blue-600" : ""}>
                      {event.venues?.name || event.other_venue_details || 'N/A'}
                    </TableCell>
                    <TableCell>{format(new Date(event.event_date), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[event.status as keyof typeof statusColors]} text-white capitalize text-[10px]`}>
                        {event.status.replace(/_/g, ' ').replace('dean', 'Dean IR')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant={isReviewable(event) ? 'outline' : 'ghost'} 
                        size="sm" 
                        onClick={() => {
                          if (isReviewable(event)) {
                            setSelectedEvent(event);
                          } else {
                            handleViewDetails(event);
                          }
                        }}
                      >
                        {isReviewable(event) ? 'Review' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <h2 className="text-3xl font-bold">HOD Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="pending">
            <TabsList className="mb-4 bg-muted p-1 rounded-lg">
              <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm">
                <ShieldCheck className="w-4 h-4 mr-2 hidden sm:inline" />
                Pending My Action ({pendingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm">
                <List className="w-4 h-4 mr-2 hidden sm:inline" />
                All Department Events ({allEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="h-[500px]">
              {renderEventTable(pendingEvents, "Events Requiring My Approval")}
            </TabsContent>
            
            <TabsContent value="all" className="h-[500px]">
              {renderEventTable(allEvents, "All Department Events")}
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6 shadow-sm border-primary/10">
            <CardHeader className="pb-3 text-center border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center justify-center gap-2 text-primary">
                <CalendarDays className="h-5 w-5" />
                Mini Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <div 
                className="cursor-pointer rounded-xl transition-all border-2 border-transparent p-3 w-full flex flex-col items-center group"
                onClick={() => navigate('/all-events?tab=calendar')}
              >
                <div className="bg-white rounded-lg p-1 shadow-sm border border-border/50">
                  <MiniCalendar
                    mode="single"
                    selected={new Date()}
                    className="pointer-events-none"
                    modifiers={{
                      event: eventDays
                    }}
                    modifiersStyles={{
                      event: { backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', borderRadius: '4px' }
                    }}
                  />
                </div>
                <div className="mt-4 w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    View Full Approved Calendar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedEvent && !isViewDialogOpen && (
        <EventActionDialog
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onActionSuccess={handleActionSuccess}
          role="hod"
        />
      )}

      {selectedEvent && isViewDialogOpen && (
        <EventDialog
          event={selectedEvent}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedEvent(null);
          }}
          onSuccess={handleActionSuccess}
          mode="view"
        />
      )}
    </div>
  );
};

export default HodDashboard;
