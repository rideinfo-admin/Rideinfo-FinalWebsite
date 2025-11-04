import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Bell, Calendar, Users, TrendingUp, Eye, Trash2, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: number;
  notification_id: string;
  title: string;
  message: string;
  priority: string;
  priority_display: string;
  recipient_type: string;
  recipient_type_display: string;
  total_recipients: number;
  read_count: number;
  read_percentage: number;
  sent_at: string;
  expires_at: string | null;
  is_active: boolean;
  institute_name: string;
  sent_by_name: string;
}

interface Bus {
  id: number;
  bus_number: string;
  bus_short_name: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'MEDIUM',
    recipient_type: 'INSTITUTE_WIDE',
    target_buses: [] as number[],
    expires_at: '',
  });

  useEffect(() => {
    fetchNotifications();
    fetchBuses();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/institutes/notifications/');
      console.log('Notifications API Response:', response.data);
      
      let notificationsData = [];
      if (response.data.data) {
        notificationsData = response.data.data;
      } else if (response.data.results) {
        notificationsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        notificationsData = response.data;
      }
      
      setNotifications(notificationsData);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await api.get('/institutes/buses/');
      const busesData = response.data.data || response.data.results || [];
      setBuses(busesData);
    } catch (error) {
      console.error('Failed to fetch buses:', error);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Message is required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.recipient_type === 'BUS_SPECIFIC' && formData.target_buses.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one bus',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        recipient_type: formData.recipient_type,
        target_buses: formData.recipient_type === 'BUS_SPECIFIC' ? formData.target_buses : [],
        send_location_based: false,
        expires_at: formData.expires_at || null,
      };

      await api.post('/institutes/notifications/', payload);
      
      toast({
        title: 'Success',
        description: 'Notification sent successfully!',
      });
      
      setShowCreateDialog(false);
      resetForm();
      fetchNotifications();
    } catch (error: any) {
      console.error('Failed to create notification:', error);
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.error || 'Failed to send notification';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleViewNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setViewDialogOpen(true);
  };

  const handleDeleteNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedNotification) return;

    try {
      setSaving(true);
      await api.delete(`/institutes/notifications/${selectedNotification.id}/`);
      
      toast({
        title: 'Success',
        description: 'Notification deleted successfully!',
      });
      
      setDeleteDialogOpen(false);
      fetchNotifications();
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete notification',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      priority: 'MEDIUM',
      recipient_type: 'INSTITUTE_WIDE',
      target_buses: [],
      expires_at: '',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Send and manage system notifications</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Notification
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No notifications sent yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first notification to communicate with users
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[150px]">Recipients</TableHead>
                <TableHead className="w-[120px]">Read Rate</TableHead>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead className="w-[160px]">Sent At</TableHead>
                <TableHead className="text-right w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-medium text-sm">{notification.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2 max-w-md">{notification.message}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium text-sm">{notification.total_recipients}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {notification.recipient_type_display}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                        <span className="font-medium text-sm">{notification.read_count}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {notification.read_percentage.toFixed(1)}% read
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(notification.priority)}>
                      {notification.priority_display}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{formatDate(notification.sent_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewNotification(notification)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteNotification(notification)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Notification Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
            <DialogDescription>
              Send a notification to your selected recipients
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateNotification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Important Update"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter your notification message..."
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                    <SelectItem value="HIGH">🟠 High</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                    <SelectItem value="LOW">⚪ Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Type</Label>
                <Select 
                  value={formData.recipient_type} 
                  onValueChange={(value) => setFormData({ ...formData, recipient_type: value, target_buses: [] })}
                >
                  <SelectTrigger id="recipient">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSTITUTE_WIDE">🏫 All Institute Members</SelectItem>
                    <SelectItem value="ALL_STUDENTS">👨‍🎓 All Students</SelectItem>
                    <SelectItem value="ALL_DRIVERS">👨‍✈️ All Drivers</SelectItem>
                    <SelectItem value="BUS_SPECIFIC">🚌 Specific Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.recipient_type === 'BUS_SPECIFIC' && (
              <div className="space-y-2">
                <Label>Select Buses *</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                  {buses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No buses available</p>
                  ) : (
                    buses.map((bus) => (
                      <label key={bus.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.target_buses.includes(bus.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                target_buses: [...formData.target_buses, bus.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                target_buses: formData.target_buses.filter(id => id !== bus.id)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {bus.bus_short_name} ({bus.bus_number})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expires At (Optional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for notifications that don't expire
              </p>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Sending...' : 'Send Notification'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Notification Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>
              {selectedNotification?.notification_id}
            </DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="mt-1 text-sm">{selectedNotification.title}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Message</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{selectedNotification.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(selectedNotification.priority)}>
                      {selectedNotification.priority_display}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedNotification.is_active ? 'default' : 'secondary'}>
                      {selectedNotification.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Recipients</Label>
                <p className="mt-1 text-sm">{selectedNotification.recipient_type_display}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Total Recipients</Label>
                  <p className="mt-1 text-sm font-semibold">{selectedNotification.total_recipients}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Read Count</Label>
                  <p className="mt-1 text-sm font-semibold">
                    {selectedNotification.read_count} ({selectedNotification.read_percentage.toFixed(1)}%)
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Sent At</Label>
                <p className="mt-1 text-sm">{formatDate(selectedNotification.sent_at)}</p>
              </div>

              {selectedNotification.expires_at && (
                <div>
                  <Label className="text-sm font-medium">Expires At</Label>
                  <p className="mt-1 text-sm">{formatDate(selectedNotification.expires_at)}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Sent By</Label>
                <p className="mt-1 text-sm">{selectedNotification.sent_by_name}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Institute</Label>
                <p className="mt-1 text-sm">{selectedNotification.institute_name}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;