import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Mail, Phone, Building2, AlertCircle, Edit, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Coordinator {
  id: number;
  coordinator_code: string;
  full_name: string;
  mobile_number: string;
  email: string;
  username: string;
  institute: number;
  institute_name: string;
  active_complaints_count: number;
  is_active: boolean;
}

interface Institute {
  id: number;
  institute_code: string;
  institute_name: string;
  place: string;
}

const Coordinators = () => {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [filteredCoordinators, setFilteredCoordinators] = useState<Coordinator[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState<Coordinator | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    is_active: true
  });
  const [addForm, setAddForm] = useState({
    coordinator_code: '',
    full_name: '',
    mobile_number: '',
    email: '',
    username: '',
    password: '',
    confirm_password: '',
    institute: '',
    is_active: true
  });
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCoordinators();
    fetchInstitutes();
  }, []);

  useEffect(() => {
    const filtered = coordinators.filter(
      (coord) =>
        coord.full_name.toLowerCase().includes(search.toLowerCase()) ||
        coord.coordinator_code.toLowerCase().includes(search.toLowerCase()) ||
        coord.email.toLowerCase().includes(search.toLowerCase()) ||
        coord.mobile_number.toLowerCase().includes(search.toLowerCase()) ||
        coord.institute_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCoordinators(filtered);
  }, [search, coordinators]);

  const fetchCoordinators = async () => {
    try {
      setLoading(true);
      const response = await api.get('/institutes/coordinators/');
      
      let coordinatorsData = [];
      if (response.data.data) {
        coordinatorsData = response.data.data;
      } else if (response.data.results) {
        coordinatorsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        coordinatorsData = response.data;
      }
      
      setCoordinators(coordinatorsData);
      setFilteredCoordinators(coordinatorsData);
    } catch (error: any) {
      console.error('Failed to fetch coordinators:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch coordinators',
        variant: 'destructive',
      });
      setCoordinators([]);
      setFilteredCoordinators([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutes = async () => {
    try {
      const response = await api.get('/institutes/public/institutes/');
      if (response.data.institutes) {
        setInstitutes(response.data.institutes);
      } else if (response.data.data) {
        setInstitutes(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch institutes:', error);
    }
  };

  const handleOpenAddDialog = () => {
    setAddForm({
      coordinator_code: '',
      full_name: '',
      mobile_number: '',
      email: '',
      username: '',
      password: '',
      confirm_password: '',
      institute: '',
      is_active: true
    });
    setAddDialogOpen(true);
  };

  const handleAddCoordinator = async () => {
    try {
      setSaving(true);
      const response = await api.post('/institutes/coordinators/', addForm);
      
      toast({
        title: 'Success',
        description: 'Coordinator created successfully!',
      });
      
      setAddDialogOpen(false);
      fetchCoordinators(); // Refresh list
    } catch (error: any) {
      console.error('Failed to create coordinator:', error);
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.error || 'Failed to create coordinator';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coordinator: Coordinator) => {
    setSelectedCoordinator(coordinator);
    setEditForm({
      full_name: coordinator.full_name,
      mobile_number: coordinator.mobile_number,
      email: coordinator.email,
      is_active: coordinator.is_active
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (coordinator: Coordinator) => {
    setSelectedCoordinator(coordinator);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedCoordinator) return;

    try {
      setSaving(true);
      const response = await api.put(
        `/institutes/coordinators/${selectedCoordinator.id}/`, 
        editForm
      );
      
      // Update local state with new data
      const updatedCoordinator = {
        ...selectedCoordinator,
        ...editForm
      };
      
      const updated = coordinators.map(c => 
        c.id === selectedCoordinator.id ? updatedCoordinator : c
      );
      
      setCoordinators(updated);
      setFilteredCoordinators(updated);
      
      toast({
        title: 'Success',
        description: 'Coordinator updated successfully!',
      });
      
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to update coordinator:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update coordinator',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCoordinator) return;

    try {
      setSaving(true);
      await api.delete(`/institutes/coordinators/${selectedCoordinator.id}/`);
      
      // Remove from local state
      const updated = coordinators.filter(c => c.id !== selectedCoordinator.id);
      setCoordinators(updated);
      setFilteredCoordinators(updated);
      
      toast({
        title: 'Success',
        description: 'Coordinator deleted successfully!',
      });
      
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to delete coordinator:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete coordinator',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-3xl font-bold">Coordinators</h1>
          <p className="text-muted-foreground">Manage institute coordinators</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Coordinator
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search coordinators by name, code, email, phone, or institute..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {coordinators.length === 0 && !loading ? (
        <Card className="p-12">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No coordinators found</p>
            <p className="text-sm text-muted-foreground">
              {search ? 'Try adjusting your search' : 'Get started by adding a coordinator'}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Coordinator</TableHead>
                <TableHead className="w-[250px]">Contact</TableHead>
                <TableHead className="w-[200px]">Institute</TableHead>
                <TableHead className="w-[140px]">Active Complaints</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoordinators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {search ? 'No coordinators found matching your search' : 'No coordinators available'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoordinators.map((coordinator) => (
                  <TableRow key={coordinator.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium">{coordinator.full_name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground pl-6">
                          {coordinator.coordinator_code} • {coordinator.username}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate max-w-[200px]" title={coordinator.email}>
                            {coordinator.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span>{coordinator.mobile_number}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm truncate max-w-[180px]" title={coordinator.institute_name}>
                          {coordinator.institute_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {coordinator.active_complaints_count > 0 ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-orange-500">
                              {coordinator.active_complaints_count}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-green-500">0</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={coordinator.is_active ? 'default' : 'secondary'}>
                        {coordinator.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(coordinator)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(coordinator)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Coordinator Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Coordinator</DialogTitle>
            <DialogDescription>
              Create a new coordinator account with login credentials
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="coordinator_code">Coordinator Code *</Label>
                <Input
                  id="coordinator_code"
                  value={addForm.coordinator_code}
                  onChange={(e) => setAddForm({ ...addForm, coordinator_code: e.target.value })}
                  placeholder="COORD001"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={addForm.full_name}
                  onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mobile_number">Mobile Number *</Label>
                <Input
                  id="mobile_number"
                  value={addForm.mobile_number}
                  onChange={(e) => setAddForm({ ...addForm, mobile_number: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="institute">Institute *</Label>
              <Select
                value={addForm.institute}
                onValueChange={(value) => setAddForm({ ...addForm, institute: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institute" />
                </SelectTrigger>
                <SelectContent>
                  {institutes.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id.toString()}>
                      {inst.institute_name} ({inst.place})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Login Credentials</h4>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    placeholder="john_coord"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm_password">Confirm Password *</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={addForm.confirm_password}
                      onChange={(e) => setAddForm({ ...addForm, confirm_password: e.target.value })}
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active_add"
                checked={addForm.is_active}
                onChange={(e) => setAddForm({ ...addForm, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active_add" className="cursor-pointer">
                Active Status
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAddDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCoordinator}
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Coordinator'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Coordinator</DialogTitle>
            <DialogDescription>
              Update coordinator information for {selectedCoordinator?.coordinator_code}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="coordinator@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                value={editForm.mobile_number}
                onChange={(e) => setEditForm({ ...editForm, mobile_number: e.target.value })}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active Status
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coordinator</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedCoordinator?.full_name}</strong>? 
              This action cannot be undone.
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
              onClick={handleConfirmDelete}
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

export default Coordinators;