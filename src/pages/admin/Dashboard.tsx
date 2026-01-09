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

const statusConfig: { [key: string]: { icon: React.ElementType; color: string; label: string } } = {
  approved: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Approved" },
  pending_hod: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending HOD" },
  pending_dean: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending Dean" },
  pending_principal: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending Principal" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Rejected" },
  cancelled: { icon: XCircle, color: "bg-gray-100 text-gray-800", label: "Cancelled" },
  returned_to_hod: { icon: AlertCircle, color: "bg-orange-100 text-orange-800", label: "Returned to HOD" },
  returned_to_dean: { icon: AlertCircle, color: "bg-orange-100 text-orange-800", label: "Returned to Dean" },
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
    { title: "Total Events", value: stats.totalEvents, icon: Calendar },
    { title: "Total Users", value: stats.totalUsers, icon: Users },
    { title: "Total Venues", value: stats.totalVenues, icon: Building },
    { title: "Pending Approvals", value: stats.pendingApprovals, icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">A high-level overview of the Event Management System.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
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
              <Card key={index} className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Recent Events and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Recently Created Events
            </CardTitle>
            <CardDescription>The four most recently created events.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-28" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.length > 0 ? recentEvents.map((event) => {
                  const config = statusConfig[event.status] || { icon: AlertCircle, color: "bg-gray-100 text-gray-800", label: event.status.replace(/_/g, ' ') };
                  const StatusIcon = config.icon;
                  return (
                    <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-accent transition-colors">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created: {format(new Date(event.created_at), 'PPP')}
                        </p>
                      </div>
                      <Badge className={`${config.color} flex items-center capitalize`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No recent events found.</p>
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
