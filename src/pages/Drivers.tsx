import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, UserCog, Bus, Edit, Trash2, AlertCircle } from 'lucide-react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Driver {
  id: number;
  driver_code: string;
  driver_name: string;
  username: string;
  institute: number;
  institute_name: string;
  bus: number | null;
  bus_number: string | null;
  bus_short_name: string | null;
  is_active: boolean;
}

interface Institute {
  id: number;
  institute_name: string;
  institute_code: string;
}

interface DriverFormData {
  driver_code: string;
  driver_name: string;
  username: string;
  password: string;
  confirm_password: string;
  institute: number | null;
  is_active: boolean;
}

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    driver_code: '',
    driver_name: '',
    username: '',
    password: '',
    confirm_password: '',
    institute: null,
    is_active: true,
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
    fetchInstitutes();
  }, []);

  useEffect(() => {
    const filtered = drivers.filter(
      (driver) =>
        driver.driver_code.toLowerCase().includes(search.toLowerCase()) ||
        driver.driver_name.toLowerCase().includes(search.toLowerCase()) ||
        driver.username.toLowerCase().includes(search.toLowerCase()) ||
        driver.institute_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDrivers(filtered);
  }, [search, drivers]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/institutes/drivers/');
      console.log('Drivers API Response:', response.data);
      
      const driversData = response.data.data || response.data.results || [];
      
      console.log('Driver names received:', driversData.map((d: Driver) => ({
        code: d.driver_code,
        name: d.driver_name
      })));
      
      setDrivers(driversData);
      setFilteredDrivers(driversData);
    } catch (error: any) {
      console.error('Failed to fetch drivers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch drivers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutes = async () => {
    try {
      const response = await api.get('/institutes/public/institutes/');
      console.log('Institutes API Response:', response.data);
      
      const institutesData = response.data.institutes || response.data.results || [];
      
      console.log('Parsed Institutes:', institutesData);
      setInstitutes(institutesData);
    } catch (error) {
      console.error('Failed to fetch institutes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch institutes',
        variant: 'destructive',
      });
    }
  };

  const handleAddDriver = () => {
    setFormData({
      driver_code: '',
      driver_name: '',
      username: '',
      password: '',
      confirm_password: '',
      institute: null,
      is_active: true,
    });
    setIsAddDialogOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      driver_code: driver.driver_code,
      driver_name: driver.driver_name,
      username: driver.username,
      password: '',
      confirm_password: '',
      institute: driver.institute,
      is_active: driver.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation
    if (!formData.driver_code.trim()) {
      toast({
        title: 'Error',
        description: 'Driver code is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.driver_name.trim()) {
      toast({
        title: 'Error',
        description: 'Driver name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.username.trim()) {
      toast({
        title: 'Error',
        description: 'Username is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.password) {
      toast({
        title: 'Error',
        description: 'Password is required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.institute) {
      toast({
        title: 'Error',
        description: 'Please select an institute',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = {
        driver_code: formData.driver_code.trim(),
        driver_name: formData.driver_name.trim(),
        username: formData.username.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        institute: formData.institute,
        bus: null, // NO BUS ASSIGNMENT - Driver will select in mobile app
        is_active: formData.is_active,
      };
      
      console.log('Submitting driver data:', JSON.stringify(submitData, null, 2));
      
      const response = await api.post('/institutes/drivers/', submitData);
      console.log('Add Driver Response:', response.data);
      
      toast({
        title: 'Success',
        description: 'Driver added successfully! They can now select their bus in the mobile app.',
      });
      
      setIsAddDialogOpen(false);
      setFormData({
        driver_code: '',
        driver_name: '',
        username: '',
        password: '',
        confirm_password: '',
        institute: null,
        is_active: true,
      });
      
      await fetchDrivers();
      
    } catch (error: any) {
      console.error('Add Driver Error:', error);
      console.error('Error Response:', error.response?.data);
      
      const errorData = error.response?.data;
      let errorMessage = 'Failed to add driver';
      
      if (errorData?.error) {
        const errorStr = errorData.error;
        if (typeof errorStr === 'string' && errorStr.includes('{')) {
          try {
            const match = errorStr.match(/'([^']+)':\s*ErrorDetail\(string='([^']+)'/);
            if (match) {
              errorMessage = `${match[1]}: ${match[2]}`;
            } else {
              errorMessage = errorStr.substring(0, 200);
            }
          } catch (e) {
            errorMessage = errorStr.substring(0, 200);
          }
        } else {
          errorMessage = errorStr;
        }
      } else if (errorData?.errors) {
        const errors = errorData.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirm_password) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const updateData: any = {
        driver_code: formData.driver_code.trim(),
        driver_name: formData.driver_name.trim(),
        username: formData.username.trim(),
        institute: formData.institute,
        is_active: formData.is_active,
      };
      
      if (formData.password) {
        updateData.password = formData.password;
        updateData.confirm_password = formData.confirm_password;
      }

      console.log('Updating driver data:', updateData);

      const response = await api.put(`/institutes/drivers/${selectedDriver?.id}/`, updateData);
      console.log('Update Driver Response:', response.data);
      
      toast({
        title: 'Success',
        description: response.data.message || 'Driver updated successfully',
      });
      
      setIsEditDialogOpen(false);
      await fetchDrivers();
      
    } catch (error: any) {
      console.error('Update Driver Error:', error);
      
      const errorData = error.response?.data;
      let errorMessage = 'Failed to update driver';
      
      if (errorData?.errors) {
        const errors = errorData.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDriver = async (driver: Driver) => {
    if (!confirm(`Are you sure you want to delete driver ${driver.driver_code}?`)) {
      return;
    }

    try {
      const response = await api.delete(`/institutes/drivers/${driver.id}/`);
      console.log('Delete Driver Response:', response.data);
      
      toast({
        title: 'Success',
        description: response.data.message || 'Driver deleted successfully',
      });
      
      await fetchDrivers();
    } catch (error: any) {
      console.error('Delete Driver Error:', error);
      
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete driver',
        variant: 'destructive',
      });
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadFile) {
      toast({
        title: 'Error',
        description: 'Please select a file',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', uploadFile);

      const response = await api.post('/institutes/drivers/bulk_upload/', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Bulk Upload Response:', response.data);
      
      toast({
        title: 'Success',
        description: `${response.data.imported || 0} drivers uploaded successfully. They can now select their bus in the mobile app.`,
      });
      
      setIsBulkUploadOpen(false);
      setUploadFile(null);
      await fetchDrivers();
      
    } catch (error: any) {
      console.error('Bulk Upload Error:', error);
      
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to upload drivers',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drivers</h1>
          <p className="text-muted-foreground">Manage driver accounts and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={handleAddDriver}>
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search drivers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Institute</TableHead>
              <TableHead>Assigned Bus</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {search ? 'No drivers found matching your search' : 'No drivers found'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{driver.driver_code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{driver.driver_name || 'N/A'}</span>
                  </TableCell>
                  <TableCell>{driver.username}</TableCell>
                  <TableCell className="text-sm">{driver.institute_name}</TableCell>
                  <TableCell>
                    {driver.bus_short_name ? (
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium text-sm text-green-700">
                            {driver.bus_short_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{driver.bus_number}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm flex items-center gap-1">
                        <span className="text-blue-600"></span> Will select in app
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={driver.is_active ? 'default' : 'secondary'}>
                      {driver.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => handleEditDriver(driver)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDriver(driver)}
                        className="text-destructive hover:text-destructive"
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

      {/* Add Driver Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>
              Create a new driver account with login credentials
            </DialogDescription>
          </DialogHeader>
          
          {/* INFO BANNER */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>No Bus Assignment Needed!</strong>
              <br />
              <span className="text-sm">Driver will select their bus when they login to the mobile app.</span>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmitAdd}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="driver_code">Driver Code *</Label>
                <Input
                  id="driver_code"
                  placeholder="DRV001"
                  value={formData.driver_code}
                  onChange={(e) => setFormData({ ...formData, driver_code: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver_name">Driver Name *</Label>
                <Input
                  id="driver_name"
                  placeholder="John Doe"
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="driver1"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={submitting}
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password *</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institute">Institute *</Label>
                <Select
                  value={formData.institute?.toString() || 'none'}
                  onValueChange={(value) => {
                    if (value === 'none') {
                      setFormData({ ...formData, institute: null });
                    } else {
                      setFormData({ ...formData, institute: parseInt(value) });
                    }
                  }}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select institute" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutes.length === 0 ? (
                      <SelectItem value="loading" disabled>
                        No institutes available
                      </SelectItem>
                    ) : (
                      institutes.map((institute) => (
                        <SelectItem key={institute.id} value={institute.id.toString()}>
                          {institute.institute_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* NO BUS FIELD - REMOVED */}
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                  disabled={submitting}
                />
                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Driver'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>
              Update driver information and credentials
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Bus assignment is managed by the driver in their mobile app.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmitEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_driver_code">Driver Code</Label>
                <Input
                  id="edit_driver_code"
                  value={formData.driver_code}
                  onChange={(e) => setFormData({ ...formData, driver_code: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_driver_name">Driver Name</Label>
                <Input
                  id="edit_driver_name"
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_username">Username</Label>
                <Input
                  id="edit_username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Leave password fields blank to keep the current password
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="edit_password">New Password (optional)</Label>
                <Input
                  id="edit_password"
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={submitting}
                  minLength={6}
                />
              </div>
              {formData.password && (
                <div className="space-y-2">
                  <Label htmlFor="edit_confirm_password">Confirm New Password</Label>
                  <Input
                    id="edit_confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit_institute">Institute</Label>
                <Select
                  value={formData.institute?.toString() || 'none'}
                  onValueChange={(value) => {
                    if (value === 'none') {
                      setFormData({ ...formData, institute: null });
                    } else {
                      setFormData({ ...formData, institute: parseInt(value) });
                    }
                  }}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {institutes.map((institute) => (
                      <SelectItem key={institute.id} value={institute.id.toString()}>
                        {institute.institute_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* NO BUS FIELD IN EDIT - REMOVED */}
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                  disabled={submitting}
                />
                <Label htmlFor="edit_is_active" className="cursor-pointer">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Driver'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Upload Drivers</DialogTitle>
            <DialogDescription>
              Upload an Excel file to add multiple drivers at once
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBulkUpload}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Excel File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                  disabled={submitting}
                />
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <p className="font-medium">Expected columns:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>driver_code</li>
                      <li>driver_name</li>
                    </ul>
                    <p className="mt-2 text-xs">Note: No bus column needed. Drivers will select their bus in the mobile app.</p>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsBulkUploadOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Drivers;