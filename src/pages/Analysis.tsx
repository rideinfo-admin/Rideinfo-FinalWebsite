import { useState, useEffect } from 'react';
import { Building2, Users, MessageSquare, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface Stats {
  institutes: {
    total: number;
    active: number;
    inactive: number;
  };
  drivers: {
    total: number;
    active: number;
    inactive: number;
  };
  complaints: {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
    closed: number;
    by_priority: {
      LOW: number;
      MEDIUM: number;
      HIGH: number;
      URGENT: number;
    };
  };
}

export default function Analysis() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [instituteStats, complaintStats] = await Promise.all([
        apiService.getInstituteStatistics(),
        apiService.getComplaintStatistics(),
      ]);

      setStats({
        institutes: {
          total: instituteStats.total_institutes || 0,
          active: instituteStats.active_institutes || 0,
          inactive: (instituteStats.total_institutes || 0) - (instituteStats.active_institutes || 0),
        },
        drivers: {
          total: instituteStats.total_drivers || 0,
          active: instituteStats.active_drivers || 0,
          inactive: (instituteStats.total_drivers || 0) - (instituteStats.active_drivers || 0),
        },
        complaints: {
          total: complaintStats.total_complaints || 0,
          pending: complaintStats.complaints_by_status?.PENDING || 0,
          in_progress: complaintStats.complaints_by_status?.IN_PROGRESS || 0,
          resolved: complaintStats.complaints_by_status?.RESOLVED || 0,
          closed: complaintStats.complaints_by_status?.CLOSED || 0,
          by_priority: {
            LOW: complaintStats.complaints_by_priority?.LOW || 0,
            MEDIUM: complaintStats.complaints_by_priority?.MEDIUM || 0,
            HIGH: complaintStats.complaints_by_priority?.HIGH || 0,
            URGENT: complaintStats.complaints_by_priority?.URGENT || 0,
          },
        },
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Analysis & Reports</h1>
        <p className="text-slate-600 mt-1">Overview of system statistics and performance metrics</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-500">Institutes</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-slate-900">{stats.institutes.total}</span>
                  <span className="text-sm text-slate-500">Total</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Active</span>
                  <span className="font-medium text-green-600">{stats.institutes.active}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Inactive</span>
                  <span className="font-medium text-slate-500">{stats.institutes.inactive}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-slate-500">Drivers</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-slate-900">{stats.drivers.total}</span>
                  <span className="text-sm text-slate-500">Total</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Active</span>
                  <span className="font-medium text-green-600">{stats.drivers.active}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Inactive</span>
                  <span className="font-medium text-slate-500">{stats.drivers.inactive}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-slate-500">Complaints</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-slate-900">{stats.complaints.total}</span>
                  <span className="text-sm text-slate-500">Total</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Pending</span>
                  <span className="font-medium text-orange-600">{stats.complaints.pending}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Resolved</span>
                  <span className="font-medium text-green-600">{stats.complaints.resolved}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Complaints Status Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.complaints.pending}</p>
                  <p className="text-sm text-slate-600">Pending</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{
                    width: `${stats.complaints.total > 0 ? (stats.complaints.pending / stats.complaints.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.complaints.in_progress}</p>
                  <p className="text-sm text-slate-600">In Progress</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${stats.complaints.total > 0 ? (stats.complaints.in_progress / stats.complaints.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.complaints.resolved}</p>
                  <p className="text-sm text-slate-600">Resolved</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${stats.complaints.total > 0 ? (stats.complaints.resolved / stats.complaints.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.complaints.closed}</p>
                  <p className="text-sm text-slate-600">Closed</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                <div
                  className="bg-slate-600 h-2 rounded-full"
                  style={{
                    width: `${stats.complaints.total > 0 ? (stats.complaints.closed / stats.complaints.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Complaints by Priority</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-slate-900">Urgent</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{stats.complaints.by_priority.URGENT}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-red-600 h-3 rounded-full"
                    style={{
                      width: `${stats.complaints.total > 0 ? (stats.complaints.by_priority.URGENT / stats.complaints.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-slate-900">High</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{stats.complaints.by_priority.HIGH}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-orange-600 h-3 rounded-full"
                    style={{
                      width: `${stats.complaints.total > 0 ? (stats.complaints.by_priority.HIGH / stats.complaints.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-slate-900">Medium</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{stats.complaints.by_priority.MEDIUM}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-yellow-600 h-3 rounded-full"
                    style={{
                      width: `${stats.complaints.total > 0 ? (stats.complaints.by_priority.MEDIUM / stats.complaints.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-slate-900">Low</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{stats.complaints.by_priority.LOW}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{
                      width: `${stats.complaints.total > 0 ? (stats.complaints.by_priority.LOW / stats.complaints.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
