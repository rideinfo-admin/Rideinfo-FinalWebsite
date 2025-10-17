import { authService } from './auth';

const API_BASE_URL = 'https://ri-backend-247c.onrender.com/api';

export interface Institute {
  id: number;
  institute_code: string;
  institute_name: string;
  place: string;
  address: string;
  latitude: string;
  longitude: string;
  contact_number: string;
  email: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Driver {
  id: number;
  driver_code: string;
  driver_name: string;
  driver_mobile: string;
  institute: number;
  institute_details?: Institute;
  username: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Complaint {
  id: number;
  complaint_code: string;
  institute: number;
  institute_details?: Institute;
  complainant_name: string;
  complainant_mobile: string;
  complainant_email: string;
  reason: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  driver?: number;
  driver_details?: Driver;
  assigned_to?: number;
  resolution_notes?: string;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;
}

export interface Statistics {
  total_institutes: number;
  active_institutes: number;
  total_drivers: number;
  active_drivers: number;
  total_complaints: number;
  pending_complaints: number;
  resolved_complaints: number;
  complaints_by_priority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
  complaints_by_status: {
    PENDING: number;
    IN_PROGRESS: number;
    RESOLVED: number;
    CLOSED: number;
  };
}

class ApiService {
  private async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    return authService.authenticatedFetch(url, options);
  }

  async getInstitutes(): Promise<Institute[]> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/institutes/`);
    if (!response.ok) throw new Error('Failed to fetch institutes');
    return response.json();
  }

  async getInstitute(id: number): Promise<Institute> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/institutes/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch institute');
    return response.json();
  }

  async createInstitute(data: Partial<Institute>): Promise<Institute> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/institutes/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create institute');
    }
    return response.json();
  }

  async updateInstitute(id: number, data: Partial<Institute>): Promise<Institute> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/institutes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update institute');
    }
    return response.json();
  }

  async deleteInstitute(id: number): Promise<void> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/institutes/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete institute');
  }

  async getInstituteDrivers(instituteId: number): Promise<Driver[]> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/institutes/${instituteId}/drivers/`);
    if (!response.ok) throw new Error('Failed to fetch institute drivers');
    return response.json();
  }

  async getDrivers(): Promise<Driver[]> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/drivers/`);
    if (!response.ok) throw new Error('Failed to fetch drivers');
    return response.json();
  }

  async getDriver(id: number): Promise<Driver> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/drivers/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch driver');
    return response.json();
  }

  async createDriver(data: any): Promise<Driver> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/drivers/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error) || 'Failed to create driver');
    }
    return response.json();
  }

  async updateDriver(id: number, data: Partial<Driver>): Promise<Driver> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/drivers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update driver');
    }
    return response.json();
  }

  async deleteDriver(id: number): Promise<void> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/drivers/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete driver');
  }

  async bulkUploadDrivers(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/institutes/drivers/bulk_upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload drivers');
    }
    return response.json();
  }

  async getComplaints(): Promise<Complaint[]> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/complaints/`);
    if (!response.ok) throw new Error('Failed to fetch complaints');
    return response.json();
  }

  async getComplaint(id: number): Promise<Complaint> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/complaints/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch complaint');
    return response.json();
  }

  async updateComplaint(id: number, data: Partial<Complaint>): Promise<Complaint> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/complaints/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update complaint');
    }
    return response.json();
  }

  async deleteComplaint(id: number): Promise<void> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/complaints/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete complaint');
  }

  async resolveComplaint(id: number, notes: string): Promise<Complaint> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/complaints/${id}/resolve/`, {
      method: 'POST',
      body: JSON.stringify({ resolution_notes: notes }),
    });
    if (!response.ok) throw new Error('Failed to resolve complaint');
    return response.json();
  }

  async getInstituteStatistics(): Promise<any> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/institutes/statistics/`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  }

  async getComplaintStatistics(): Promise<any> {
    const response = await this.fetch(`${API_BASE_URL}/institutes/complaints/statistics/`);
    if (!response.ok) throw new Error('Failed to fetch complaint statistics');
    return response.json();
  }
}

export const apiService = new ApiService();
