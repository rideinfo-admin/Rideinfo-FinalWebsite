import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bus, Users, AlertCircle, BellRing, TrendingUp, MapPin, 
  Activity, UserCheck, RefreshCw, Building2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  total_institutes?: number;
  total_buses: number;
  total_drivers: number;
  active_drivers: number;
  moving_buses: number;
  stopped_buses: number;
  total_complaints: number;
  pending_complaints: number;
  total_notifications_sent: number;
  institute_name: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      // Check if user is coordinator or admin
      if (user?.user_type === 'COORDINATOR' || user?.user_type === 'ADMIN') {
        const response = await api.get('/institutes/coordinators/dashboard_stats/');
        console.log('Dashboard Stats:', response.data);
        
        if (response.data.statistics) {
          setStats(response.data.statistics);
        } else {
          console.error('Unexpected response structure:', response.data);
        }
      } else {
        // Fallback for other user types
        const [buses, drivers, complaints, notifications] = await Promise.all([
          api.get('/institutes/buses/'),
          api.get('/institutes/drivers/'),
          api.get('/institutes/complaints/'),
          api.get('/institutes/notifications/')
        ]);

        const busesData = buses.data.data || buses.data.results || [];
        const driversData = drivers.data.data || drivers.data.results || [];
        const complaintsData = complaints.data.data || complaints.data.results || [];
        const notificationsData = notifications.data.data || notifications.data.results || [];

        setStats({
          total_buses: busesData.length,
          total_drivers: driversData.length,
          active_drivers: driversData.filter((d: any) => d.is_active && d.bus).length,
          moving_buses: busesData.filter((b: any) => b.is_moving).length,
          stopped_buses: busesData.filter((b: any) => !b.is_moving).length,
          total_complaints: complaintsData.length,
          pending_complaints: complaintsData.filter((c: any) => 
            c.status === 'PENDING' || c.status === 'IN_PROGRESS'
          ).length,
          total_notifications_sent: notificationsData.length,
          institute_name: 'All Institutes'
        });
      }

      if (showToast) {
        toast({
          title: 'Success',
          description: 'Dashboard refreshed successfully',
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch dashboard stats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStats(true);
  };

  // Chart data
  const busStatusData = stats ? [
    { name: 'Moving', value: stats.moving_buses, color: '#10b981' },
    { name: 'Stopped', value: stats.stopped_buses, color: '#ef4444' }
  ] : [];

  const complaintStatusData = stats ? [
    { name: 'Pending', value: stats.pending_complaints, color: '#f59e0b' },
    { name: 'Resolved', value: stats.total_complaints - stats.pending_complaints, color: '#10b981' }
  ] : [];

  const driverStatusData = stats ? [
    { name: 'Active', value: stats.active_drivers, color: '#10b981' },
    { name: 'Inactive', value: stats.total_drivers - stats.active_drivers, color: '#6b7280' }
  ] : [];

  const activityData = stats ? [
    { name: 'Buses', value: stats.total_buses },
    { name: 'Drivers', value: stats.total_drivers },
    { name: 'Moving', value: stats.moving_buses },
    { name: 'Complaints', value: stats.pending_complaints },
  ] : [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name || user?.username}! 
            {stats?.institute_name && ` • ${stats.institute_name}`}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats?.total_institutes && (
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Institutes</CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_institutes}</div>
              <p className="text-xs text-muted-foreground mt-1">Active institutes</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
            <Bus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_buses || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-semibold">{stats?.moving_buses}</span> moving • {' '}
              <span className="text-red-600 font-semibold">{stats?.stopped_buses}</span> stopped
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drivers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_drivers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-semibold">{stats?.active_drivers}</span> active on duty
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_complaints || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {stats?.total_complaints || 0} total complaints
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
            <BellRing className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_notifications_sent || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total messages sent</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bus Activity</CardTitle>
            <Activity className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.moving_buses && stats?.total_buses 
                ? Math.round((stats.moving_buses / stats.total_buses) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Buses currently moving</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Utilization</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.active_drivers && stats?.total_drivers 
                ? Math.round((stats.active_drivers / stats.total_drivers) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Drivers actively driving</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_complaints && stats?.pending_complaints 
                ? Math.round(((stats.total_complaints - stats.pending_complaints) / stats.total_complaints) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Complaints resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bus Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={busStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {busStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaint Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={complaintStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {complaintStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Driver Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={driverStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {driverStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6">
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Bus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Bus Utilization</p>
                <p className="text-2xl font-bold">
                  {stats?.moving_buses && stats?.total_buses 
                    ? Math.round((stats.moving_buses / stats.total_buses) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Active Drivers</p>
                <p className="text-2xl font-bold">{stats?.active_drivers || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Pending Issues</p>
                <p className="text-2xl font-bold">{stats?.pending_complaints || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <BellRing className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-2xl font-bold">{stats?.total_notifications_sent || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;