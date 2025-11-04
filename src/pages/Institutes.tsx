import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, MapPin, Phone, Mail, Bus, Users, AlertCircle, 
  Plus, Edit, Trash2, Eye, Search 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Institute {
  id: number;
  institute_code: string;
  institute_name: string;
  place: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  contact_number: string;
  email: string;
  driver_count: number;
  bus_count: number;
  complaint_count: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const Institutes = () => {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [filteredInstitutes, setFilteredInstitutes] = useState<Institute[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    institute_code: '',
    institute_name: '',
    place: '',
    address: '',
    latitude: '',
    longitude: '',
    contact_number: '',
    email: '',
    is_active: true,
  });

  useEffect(() => {
    fetchInstitutes();
  }, []);

  useEffect(() => {
    const filtered = institutes.filter(
      (inst) =>
        inst.institute_name.toLowerCase().includes(search.toLowerCase()) ||
        inst.place.toLowerCase().includes(search.toLowerCase()) ||
        inst.institute_code.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredInstitutes(filtered);
  }, [search, institutes]);

  const fetchInstitutes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/institutes/public/institutes/');
      console.log('Institutes API Response:', response.data);
      
      let institutesData = [];
      if (response.data.institutes) {
        institutesData = response.data.institutes;
      } else if (response.data.data) {
        institutesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        institutesData = response.data;
      }
      
      setInstitutes(institutesData);
      setFilteredInstitutes(institutesData);
    } catch (error: any) {
      console.error('Failed to fetch institutes:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch institutes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      institute_code: '',
      institute_name: '',
      place: '',
      address: '',
      latitude: '',
      longitude: '',
      contact_number: '',
      email: '',
      is_active: true,
    });
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = (institute: Institute) => {
    setSelectedInstitute(institute);
    setFormData({
      institute_code: institute.institute_code,
      institute_name: institute.institute_name,
      place: institute.place,
      address: institute.address || '',
      latitude: institute.latitude?.toString() || '',
      longitude: institute.longitude?.toString() || '',
      contact_number: institute.contact_number || '',
      email: institute.email || '',
      is_active: institute.is_active,
    });
    setEditDialogOpen(true);
  };

  const handleViewInstitute = (institute: Institute) => {
    setSelectedInstitute(institute);
    setViewDialogOpen(true);
  };

  const handleDeleteInstitute = (institute: Institute) => {
    setSelectedInstitute(institute);
    setDeleteDialogOpen(true);
  };

  const handleAddInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.institute_code.trim() || !formData.institute_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Institute code and name are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      await api.post('/institutes/institutes/', payload);
      
      toast({
        title: 'Success',
        description: 'Institute created successfully!',
      });
      
      setAddDialogOpen(false);
      resetForm();
      fetchInstitutes();
    } catch (error: any) {
      console.error('Failed to create institute:', error);
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.error || 'Failed to create institute';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitute) return;

    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      await api.put(`/institutes/institutes/${selectedInstitute.id}/`, payload);
      
      toast({
        title: 'Success',
        description: 'Institute updated successfully!',
      });
      
      setEditDialogOpen(false);
      fetchInstitutes();
    } catch (error: any) {
      console.error('Failed to update institute:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update institute',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedInstitute) return;

    try {
      setSaving(true);
      await api.delete(`/institutes/institutes/${selectedInstitute.id}/`);
      
      toast({
        title: 'Success',
        description: 'Institute deleted successfully!',
      });
      
      setDeleteDialogOpen(false);
      fetchInstitutes();
    } catch (error: any) {
      console.error('Failed to delete institute:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete institute',
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
          <h1 className="text-3xl font-bold">Institutes</h1>
          <p className="text-muted-foreground">Manage educational institutions</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Institute
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search institutes by name, place, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredInstitutes.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No institutes found</p>
            <p className="text-sm text-muted-foreground">
              {search ? 'Try adjusting your search' : 'Get started by adding an institute'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInstitutes.map((institute) => (
            <Card key={institute.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg line-clamp-1">{institute.institute_name}</CardTitle>
                  </div>
                  <Badge variant={institute.is_active ? 'default' : 'secondary'}>
                    {institute.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{institute.institute_code}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="line-clamp-1">{institute.place}</span>
                </div>
                {institute.contact_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{institute.contact_number}</span>
                  </div>
                )}
                {institute.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{institute.email}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <Bus className="h-4 w-4" />
                      <span className="font-bold">{institute.bus_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Buses</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <Users className="h-4 w-4" />
                      <span className="font-bold">{institute.driver_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Drivers</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-bold">{institute.complaint_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Issues</p>
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewInstitute(institute)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenEditDialog(institute)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteInstitute(institute)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Institute Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Institute</DialogTitle>
            <DialogDescription>
              Create a new educational institution
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddInstitute} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institute_code">Institute Code *</Label>
                <Input
                  id="institute_code"
                  value={formData.institute_code}
                  onChange={(e) => setFormData({ ...formData, institute_code: e.target.value })}
                  placeholder="INST001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active">Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institute_name">Institute Name *</Label>
              <Input
                id="institute_name"
                value={formData.institute_name}
                onChange={(e) => setFormData({ ...formData, institute_name: e.target.value })}
                placeholder="Government Engineering College"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="place">Place/City *</Label>
              <Input
                id="place"
                value={formData.place}
                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                placeholder="Chennai"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street, City, State"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="13.0827"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="80.2707"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@institute.edu"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setAddDialogOpen(false);
                  resetForm();
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create Institute'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Institute Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Institute</DialogTitle>
            <DialogDescription>
              Update institute information for {selectedInstitute?.institute_code}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateInstitute} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_institute_code">Institute Code *</Label>
                <Input
                  id="edit_institute_code"
                  value={formData.institute_code}
                  onChange={(e) => setFormData({ ...formData, institute_code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_is_active">Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <Label htmlFor="edit_is_active" className="cursor-pointer">Active</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_institute_name">Institute Name *</Label>
              <Input
                id="edit_institute_name"
                value={formData.institute_name}
                onChange={(e) => setFormData({ ...formData, institute_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_place">Place/City *</Label>
              <Input
                id="edit_place"
                value={formData.place}
                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_address">Address</Label>
              <Textarea
                id="edit_address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_latitude">Latitude</Label>
                <Input
                  id="edit_latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_longitude">Longitude</Label>
                <Input
                  id="edit_longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_contact_number">Contact Number</Label>
                <Input
                  id="edit_contact_number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update Institute'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Institute Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Institute Details</DialogTitle>
            <DialogDescription>
              {selectedInstitute?.institute_code}
            </DialogDescription>
          </DialogHeader>
          {selectedInstitute && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Institute Name</Label>
                <p className="mt-1 text-sm">{selectedInstitute.institute_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Code</Label>
                  <p className="mt-1 text-sm font-mono">{selectedInstitute.institute_code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedInstitute.is_active ? 'default' : 'secondary'}>
                      {selectedInstitute.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Place/City</Label>
                <p className="mt-1 text-sm">{selectedInstitute.place}</p>
              </div>

              {selectedInstitute.address && (
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="mt-1 text-sm">{selectedInstitute.address}</p>
                </div>
              )}

              {(selectedInstitute.latitude || selectedInstitute.longitude) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Latitude</Label>
                    <p className="mt-1 text-sm">{selectedInstitute.latitude}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Longitude</Label>
                    <p className="mt-1 text-sm">{selectedInstitute.longitude}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Contact Number</Label>
                  <p className="mt-1 text-sm">{selectedInstitute.contact_number || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="mt-1 text-sm">{selectedInstitute.email || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-3 block">Statistics</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-primary mb-1">
                      <Bus className="h-5 w-5" />
                      <span className="text-2xl font-bold">{selectedInstitute.bus_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Buses</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-primary mb-1">
                      <Users className="h-5 w-5" />
                      <span className="text-2xl font-bold">{selectedInstitute.driver_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Drivers</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-primary mb-1">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-2xl font-bold">{selectedInstitute.complaint_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Issues</p>
                  </div>
                </div>
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
            <DialogTitle>Delete Institute</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedInstitute?.institute_name}</strong>? 
              This action cannot be undone and will affect all related buses, drivers, and complaints.
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
              {saving ? 'Deleting...' : 'Delete Institute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Institutes;