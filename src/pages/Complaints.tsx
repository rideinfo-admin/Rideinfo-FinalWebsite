import { useState, useEffect } from 'react';
import { MessageSquare, User, Phone, Mail, AlertCircle, Calendar, Edit, Trash2, X } from 'lucide-react';
import { apiService, Complaint, Institute } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [selectedInstitute, setSelectedInstitute] = useState<number | 'all'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [complaintsData, institutesData] = await Promise.all([
        apiService.getComplaints(),
        apiService.getInstitutes(),
      ]);
      setComplaints(complaintsData);
      setInstitutes(institutesData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedComplaint) return;

    try {
      await apiService.deleteComplaint(selectedComplaint.id);
      setComplaints(complaints.filter((c) => c.id !== selectedComplaint.id));
      setShowDeleteDialog(false);
      setShowDetailModal(false);
      setSelectedComplaint(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete complaint');
      setShowDeleteDialog(false);
    }
  };

  const handleStatusChange = async (complaint: Complaint, newStatus: string) => {
    try {
      const updated = await apiService.updateComplaint(complaint.id, { status: newStatus as any });
      setComplaints(complaints.map((c) => (c.id === updated.id ? updated : c)));
      if (selectedComplaint?.id === updated.id) {
        setSelectedComplaint(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const filteredComplaints = selectedInstitute === 'all'
    ? complaints
    : complaints.filter((c) => c.institute === selectedInstitute);

  const groupedComplaints = institutes.reduce((acc, institute) => {
    const instituteComplaints = filteredComplaints.filter((c) => c.institute === institute.id);
    if (instituteComplaints.length > 0 || selectedInstitute === institute.id) {
      acc[institute.id] = {
        institute,
        complaints: instituteComplaints,
      };
    }
    return acc;
  }, {} as Record<number, { institute: Institute; complaints: Complaint[] }>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'RESOLVED':
        return 'bg-green-100 text-green-700';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-700';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'LOW':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Complaints Management</h1>
          <p className="text-slate-600 mt-1">View and manage complaints by institute</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Institute</label>
        <select
          value={selectedInstitute}
          onChange={(e) => setSelectedInstitute(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="w-full md:w-64 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
        >
          <option value="all">All Institutes</option>
          {institutes.map((institute) => (
            <option key={institute.id} value={institute.id}>
              {institute.institute_name}
            </option>
          ))}
        </select>
      </div>

      {Object.keys(groupedComplaints).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Complaints Found</h3>
          <p className="text-slate-600">There are no complaints for the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.values(groupedComplaints).map(({ institute, complaints: instituteComplaints }) => (
            <div key={institute.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">{institute.institute_name}</h2>
                  <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">
                    {instituteComplaints.length} Complaints
                  </span>
                </div>
              </div>

              {instituteComplaints.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No complaints for this institute
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {instituteComplaints.map((complaint) => (
                    <div key={complaint.id} className="p-6 hover:bg-slate-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-semibold text-slate-900">{complaint.complaint_code}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                          </div>

                          <p className="text-slate-700 mb-3">{complaint.reason}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center space-x-2 text-slate-600">
                              <User className="h-4 w-4" />
                              <span>{complaint.complainant_name}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-slate-600">
                              <Phone className="h-4 w-4" />
                              <span>{complaint.complainant_mobile}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-slate-600">
                              <Mail className="h-4 w-4" />
                              <span>{complaint.complainant_email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-slate-600">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(complaint.created_at!).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
                            title="View Details"
                          >
                            <AlertCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowDeleteDialog(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center space-x-2">
                        <label className="text-sm font-medium text-slate-700">Status:</label>
                        <select
                          value={complaint.status}
                          onChange={(e) => handleStatusChange(complaint, e.target.value)}
                          className="px-3 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDetailModal && selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedComplaint(null);
          }}
          onDelete={() => setShowDeleteDialog(true)}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Complaint"
        message={`Are you sure you want to delete complaint ${selectedComplaint?.complaint_code}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />
    </div>
  );
}

function ComplaintDetailModal({ complaint, onClose, onDelete }: { complaint: Complaint; onClose: () => void; onDelete: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'RESOLVED':
        return 'bg-green-100 text-green-700';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-700';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'LOW':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-75" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{complaint.complaint_code}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Reason</label>
                <p className="text-slate-900 mt-1">{complaint.reason}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Complainant Name</label>
                  <p className="text-slate-900 mt-1">{complaint.complainant_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Mobile</label>
                  <p className="text-slate-900 mt-1">{complaint.complainant_mobile}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Email</label>
                  <p className="text-slate-900 mt-1">{complaint.complainant_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created</label>
                  <p className="text-slate-900 mt-1">{new Date(complaint.created_at!).toLocaleString()}</p>
                </div>
              </div>

              {complaint.resolution_notes && (
                <div>
                  <label className="text-sm font-medium text-slate-500">Resolution Notes</label>
                  <p className="text-slate-900 mt-1">{complaint.resolution_notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Close
            </button>
            <button
              onClick={onDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
