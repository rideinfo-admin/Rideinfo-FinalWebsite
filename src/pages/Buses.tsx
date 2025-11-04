import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Gauge, Clock, Plus, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusType {
  id: number;
  bus_code: string;
  bus_number: string;
  bus_short_name: string;
  route: string;
  institute_name: string;
  current_latitude: string | null;
  current_longitude: string | null;
  current_speed: number;
  last_location_update: string | null;
  is_moving: boolean;
  is_active: boolean;
}

interface Institute {
  id: number;
  institute_name: string;
  institute_code?: string;
}

const Buses = () => {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<BusType[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    bus_code: '',
    bus_number: '',
    bus_short_name: '',
    route: '',
    institute: '',
    is_active: true,
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBuses();
    fetchInstitutes();
  }, []);

  useEffect(() => {
    const filtered = buses.filter(
      (bus) =>
        bus.bus_short_name.toLowerCase().includes(search.toLowerCase()) ||
        bus.bus_number.toLowerCase().includes(search.toLowerCase()) ||
        bus.institute_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredBuses(filtered);
  }, [search, buses]);

  const fetchBuses = async () => {
    try {
      const response = await api.get('/institutes/buses/');
      const busData = response.data.data || response.data.results || [];
      setBuses(busData);
      setFilteredBuses(busData);
    } catch (error) {
      console.error('Failed to fetch buses:', error);
      setMessage({ type: 'error', text: 'Failed to fetch buses' });
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutes = async () => {
    try {
      const response = await api.get('/institutes/coordinators/my_profile/');
      
      // Check if user is admin
      if (response.data.is_admin && response.data.institutes) {
        // Admin gets all institutes
        const instituteList = response.data.institutes.map((inst: any) => ({
          id: inst.id,
          institute_name: inst.institute_name,
          institute_code: inst.institute_code
        }));
        setInstitutes(instituteList);
        setIsAdmin(true);
        
        // Set first institute as default
        if (instituteList.length > 0) {
          setFormData(prev => ({ ...prev, institute: instituteList[0].id }));
        }
      } else if (response.data.profile && response.data.profile.institute) {
        // Coordinator gets their institute
        setInstitutes([{ 
          id: response.data.profile.institute, 
          institute_name: response.data.profile.institute_name 
        }]);
        setIsAdmin(false);
        setFormData(prev => ({ ...prev, institute: response.data.profile.institute }));
      }
    } catch (error: any) {
      console.error('Failed to fetch institutes:', error.response?.status, error.response?.data);
      setMessage({ type: 'error', text: 'Failed to fetch institute information' });
      
      // Try to get from query params as fallback
      const urlParams = new URLSearchParams(window.location.search);
      const instituteId = urlParams.get('institute_id');
      if (instituteId && institutes.length === 0) {
        setInstitutes([{ id: parseInt(instituteId), institute_name: 'Institute' }]);
        setFormData(prev => ({ ...prev, institute: parseInt(instituteId) }));
      }
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const handleCreateBus = async () => {
    if (!formData.bus_code || !formData.bus_number || !formData.bus_short_name || !formData.route) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (!formData.institute) {
      setMessage({ type: 'error', text: 'Institute is required. Please contact administrator.' });
      return;
    }

    try {
      const payload = {
        bus_code: formData.bus_code.trim(),
        bus_number: formData.bus_number.trim(),
        bus_short_name: formData.bus_short_name.trim(),
        route: formData.route.trim(),
        institute: formData.institute,
        is_active: formData.is_active,
      };

      console.log('Sending payload:', payload);

      const response = await api.post('/institutes/buses/', payload);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Bus created successfully!' });
        setTimeout(() => {
          setShowCreateModal(false);
          setFormData({
            bus_code: '',
            bus_number: '',
            bus_short_name: '',
            route: '',
            institute: institutes[0]?.id || '',
            is_active: true,
          });
          setMessage({ type: '', text: '' });
          fetchBuses();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error creating bus:', error.response);
      const errorData = error.response?.data;
      let errorMsg = 'Failed to create bus';

      if (errorData?.errors) {
        errorMsg = Object.entries(errorData.errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      } else if (errorData?.detail) {
        errorMsg = errorData.detail;
      }

      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    if (!formData.institute) {
      setMessage({ type: 'error', text: 'Please select an institute for bulk upload' });
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', uploadFile);
    formDataUpload.append('institute', formData.institute.toString());

    try {
      const response = await api.post('/institutes/drivers/bulk_upload/', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `Upload complete! Imported: ${response.data.imported}, Errors: ${response.data.errors}` 
        });
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadFile(null);
          setMessage({ type: '', text: '' });
          fetchBuses();
        }, 2000);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Upload failed';
      setMessage({ type: 'error', text: errorMsg });
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
          <h1 className="text-3xl font-bold">Buses</h1>
          <p className="text-muted-foreground">
            Monitor and manage bus fleet
            {isAdmin && <span className="ml-2 text-blue-600 font-medium">(Admin View)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Bus
          </Button>
          <Button 
            onClick={() => setShowUploadModal(true)} 
            variant="outline" 
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {message.text && (
        <div className={cn(
          "p-4 rounded-lg flex items-center gap-2",
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        )}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex gap-4">
        <Input
          placeholder="Search buses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {isAdmin && institutes.length > 0 && (
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => {
              const instituteId = parseInt(e.target.value);
              if (instituteId === 0) {
                setFilteredBuses(buses);
              } else {
                const filtered = buses.filter(bus => {
                  const institute = institutes.find(i => i.institute_name === bus.institute_name);
                  return institute?.id === instituteId;
                });
                setFilteredBuses(filtered);
              }
            }}
          >
            <option value="0">All Institutes</option>
            {institutes.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.institute_name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBuses.map((bus) => (
          <Card key={bus.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    bus.is_moving ? "bg-green-100" : "bg-gray-100"
                  )}>
                    <Bus className={cn(
                      "h-5 w-5",
                      bus.is_moving ? "text-green-700" : "text-gray-700"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-bold">{bus.bus_short_name}</h3>
                    <p className="text-sm text-muted-foreground">{bus.bus_number}</p>
                  </div>
                </div>
                <Badge className={cn(
                  bus.is_moving ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                )}>
                  {bus.is_moving ? '● Moving' : '○ Stopped'}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="line-clamp-2">{bus.route}</p>
              </div>

              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{bus.current_speed} km/h</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{formatTime(bus.last_location_update)}</span>
                </div>
              </div>

              {bus.current_latitude && bus.current_longitude && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">
                    {parseFloat(bus.current_latitude).toFixed(4)}, {parseFloat(bus.current_longitude).toFixed(4)}
                  </span>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {bus.institute_name}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBuses.length === 0 && (
        <div className="text-center py-12">
          <Bus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No buses found</p>
        </div>
      )}

      {/* Create Bus Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Create New Bus</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setMessage({ type: '', text: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {message.text && message.type === 'error' && (
                <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bus Code *</label>
                  <Input
                    type="text"
                    value={formData.bus_code}
                    onChange={(e) => setFormData({ ...formData, bus_code: e.target.value })}
                    placeholder="e.g., BUS001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bus Number *</label>
                  <Input
                    type="text"
                    value={formData.bus_number}
                    onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                    placeholder="e.g., KA-01-AB-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bus Short Name *</label>
                  <Input
                    type="text"
                    value={formData.bus_short_name}
                    onChange={(e) => setFormData({ ...formData, bus_short_name: e.target.value })}
                    placeholder="e.g., BUS-A1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Route *</label>
                  <Input
                    type="text"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    placeholder="e.g., City Center - Campus"
                  />
                </div>

                {isAdmin && institutes.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Institute *</label>
                    <select
                      value={formData.institute}
                      onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Institute</option>
                      {institutes.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.institute_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {!isAdmin && institutes.length === 1 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Institute</label>
                    <Input
                      type="text"
                      value={institutes[0]?.institute_name || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                    id="is_active"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">Active</label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      setShowCreateModal(false);
                      setMessage({ type: '', text: '' });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBus} className="flex-1">
                    Create Bus
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Bulk Upload Drivers</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setMessage({ type: '', text: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {message.text && message.type === 'error' && (
                <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              <div className="space-y-4">
                {isAdmin && institutes.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Institute *</label>
                    <select
                      value={formData.institute}
                      onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Institute</option>
                      {institutes.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.institute_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Select Excel File *</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer block">
                      <span className="text-sm text-gray-600">
                        {uploadFile ? uploadFile.name : 'Click to select Excel file'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                  <p className="font-medium mb-1">Expected columns:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>driver_code</li>
                    <li>driver_name</li>
                    <li>username</li>
                    <li>password</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setMessage({ type: '', text: '' });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleBulkUpload} className="flex-1">
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Buses;