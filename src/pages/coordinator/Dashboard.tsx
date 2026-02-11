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
import {
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  List,
  MoreVertical,
  Download,
  CalendarDays,
  Lock,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import EventDialog from '@/components/EventDialog';
import { toast } from 'sonner';
import { cn, isEventFinished, canCoordinatorEdit } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReturnReasonDialog from '@/components/ReturnReasonDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EventReportGeneratorDialog from '@/components/EventReportGeneratorDialog';
import { api } from '@/lib/api';
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

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isReturnReasonDialogOpen, setIsReturnReasonDialogOpen] = useState(false);
  const [isReportGeneratorOpen, setIsReportGeneratorOpen] = useState(false);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const data = await api.events.list();
      setAllEvents(data);
    } catch (error: any) {
      toast.error('Error fetching events.');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleSuccess = () => {
    fetchEvents();
    setSelectedEvent(null);
  };

  const handleViewAction = (event: any) => {
    const isEditable = canCoordinatorEdit(event);
    setSelectedEvent({ 
      ...event, 
      mode: isEditable ? 'edit' : 'view' 
    });
  };
  
  const handleDownloadReport = (event: any) => {
    if (!isEventFinished(event)) {
      toast.error('Event is not yet finished. You can only generate reports after the event date.');
      return;
    }
    setSelectedEvent(event);
    setIsReportGeneratorOpen(true);
  };

  const handleViewPassword = async (event: any) => {
    try {
      const report = await api.reports.get(event.id);
      toast.info(`The report password for "${event.title}" is: ${report.report_password}`, {
        duration: 10000,
      });
    } catch (error) {
      toast.error("Could not retrieve report password.");
    }
  };

  const myEvents = allEvents.filter(e => e.submitted_by === user.id);
  const pendingEvents = myEvents.filter(e => e.status.startsWith('pending') || e.status === 'resubmitted');
  const returnedEvents = myEvents.filter(e => e.status.startsWith('returned') || e.status === 'rejected');
  const approvedEvents = myEvents.filter(e => e.status === 'approved');
  const approvedDays = allEvents.filter(e => e.status === 'approved').map(e => new Date(e.event_date));
  const pendingDays = allEvents.filter(e => 
    e.submitted_by === user.id && 
    (e.status.startsWith('pending') || e.status === 'resubmitted' || e.status.startsWith('returned')) &&
    e.status !== 'approved' && e.status !== 'rejected'
  ).map(e => new Date(e.event_date));
  const rejectedDays = allEvents.filter(e => e.submitted_by === user.id && e.status === 'rejected').map(e => new Date(e.event_date));

  const renderEventTable = (eventsList: any[], title: string) => (
    <Card className="bg-white/70 backdrop-blur-sm border-primary/10 shadow-lg h-full flex flex-col overflow-hidden group">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b pb-4">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          {title}
          <Badge variant="outline" className="bg-white/50">{eventsList.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="py-4 font-bold text-slate-600">Title</TableHead>
              <TableHead className="py-4 font-bold text-slate-600">Dept/Club/Society</TableHead>
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
            ) : eventsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center text-muted-foreground bg-slate-50/30">
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <AlertCircle className="h-8 w-8" />
                    <p>No events found in this category.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              eventsList.map((event: any) => (
                <TableRow key={event.id} className="hover:bg-primary/5 transition-colors group/row">
                  <TableCell className="font-semibold text-slate-900">{event.title}</TableCell>
                  <TableCell className="text-slate-600 font-medium">{event.department_club || 'N/A'}</TableCell>
                  <TableCell className="text-primary font-medium">{event.venues?.name || event.other_venue_details || 'N/A'}</TableCell>
                  <TableCell className="text-slate-600 font-medium">{format(new Date(event.event_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusColors[event.status as keyof typeof statusColors])}>
                      {event.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                          <MoreVertical className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleViewAction(event)} className="cursor-pointer">
                          {canCoordinatorEdit(event) ? (
                            <><PlusCircle className="mr-2 h-4 w-4" /> Edit Event</>
                          ) : (
                            <><List className="mr-2 h-4 w-4" /> View Details</>
                          )}
                        </DropdownMenuItem>
                        {event.status === 'returned_to_coordinator' && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsReturnReasonDialogOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <AlertCircle className="mr-2 h-4 w-4" /> View Remarks History
                            </DropdownMenuItem>
                          )}
                        {event.status === 'approved' && (
                          <DropdownMenuItem onClick={() => handleDownloadReport(event)} className="cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50">
                            {event.has_report ? (
                              <><Download className="mr-2 h-4 w-4" /> Download Report</>
                            ) : (
                              <><PlusCircle className="mr-2 h-4 w-4" /> Generate Report</>
                            )}
                          </DropdownMenuItem>
                        )}
                        {event.status === 'approved' && event.has_report && (
                          <DropdownMenuItem onClick={() => handleViewPassword(event)} className="cursor-pointer text-amber-600 focus:text-amber-700 focus:bg-amber-50">
                            <Eye className="mr-2 h-4 w-4" /> View Password
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 max-w-full overflow-hidden animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Coordinator Dashboard</h2>
          <p className="text-slate-500 font-medium mt-1">Manage and track your overall event submissions.</p>
        </div>
        <Button 
          onClick={() => setSelectedEvent({ mode: 'create' })}
          className="bg-primary hover:bg-primary/90 text-white shadow-indigo-200 shadow-lg px-6 h-12 rounded-xl transition-all active:scale-95 group"
        >
          <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" /> 
          <span className="font-bold">Create New Event</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl w-full sm:w-auto h-auto grid grid-cols-3 sm:flex">
              <TabsTrigger 
                value="pending" 
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pending</span>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700 text-[10px] ml-1 px-1.5 min-w-[1.2rem] group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary transition-colors">{pendingEvents.length}</Badge>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="returned" 
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm font-bold transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Returned</span>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700 text-[10px] ml-1 px-1.5 min-w-[1.2rem] group-data-[state=active]:bg-rose-100 group-data-[state=active]:text-rose-600 transition-colors">{returnedEvents.length}</Badge>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="approved" 
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm font-bold transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <List className="w-4 h-4" />
                  <span>Approved</span>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700 text-[10px] ml-1 px-1.5 min-w-[1.2rem] group-data-[state=active]:bg-emerald-100 group-data-[state=active]:text-emerald-600 transition-colors">{approvedEvents.length}</Badge>
                </div>
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="pending" className="h-[550px] animate-in fade-in slide-in-from-left-4 duration-500">
                {renderEventTable(pendingEvents, "Awaiting Approval")}
              </TabsContent>
              
              <TabsContent value="returned" className="h-[550px] animate-in fade-in slide-in-from-left-4 duration-500">
                {renderEventTable(returnedEvents, "Returned or Rejected")}
              </TabsContent>
              
              <TabsContent value="approved" className="h-[550px] animate-in fade-in slide-in-from-left-4 duration-500">
                {renderEventTable(approvedEvents, "Approved Events")}
              </TabsContent>
            </div>
          </Tabs>
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
                      approved: approvedDays,
                      pending: pendingDays,
                      rejected: rejectedDays
                    }}
                    modifiersStyles={{
                      approved: { backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', borderRadius: '8px', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
                      pending: { backgroundColor: '#f1c40f', color: 'white', fontWeight: 'bold', borderRadius: '8px', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
                      rejected: { backgroundColor: '#e74c3c', color: 'white', fontWeight: 'bold', borderRadius: '8px', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
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

      {selectedEvent && selectedEvent.mode && (
        <EventDialog
          event={selectedEvent.id ? selectedEvent : null}
          isOpen={!!selectedEvent && !isReturnReasonDialogOpen && !isReportGeneratorOpen}
          onClose={() => setSelectedEvent(null)}
          onSuccess={handleSuccess}
          mode={selectedEvent.mode as 'create' | 'edit' | 'view'}
        />
      )}
      
      {selectedEvent && isReturnReasonDialogOpen && (
        <ReturnReasonDialog
          isOpen={isReturnReasonDialogOpen}
          onClose={() => setIsReturnReasonDialogOpen(false)}
          event={selectedEvent}
        />
      )}
      
      {selectedEvent && isReportGeneratorOpen && (
        <EventReportGeneratorDialog
          event={selectedEvent}
          isOpen={isReportGeneratorOpen}
          onClose={() => {
            setIsReportGeneratorOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default CoordinatorDashboard;