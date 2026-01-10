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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import EventActionDialog from '@/components/EventActionDialog';
import EventDialog from '@/components/EventDialog';
import { toast } from 'sonner';
import { CalendarDays, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Calendar as MiniCalendar } from '@/components/ui/calendar';

const statusColors = {
  pending_hod: 'bg-amber-100 text-amber-700 border-amber-200',
  returned_to_coordinator: 'bg-rose-100 text-rose-700 border-rose-200',
  pending_dean: 'bg-amber-100 text-amber-700 border-amber-200',
  returned_to_hod: 'bg-rose-100 text-rose-700 border-rose-200',
  pending_principal: 'bg-amber-100 text-amber-700 border-amber-200',
  returned_to_dean: 'bg-rose-100 text-rose-700 border-rose-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
};

const PrincipalDashboard = () => {
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
      const pendingEvents = data.filter((event: any) => 
        event.status === 'pending_principal' || event.status === 'returned_to_principal'
      );
      setEvents(pendingEvents);
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
    return event.status === 'pending_principal' || event.status === 'returned_to_principal';
  };

  const eventDays = allViewableEvents.filter(e => e.status === 'approved').map(e => new Date(e.event_date));

  return (
    <div className="space-y-8 max-w-full overflow-hidden animate-in fade-in duration-700">
      <div>
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Principal Dashboard</h2>
        <p className="text-slate-500 font-medium mt-1">Final review and approval of institution events.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Card className="bg-white/70 backdrop-blur-sm border-primary/10 shadow-lg h-full flex flex-col overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b pb-4">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Events Requiring Attention
                <Badge variant="outline" className="bg-primary/10 text-primary-700 border-primary/20 font-bold">{events.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="py-4 font-bold text-slate-600">Title</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Coordinator</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Venue</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Date</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600 text-center">Status</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-64 text-center text-muted-foreground animate-pulse">Loading events...</TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-64 text-center text-muted-foreground bg-slate-50/30">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <CheckCircle className="h-8 w-8 text-emerald-500" />
                          <p>No events are currently pending your approval.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event: any) => (
                      <TableRow key={event.id} className="hover:bg-primary/5 transition-colors group/row">
                        <TableCell className="font-semibold text-slate-900">{event.title}</TableCell>
                        <TableCell className="text-slate-600 font-medium">{event.profiles?.first_name} {event.profiles?.last_name}</TableCell>
                        <TableCell className="text-primary font-medium">{event.venues?.name || event.other_venue_details || 'N/A'}</TableCell>
                        <TableCell className="text-slate-600 font-medium">{format(new Date(event.event_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusColors[event.status as keyof typeof statusColors])}>
                            {event.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                            <Button 
                              variant={isReviewable(event) ? 'default' : 'outline'} 
                              size="sm" 
                              className={cn("rounded-lg font-bold transition-all px-4", isReviewable(event) ? "bg-primary hover:bg-primary/90 shadow-indigo-200 shadow-md" : "")}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-2xl border-primary/5 rounded-3xl overflow-hidden ring-1 ring-slate-900/5">
            <CardHeader className="bg-gradient-to-br from-primary to-primary-70 pt-8 pb-6 text-center text-white">
              <CardTitle className="text-2xl font-black flex items-center justify-center gap-3">
                <CalendarDays className="h-7 w-7 text-white/90" />
                Schedule
              </CardTitle>
              <p className="text-white/60 text-xs mt-2 font-bold uppercase tracking-widest">Monthly Overview</p>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center bg-white">
              <div className="w-full flex flex-col items-center group/cal">
                <div className="w-full flex justify-center">
                  <MiniCalendar
                    mode="single"
                    selected={new Date()}
                    onDayClick={() => navigate('/all-events?tab=calendar')}
                    className="transform scale-110 origin-center py-2"
                    modifiers={{
                      event: eventDays
                    }}
                    modifiersStyles={{
                      event: { backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', borderRadius: '8px', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
                    }}
                  />
                </div>
                <div className="mt-8 w-full group/btn">
                  <Button 
                    onClick={() => navigate('/all-events?tab=calendar')}
                    variant="outline" 
                    className="w-full rounded-xl py-6 font-black text-slate-800 border-2 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-md group-hover/btn:translate-y-[-2px]"
                  >
                    Events Calendar
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">Click a date to view full calendar</p>
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
          role="principal"
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

export default PrincipalDashboard;
