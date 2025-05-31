
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface AttendanceRecord {
  id: number;
  name: string;
  timestamp: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  teacher: {
    id: string;
    username: string;
    name: string;
  };
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    console.log('Making request to:', url);
    
    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors', // Explicitly set CORS mode
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('Attempting login to:', `${this.baseURL}/token`);
    
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    try {
      const response = await fetch(`${this.baseURL}/token`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'include', // Include credentials for CORS
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login error response:', errorText);
        
        if (response.status === 422) {
          throw new Error('Invalid username or password format');
        } else if (response.status === 401) {
          throw new Error('Invalid credentials');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();
      this.setToken(data.access_token);
      return data;
    } catch (error) {
      console.error('Login fetch error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running on ' + this.baseURL);
      }
      
      throw error;
    }
  }

  // Attendance endpoints
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    return this.request<AttendanceRecord[]>('/attendance/');
  }

  async getTodayAttendance(): Promise<AttendanceRecord[]> {
    return this.request<AttendanceRecord[]>('/attendance/today');
  }

  async deleteAttendanceRecord(id: number): Promise<void> {
    await this.request(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  async updateAttendanceRecord(id: number, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    return this.request<AttendanceRecord>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Analytics endpoints
  async getAttendanceStats(): Promise<any> {
    return this.request('/attendance/stats');
  }

  async getAttendanceTrends(days: number = 7): Promise<any> {
    return this.request(`/attendance/trends?days=${days}`);
  }
}

export const apiClient = new ApiClient();
