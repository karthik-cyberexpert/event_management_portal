import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Users, 
  MapPin, 
  ClipboardList, 
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Building,
  List
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusConfig: { [key: string]: { icon: React.ElementType; color: string; label: string } } = {
  approved: { icon: CheckCircle, color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Approved" },
  pending_hod: { icon: Clock, color: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending HOD" },
  pending_dean: { icon: Clock, color: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending Dean" },
  pending_principal: { icon: Clock, color: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending Principal" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-700 border-red-200", label: "Rejected" },
  cancelled: { icon: XCircle, color: "bg-slate-100 text-slate-700 border-slate-200", label: "Cancelled" },
  returned_to_hod: { icon: AlertCircle, color: "bg-rose-100 text-rose-700 border-rose-200", label: "Returned to HOD" },
  returned_to_dean: { icon: AlertCircle, color: "bg-rose-100 text-rose-700 border-rose-200", label: "Returned to Dean" },
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalVenues: 0,
    pendingApprovals: 0,
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [events, profiles, venues] = await Promise.all([
          api.events.list(),
          api.users.list(),
          api.venues.list()
        ]);

        const pendingEvents = events.filter((e: any) => 
          ['pending_hod', 'pending_dean', 'pending_principal', 'returned_to_hod', 'returned_to_dean'].includes(e.status)
        );

        setStats({
          totalEvents: events.length,
          totalUsers: profiles.length,
          totalVenues: venues.length,
          pendingApprovals: pendingEvents.length,
        });

        // Get 4 most recent events
        const sortedEvents = events
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4);
        
        setRecentEvents(sortedEvents);
      } catch (error: any) {
        console.error('Dashboard fetch error:', error);
        toast.error('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { title: "Total Events", value: stats.totalEvents, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Total Venues", value: stats.totalVenues, icon: Building, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Pending Approvals", value: stats.pendingApprovals, icon: ClipboardList, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-8 max-w-full overflow-hidden animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">A high-level overview of the Event Management System.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="rounded-2xl border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-1/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="rounded-2xl border-none shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className={`h-1 w-full ${stat.bg.replace('bg-', 'bg-')}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900 mt-2">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Recent Events and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Recent Events */}
        <Card className="bg-white/70 backdrop-blur-sm border-primary/10 shadow-lg rounded-2xl overflow-hidden group">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b pb-6">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              Recently Created Events
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">The four most recently created events in the system.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-32 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.length > 0 ? recentEvents.map((event) => {
                  const config = statusConfig[event.status] || { icon: AlertCircle, color: "bg-slate-100 text-slate-700 border-slate-200", label: event.status.replace(/_/g, ' ') };
                  const StatusIcon = config.icon;
                  return (
                    <div key={event.id} className="group/item flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-white hover:ring-1 hover:ring-primary/20 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm group-hover/item:rotate-3 transition-transform">
                          <Building className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover/item:text-primary transition-colors">{event.title}</h3>
                          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Created: {format(new Date(event.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${config.color} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {config.label}
                      </Badge>
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-16 opacity-30">
                    <XCircle className="h-12 w-12 mb-2" />
                    <p className="text-sm font-bold uppercase tracking-widest">No recent events found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
