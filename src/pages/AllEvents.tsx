import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import EventCalendar from '@/components/EventCalendar';
import { List, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import EventActionDialog from '@/components/EventActionDialog';
import EventDialog from '@/components/EventDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const statusColors: { [key: string]: string } = {
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

const ALL_STATUSES = [
  'pending_hod', 'returned_to_coordinator', 'pending_dean', 'returned_to_hod', 
  'pending_principal', 'returned_to_dean', 'approved', 'rejected', 'cancelled'
];

const AllEvents = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'list';
  const [events, setEvents] = useState<any[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  const isApprover = useMemo(() => {
    if (!profile) return false;
    return ['hod', 'dean', 'principal'].includes(profile.role);
  }, [profile]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.events.list();
      const mappedData = data.map(event => ({
        ...event,
        coordinator: event.profiles || event.submitted_by,
        profiles: event.profiles || event.submitted_by,
      }));
      setEvents(mappedData);
      setApprovedEvents(mappedData.filter(e => e.status === 'approved'));
    } catch (error: any) {
      toast.error('Failed to fetch events.');
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesTitle = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCode = event.unique_code?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && (matchesTitle || matchesCode);
    });
  }, [events, statusFilter, searchTerm]);

  const handleActionSuccess = () => {
    fetchEvents();
    setSelectedEvent(null);
  };

  const handleViewDetails = (event: any) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const isReviewable = (event: any) => {
    if (!profile) return false;
    const role = profile.role;
    const status = event.status;
    
    if (role === 'hod' && (status === 'pending_hod' || status === 'returned_to_hod' || status === 'resubmitted')) return true;
    if (role === 'dean' && (status === 'pending_dean' || status === 'returned_to_dean')) return true;
    if (role === 'principal' && status === 'pending_principal') return true;
    
    return false;
  };

  return (
    <div className="space-y-8 max-w-full overflow-hidden animate-in fade-in duration-700">
      <div>
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Events Overview</h2>
        <p className="text-slate-500 font-medium mt-1">Browse and search all institution events.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl w-full sm:w-auto h-auto grid grid-cols-2 sm:flex mb-8">
          <TabsTrigger 
            value="list" 
            className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold transition-all"
          >
            <List className="w-4 h-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger 
            value="calendar" 
            className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm font-bold transition-all"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Approved Calendar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="animate-in fade-in slide-in-from-left-4 duration-500">
          <Card className="bg-white/70 backdrop-blur-sm border-primary/10 shadow-lg overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b pb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <CardTitle className="text-xl font-bold text-slate-800">All Viewable Events</CardTitle>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative group/search">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-primary transition-colors" />
                    <Input
                      placeholder="Search by title or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 max-w-sm rounded-xl border-slate-200 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px] rounded-xl border-slate-200">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl">
                      <SelectItem value="all" className="font-bold">All Statuses</SelectItem>
                      {ALL_STATUSES.map(status => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status.replace(/_/g, ' ').replace('dean', 'Dean IR')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="py-4 font-bold text-slate-600 pl-8">Event</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Code</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Date</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Venue</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600 text-center">Status</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Dept/Club/Society</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600 text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center text-muted-foreground animate-pulse">Loading events...</TableCell>
                    </TableRow>
                  ) : filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center text-muted-foreground bg-slate-50/30">
                         <div className="flex flex-col items-center gap-2 opacity-50">
                          <Search className="h-8 w-8" />
                          <p>No events match your criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow key={event.id} className="hover:bg-primary/5 transition-colors group/row">
                        <TableCell className="font-semibold text-slate-900 pl-8">{event.title}</TableCell>
                        <TableCell className="font-mono text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded inline-block mt-3">{event.unique_code || 'N/A'}</TableCell>
                        <TableCell className="text-slate-600 font-medium">{format(new Date(event.event_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-primary font-medium">{event.venues?.name || event.other_venue_details || 'N/A'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusColors[event.status])}>
                            {event.status.replace(/_/g, ' ').replace('dean', 'Dean IR')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help border-b border-dotted border-slate-300 text-slate-600 font-medium">
                                {event.department_club || 'N/A'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0 shadow-2xl p-3 rounded-lg">
                              <p className="font-bold flex items-center gap-2">
                                <Search className="w-3 h-3 text-primary-foreground" />
                                Submitted by: {event.coordinator?.first_name} {event.coordinator?.last_name}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          {isReviewable(event) ? (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="bg-primary hover:bg-primary/90 text-white shadow-indigo-200 shadow-md rounded-lg font-bold px-4"
                              onClick={() => setSelectedEvent(event)}
                            >
                              Review
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-lg font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-all px-4"
                              onClick={() => handleViewDetails(event)}
                            >
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar">
          {loading ? (
            <div className="text-center p-8">Loading calendar...</div>
          ) : (
            <EventCalendar events={approvedEvents} />
          )}
        </TabsContent>
      </Tabs>
      
      {selectedEvent && isApprover && !isViewDialogOpen && (
        <EventActionDialog
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onActionSuccess={handleActionSuccess}
          role={profile!.role as 'hod' | 'dean' | 'principal'}
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

export default AllEvents;
