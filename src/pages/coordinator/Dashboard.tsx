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
  MoreHorizontal,
  Download,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import EventDialog from '@/components/EventDialog';
import { toast } from 'sonner';
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
  pending_hod: 'bg-yellow-500',
  pending_dean: 'bg-yellow-500',
  pending_principal: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  returned_to_hod: 'bg-orange-500',
  returned_to_dean: 'bg-orange-500',
  cancelled: 'bg-gray-500',
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
    const isReturned = event.status === 'returned_to_coordinator';
    setSelectedEvent({ 
      ...event, 
      mode: isReturned ? 'edit' : 'view' 
    });
  };
  
  const handleDownloadReport = (event: any) => {
    setSelectedEvent(event);
    setIsReportGeneratorOpen(true);
  };

  const myEvents = allEvents.filter(e => e.submitted_by === user.id);
  const pendingEvents = myEvents.filter(e => e.status.startsWith('pending') || e.status === 'resubmitted');
  const returnedEvents = myEvents.filter(e => e.status.startsWith('returned') || e.status === 'rejected');
  const approvedEvents = myEvents.filter(e => e.status === 'approved');
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
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : eventsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No events found in this category.</TableCell>
              </TableRow>
            ) : (
              eventsList.map((event: any) => {
                const isReturned = event.status === 'returned_to_coordinator';
                const isApproved = event.status === 'approved';
                return (
                  <TableRow key={event.id} className="bg-accent hover:bg-accent/80 transition-colors">
                    <TableCell className="font-medium text-blue-600">{event.title}</TableCell>
                    <TableCell>{event.department_club || 'N/A'}</TableCell>
                    <TableCell>{event.venues?.name || event.other_venue_details || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(event.event_date), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[event.status as keyof typeof statusColors]} text-white capitalize text-[10px]`}>
                        {event.status.replace(/_/g, ' ').replace('dean', 'Dean IR')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewAction(event)}>
                            {isReturned ? 'Edit & Resubmit' : 'View Details'}
                          </DropdownMenuItem>
                          
                          {isReturned && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsReturnReasonDialogOpen(true);
                              }}
                            >
                              View Remarks History
                            </DropdownMenuItem>
                          )}
                          
                          {isApproved && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDownloadReport(event)}
                                className="text-primary font-medium"
                              >
                                <Download className="h-4 w-4 mr-2" /> Download Report
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Coordinator Dashboard</h2>
        <Button onClick={() => setSelectedEvent({ mode: 'create' })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="pending">
            <TabsList className="mb-4 bg-muted p-1 rounded-lg">
              <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm">
                <ShieldCheck className="w-4 h-4 mr-2 hidden sm:inline" />
                Pending ({pendingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="returned" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm">
                <AlertCircle className="w-4 h-4 mr-2 hidden sm:inline" />
                Returned ({returnedEvents.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm">
                <List className="w-4 h-4 mr-2 hidden sm:inline" />
                Approved ({approvedEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="h-[500px]">
              {renderEventTable(pendingEvents, "Awaiting Approval")}
            </TabsContent>
            
            <TabsContent value="returned" className="h-[500px]">
              {renderEventTable(returnedEvents, "Returned or Rejected")}
            </TabsContent>
            
            <TabsContent value="approved" className="h-[500px]">
              {renderEventTable(approvedEvents, "Approved Events")}
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