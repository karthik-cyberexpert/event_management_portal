import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Calendar as MiniCalendar } from '@/components/ui/calendar';

const statusColors = {
  pending_hod: 'bg-yellow-500',
  returned_to_coordinator: 'bg-orange-500',
  pending_dean: 'bg-yellow-600',
  returned_to_hod: 'bg-orange-600',
  pending_principal: 'bg-yellow-700',
  returned_to_dean: 'bg-orange-700',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-gray-500',
};

const DeanIrDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [allViewableEvents, setAllViewableEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.events.list();
      setAllViewableEvents(data);
      
      const deanEvents = data.filter((event: any) => 
        event.status === 'pending_dean' || event.status === 'returned_to_dean'
      );
      
      setEvents(deanEvents);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
    return status === 'pending_dean' || status === 'returned_to_dean';
  };

  const eventDays = allViewableEvents.map(e => new Date(e.event_date));

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <h2 className="text-3xl font-bold">Dean IR Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="bg-white rounded-lg shadow h-full flex flex-col">
            <CardHeader>
              <CardTitle>Events Requiring Attention</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-background border-b">
                    <TableHead className="text-primary">Title</TableHead>
                    <TableHead className="text-primary">Submitted Coordinator</TableHead>
                    <TableHead className="text-primary">Dept/Club/Society</TableHead>
                    <TableHead className="text-primary">Venue</TableHead>
                    <TableHead className="text-primary">Date</TableHead>
                    <TableHead className="text-primary">Status</TableHead>
                    <TableHead className="text-primary text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No events are currently pending your approval.</TableCell>
                    </TableRow>
                  ) : (
                    events.map((event: any) => {
                      const isPending = isReviewable(event);
                      return (
                        <TableRow key={event.id} className="bg-accent hover:bg-accent/80 transition-colors">
                          <TableCell className="font-medium text-blue-600">{event.title}</TableCell>
                          <TableCell>{event.profiles?.first_name} {event.profiles?.last_name}</TableCell>
                          <TableCell>{event.department_club || 'N/A'}</TableCell>
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
          role="dean"
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

export default DeanIrDashboard;
