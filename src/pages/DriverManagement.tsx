import { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Edit, Trash2, Eye, Plus, Upload, UserPlus } from 'lucide-react';
import { apiService, Driver, Institute } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import DriverForm from '../components/DriverForm';

interface DriverManagementProps {
  institute: Institute;
  onBack: () => void;
}

export default function DriverManagement({ institute, onBack }: DriverManagementProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, [institute.id]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getInstituteDrivers(institute.id);
      setDrivers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setViewMode('detail');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (data: any) => {
    if (!selectedDriver) return;

    try {
      const updated = await apiService.updateDriver(selectedDriver.id, data);
      setDrivers(drivers.map((d) => (d.id === updated.id ? updated : d)));
      setSelectedDriver(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update driver');
    }
  };

  const handleDelete = async () => {
    if (!selectedDriver) return;

    try {
      await apiService.deleteDriver(selectedDriver.id);
      setDrivers(drivers.filter((d) => d.id !== selectedDriver.id));
      setShowDeleteDialog(false);
      setViewMode('list');
      setSelectedDriver(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete driver');
      setShowDeleteDialog(false);
    }
  };

  const handleAddDriver = async (data: any) => {
    try {
      const newDriver = await apiService.createDriver({ ...data, institute: institute.id });
      setDrivers([...drivers, newDriver]);
      setShowAddForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleBulkUpload = async (file: File) => {
    try {
      setError('');
      await apiService.bulkUploadDrivers(file);
      await loadDrivers();
      setShowBulkUpload(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload drivers');
    }
  };

  if (viewMode === 'detail' && selectedDriver) {
    return (
      <div>
        <button
          onClick={() => {
            setViewMode('list');
            setSelectedDriver(null);
            setIsEditing(false);
          }}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Drivers</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedDriver.driver_name}</h2>
                <p className="text-slate-600 mt-1">{selectedDriver.driver_code}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedDriver.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {selectedDriver.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="p-6">
              <DriverForm
                initialData={selectedDriver}
                institute={institute}
                onSubmit={handleSave}
                onCancel={() => setIsEditing(false)}
                submitLabel="Save Changes"
                isEdit={true}
              />
            </div>
          ) : (
            <>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-500">Mobile Number</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <p className="text-slate-900">{selectedDriver.driver_mobile}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500">Username</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <User className="h-4 w-4 text-slate-400" />
                        <p className="text-slate-900">{selectedDriver.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-500">Institute</label>
                      <p className="text-slate-900 mt-1">{institute.institute_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Driver"
          message={`Are you sure you want to delete ${selectedDriver.driver_name}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          type="danger"
        />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Institutes</span>
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Driver Management</h1>
          <p className="text-slate-600 mt-1">{institute.institute_name}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Add Driver</span>
          </button>

          {showAddMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10">
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  setShowAddForm(true);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <UserPlus className="h-4 w-4" />
                <span>Single Driver</span>
              </button>
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  setShowBulkUpload(true);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <Upload className="h-4 w-4" />
                <span>Bulk Upload (Excel)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      ) : drivers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Drivers Found</h3>
          <p className="text-slate-600">Add drivers to this institute to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {driver.driver_name}
                    </h3>
                    <p className="text-sm text-slate-500">{driver.driver_code}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    driver.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {driver.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>{driver.driver_mobile}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <User className="h-4 w-4" />
                    <span>{driver.username}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(driver)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-75" onClick={() => setShowAddForm(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Add New Driver</h3>
                <DriverForm
                  institute={institute}
                  onSubmit={handleAddDriver}
                  onCancel={() => setShowAddForm(false)}
                  submitLabel="Add Driver"
                  isEdit={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkUpload && (
        <BulkUploadModal
          onUpload={handleBulkUpload}
          onClose={() => setShowBulkUpload(false)}
        />
      )}
    </div>
  );
}

function BulkUploadModal({ onUpload, onClose }: { onUpload: (file: File) => void; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-75" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit} className="bg-white px-6 pt-6 pb-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Bulk Upload Drivers</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Excel File
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  Upload an Excel file with driver information
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={uploading}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
