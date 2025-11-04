import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Calendar, User, Bus, Eye, CheckCircle, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface Complaint {
  id: number;
  complaint_id: string;
  institute_name: string;
  complainant_name: string;
  complainant_email: string | null;
  complainant_type: string;
  complainant_type_display: string;
  complaint_against: string;
  complaint_against_display: string;
  reason: string;
  status: string;
  status_display: string;
  priority: string;
  priority_display: string;
  driver_code: string | null;
  bus_number: string | null;
  bus_short_name: string | null;
  date_time: string;
  resolved_at: string | null;
  resolution_notes: string | null;
}

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    let filtered = complaints;

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.complaint_id.toLowerCase().includes(search.toLowerCase()) ||
          c.complainant_name.toLowerCase().includes(search.toLowerCase()) ||
          c.reason.toLowerCase().includes(search.toLowerCase()) ||
          (c.bus_short_name && c.bus_short_name.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter((c) => c.priority === priorityFilter);
    }

    setFilteredComplaints(filtered);
  }, [search, statusFilter, priorityFilter, complaints]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/institutes/complaints/');
      console.log('Complaints API Response:', response.data);
      
      // Handle different response structures
      let complaintsData = [];
      if (response.data.data) {
        complaintsData = response.data.data;
      } else if (response.data.results) {
        complaintsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        complaintsData = response.data;
      }
      
      setComplaints(complaintsData);
      setFilteredComplaints(complaintsData);
    } catch (error: any) {
      console.error('Failed to fetch complaints:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch complaints',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setViewDialogOpen(true);
  };

  const handleOpenStatusDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusDialogOpen(true);
  };

  const handleOpenResolveDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResolutionNotes('');
    setResolveDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;

    try {
      setSaving(true);
      await api.post(`/institutes/complaints/${selectedComplaint.id}/update_status/`, {
        status: newStatus
      });
      
      toast({
        title: 'Success',
        description: 'Complaint status updated successfully!',
      });
      
      setStatusDialogOpen(false);
      fetchComplaints(); // Refresh list
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResolveComplaint = async () => {
    if (!selectedComplaint) return;

    try {
      setSaving(true);
      await api.post(`/institutes/complaints/${selectedComplaint.id}/resolve/`, {
        resolution_notes: resolutionNotes
      });
      
      toast({
        title: 'Success',
        description: 'Complaint resolved successfully!',
      });
      
      setResolveDialogOpen(false);
      fetchComplaints(); // Refresh list
    } catch (error: any) {
      console.error('Failed to resolve complaint:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to resolve complaint',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'default';
      case 'RESOLVED':
        return 'default';
      case 'CLOSED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
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
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <h1 className="text-3xl font-bold">Complaints</h1>
          <p className="text-muted-foreground">Track and resolve complaints</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold">{complaints.length}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder="Search by ID, complainant, reason, or bus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="md:w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priority</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredComplaints.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No complaints found</p>
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'No complaints have been submitted yet'}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">ID</TableHead>
                <TableHead className="w-[180px]">Complainant</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[150px]">Bus</TableHead>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead className="text-right w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-mono text-sm">
                    {complaint.complaint_id}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm">{complaint.complainant_name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground pl-5">
                        {complaint.complainant_type_display}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="text-xs text-muted-foreground mb-1">
                        Against: <span className="font-medium">{complaint.complaint_against_display}</span>
                      </div>
                      <p className="text-sm line-clamp-2">{complaint.reason}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {complaint.bus_short_name ? (
                      <div className="flex items-center gap-2">
                        <Bus className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">{complaint.bus_short_name}</div>
                          <div className="text-xs text-muted-foreground">{complaint.bus_number}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(complaint.priority)}>
                      {complaint.priority_display}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(complaint.status)}>
                      {complaint.status_display}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{formatDate(complaint.date_time)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewComplaint(complaint)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenStatusDialog(complaint)}
                          >
                            Status
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenResolveDialog(complaint)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* View Complaint Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              {selectedComplaint?.complaint_id}
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedComplaint.status)}>
                      {selectedComplaint.status_display}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(selectedComplaint.priority)}>
                      {selectedComplaint.priority_display}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Complainant</Label>
                <p className="mt-1 text-sm">{selectedComplaint.complainant_name}</p>
                <p className="text-xs text-muted-foreground">{selectedComplaint.complainant_type_display}</p>
                {selectedComplaint.complainant_email && (
                  <p className="text-xs text-muted-foreground">{selectedComplaint.complainant_email}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Complaint Against</Label>
                <p className="mt-1 text-sm">{selectedComplaint.complaint_against_display}</p>
              </div>

              {selectedComplaint.bus_short_name && (
                <div>
                  <Label className="text-sm font-medium">Bus</Label>
                  <p className="mt-1 text-sm">
                    {selectedComplaint.bus_short_name} ({selectedComplaint.bus_number})
                  </p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Reason</Label>
                <p className="mt-1 text-sm">{selectedComplaint.reason}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Date Submitted</Label>
                <p className="mt-1 text-sm">{formatDate(selectedComplaint.date_time)}</p>
              </div>

              {selectedComplaint.resolved_at && (
                <div>
                  <Label className="text-sm font-medium">Resolved At</Label>
                  <p className="mt-1 text-sm">{formatDate(selectedComplaint.resolved_at)}</p>
                </div>
              )}

              {selectedComplaint.resolution_notes && (
                <div>
                  <Label className="text-sm font-medium">Resolution Notes</Label>
                  <p className="mt-1 text-sm">{selectedComplaint.resolution_notes}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Institute</Label>
                <p className="mt-1 text-sm">{selectedComplaint.institute_name}</p>
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

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
            <DialogDescription>
              Change the status of complaint {selectedComplaint?.complaint_id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setStatusDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Complaint Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Complaint</DialogTitle>
            <DialogDescription>
              Mark complaint {selectedComplaint?.complaint_id} as resolved
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resolution_notes">Resolution Notes (Optional)</Label>
              <Textarea
                id="resolution_notes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how the complaint was resolved..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setResolveDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResolveComplaint}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? 'Resolving...' : 'Mark as Resolved'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Complaints;