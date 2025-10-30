import { useState, useEffect } from 'react';
import { Building2, MapPin, Mail, Phone, Edit, Trash2, Eye, Plus, ArrowLeft } from 'lucide-react';
import { apiService, Institute } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import InstituteForm from '../components/InstituteForm';
import DriverManagement from './DriverManagement';

export default function InstituteManagement() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'drivers'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadInstitutes();
  }, []);

  const loadInstitutes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getInstitutes();
      setInstitutes(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load institutes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (institute: Institute) => {
    setSelectedInstitute(institute);
    setViewMode('detail');
    setIsEditing(false);
  };

  const handleViewDrivers = (institute: Institute) => {
    setSelectedInstitute(institute);
    setViewMode('drivers');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (data: Partial<Institute>) => {
    if (!selectedInstitute) return;

    try {
      const updated = await apiService.updateInstitute(selectedInstitute.id, data);
      setInstitutes(institutes.map((i) => (i.id === updated.id ? updated : i)));
      setSelectedInstitute(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update institute');
    }
  };

  const handleDelete = async () => {
    if (!selectedInstitute) return;

    try {
      await apiService.deleteInstitute(selectedInstitute.id);
      setInstitutes(institutes.filter((i) => i.id !== selectedInstitute.id));
      setShowDeleteDialog(false);
      setViewMode('list');
      setSelectedInstitute(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete institute');
      setShowDeleteDialog(false);
    }
  };

  const handleAddInstitute = async (data: Partial<Institute>) => {
    try {
      const newInstitute = await apiService.createInstitute(data);
      setInstitutes([...institutes, newInstitute]);
      setShowAddForm(false);
    } catch (err) {
      throw err;
    }
  };

  if (viewMode === 'drivers' && selectedInstitute) {
    return (
      <DriverManagement
        institute={selectedInstitute}
        onBack={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'detail' && selectedInstitute) {
    return (
      <div>
        <button
          onClick={() => {
            setViewMode('list');
            setSelectedInstitute(null);
            setIsEditing(false);
          }}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Institutes</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedInstitute.institute_name}</h2>
                <p className="text-slate-600 mt-1">{selectedInstitute.institute_code}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedInstitute.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {selectedInstitute.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="p-6">
              <InstituteForm
                initialData={selectedInstitute}
                onSubmit={handleSave}
                onCancel={() => setIsEditing(false)}
                submitLabel="Save Changes"
              />
            </div>
          ) : (
            <>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-500">Place</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <p className="text-slate-900">{selectedInstitute.place}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500">Address</label>
                      <p className="text-slate-900 mt-1">{selectedInstitute.address}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500">Contact Number</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <p className="text-slate-900">{selectedInstitute.contact_number}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-500">Email</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <p className="text-slate-900">{selectedInstitute.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500">Coordinates</label>
                      <p className="text-slate-900 mt-1">
                        {selectedInstitute.latitude}, {selectedInstitute.longitude}
                      </p>
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
          title="Delete Institute"
          message={`Are you sure you want to delete ${selectedInstitute.institute_name}? This action cannot be undone.`}
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Institute Management</h1>
          <p className="text-slate-600 mt-1">Manage all institutes and their information</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Add Institute</span>
        </button>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutes.map((institute) => (
            <div
              key={institute.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {institute.institute_name}
                    </h3>
                    <p className="text-sm text-slate-500">{institute.institute_code}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    institute.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {institute.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{institute.place}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>{institute.contact_number}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{institute.email}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(institute)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleViewDrivers(institute)}
                    className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium"
                  >
                    Drivers
                  </button>
                </div>
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
                <h3 className="text-xl font-bold text-slate-900 mb-4">Add New Institute</h3>
                <InstituteForm
                  onSubmit={handleAddInstitute}
                  onCancel={() => setShowAddForm(false)}
                  submitLabel="Add Institute"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
