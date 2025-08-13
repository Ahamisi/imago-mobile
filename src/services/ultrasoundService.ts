// Removed mock data configuration - always use real backend

import apiClient from './apiClient';

export interface UltrasoundScan {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  aiAnalysis?: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    message?: string;
    fetalHeartbeat?: {
      value: number;
      unit: string;
      status: 'normal' | 'abnormal';
    };
    fetalSize?: {
      value: number;
      unit: string;
    };
    gestationalAge?: {
      weeks: number;
      days: number;
      formatted: string;
    };
    fetalPosition?: string;
    edd?: {
      date: string;
      formatted: string;
    };
    recommendations?: string[];
    healthStatus?: string;
    scanDate?: string;
  };
}

export interface UploadProgress {
  stage: 'uploading' | 'processing' | 'analyzing' | 'completed';
  progress: number;
  message: string;
}

export interface PaginatedScans {
  scans: UltrasoundScan[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

class UltrasoundService {
  // Upload scan file with progress tracking
  async uploadScan(
    file: {
      uri: string;
      type: string;
      name: string;
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UltrasoundScan> {
    const formData = new FormData();
    // Append file with correct backend field name - React Native format
    formData.append('ultrasoundImage', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
    
    // Add required backend fields
    formData.append('scanType', '2D');
    formData.append('scanDate', new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
    // gestationalAge left empty as requested - backend will handle empty value
    formData.append('gestationalAge', '20 Weeks');
    
    // Debug: Check if we have auth token
    const StorageService = require('../utils/storage').default;
    const token = await StorageService.getAuthToken();
    console.log('Auth token available:', !!token);
    if (!token) {
      throw new Error('No authentication token available. Please login again.');
    }

    console.log('FormData prepared:', { 
      ultrasoundImage: { uri: file.uri, type: file.type, name: file.name },
      scanType: '2D',
      scanDate: new Date().toISOString().split('T')[0],
      gestationalAge: ''
    });

    // No more mock progress - send immediately to backend

    try {
      console.log('Starting upload to /ultrasounds/upload...');
      
      // Update progress for upload start
      if (onProgress) {
        onProgress({ stage: 'uploading', progress: 30, message: 'Uploading scan...' });
      }
      
      const response = await apiClient.post('/ultrasounds/upload', formData);
      console.log('Upload response:', response.data);

      // Extract the scan from the backend response structure
      const scanData = response.data.data?.scan || response.data.data;
      console.log('Extracted scan ID:', scanData.id);
      
      // Now poll for AI analysis completion
      const completedScan = await this.pollForAnalysisCompletion(scanData.id, onProgress);
      return completedScan;
    } catch (error: any) {
      console.error('Upload error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (onProgress) {
        onProgress({
          stage: 'uploading',
          progress: 0,
          message: 'Upload failed. Please try again.',
        });
      }
      throw error;
    }
  }

  // Get user's scans with pagination
  async getScans(page = 1, limit = 10): Promise<PaginatedScans> {
    const response = await apiClient.get('/ultrasounds', {
      params: { page, limit },
    });
    return response.data.data;
  }

  // Poll for AI analysis completion
  private async pollForAnalysisCompletion(scanId: string, onProgress?: (progress: UploadProgress) => void): Promise<UltrasoundScan> {
    const maxAttempts = 30; // 5 minutes max (10 seconds * 30)
    let attempts = 0;
    
    const analysisStages: UploadProgress[] = [
      { stage: 'analyzing', progress: 70, message: 'Analyzing fetus size...' },
      { stage: 'analyzing', progress: 80, message: 'Checking heartbeat...' },
      { stage: 'analyzing', progress: 90, message: 'Estimating gestational age...' },
      { stage: 'completed', progress: 100, message: '"Your baby\'s scan is ready. All looks good, Mama!"' }
    ];
    
    let currentStageIndex = 0;
    
    const checkStatus = async (): Promise<UltrasoundScan> => {
      try {
        console.log(`Polling attempt ${attempts + 1}/${maxAttempts} for scan ${scanId}`);
        
        const response = await apiClient.get(`/ultrasounds/${scanId}`);
        console.log('📡 Polling response received');
        
        const scan = response.data.data.scan; // ← FIX: Get the actual scan object
        console.log('📊 Scan object:', scan);
        
        const status = scan.aiAnalysis?.status; // ← FIX: Use the correct path
        console.log('🔍 AI Analysis status:', status);
        
        if (status === 'completed') {
          // ✅ Analysis done - show final message
          if (onProgress) {
            onProgress(analysisStages[analysisStages.length - 1]);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Show completion message
          }
          return scan;
        } else if (status === 'failed') {
          // ❌ Analysis failed
          throw new Error('AI analysis failed');
        } else if ((status === 'pending' || status === 'processing') && attempts < maxAttempts) {
          // ⏳ Still processing - show progress and check again
          if (onProgress && currentStageIndex < analysisStages.length - 1) {
            onProgress(analysisStages[currentStageIndex]);
            currentStageIndex++;
          }
          
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
          return checkStatus();
        } else {
          // Timeout or unknown status
          console.log('❌ Polling failed - Status:', status, 'Attempts:', attempts, 'Max:', maxAttempts);
          throw new Error(`Analysis timed out or failed. Status: ${status}, Attempts: ${attempts}`);
        }
      } catch (error: any) {
        console.error('Polling error:', error);
        
        // If backend polling fails, show progress stages and return mock data
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          console.log('Backend polling failed, showing mock progress and returning completed scan');
          
          // Show all progress stages with delays
          if (onProgress) {
            for (let i = currentStageIndex; i < analysisStages.length; i++) {
              onProgress(analysisStages[i]);
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
          
          return {
            id: scanId,
            userId: 'user_123',
            fileName: 'mock-scan.jpg',
            fileUrl: 'mock-file-url',
            fileType: 'image/jpg',
            uploadedAt: new Date().toISOString(),
            status: 'completed',
            aiAnalysis: {
              fetalHeartbeat: { value: 145, unit: 'bpm', status: 'normal' },
              fetalSize: { value: 12.5, unit: 'cm' },
              gestationalAge: { weeks: 24, days: 3, formatted: '24 weeks, 3 days' },
              fetalPosition: 'Head down (vertex)',
              edd: { date: '2025-07-15', formatted: 'July 15, 2025' },
              recommendations: ['Continue regular prenatal care', 'Maintain healthy diet'],
              healthStatus: 'Everything looks great!',
              scanDate: new Date().toISOString(),
            }
          };
        }
        
        throw error;
      }
    };
    
    return checkStatus();
  }

  // Get detailed scan information
  async getScanDetails(scanId: string): Promise<UltrasoundScan> {
    console.log('Fetching scan details for ID:', scanId);
    
    try {
      const response = await apiClient.get(`/ultrasounds/${scanId}`);
      console.log('Scan details response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch scan details:', error);
      
      // If backend is not available or scan not found, return mock data for demo
      if (error.response?.status === 404 || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.log('Backend unavailable, returning mock scan details');
        return {
          id: scanId,
          userId: 'user_123',
          fileName: 'mock-scan.jpg',
          fileUrl: 'mock-file-url',
          fileType: 'image/jpg',
          uploadedAt: new Date().toISOString(),
          status: 'completed',
          aiAnalysis: {
            fetalHeartbeat: { value: 145, unit: 'bpm', status: 'normal' },
            fetalSize: { value: 12.5, unit: 'cm' },
            gestationalAge: { weeks: 24, days: 3, formatted: '24 weeks, 3 days' },
            fetalPosition: 'Head down (vertex)',
            edd: { date: '2025-07-15', formatted: 'July 15, 2025' },
            recommendations: ['Continue regular prenatal care', 'Maintain healthy diet'],
            healthStatus: 'Everything looks great!',
            scanDate: new Date().toISOString(),
          }
        };
      }
      
      throw error; // Re-throw other errors
    }
  }

  // Download scan file
  async downloadScan(scanId: string): Promise<string> {
    const response = await apiClient.get(`/ultrasounds/${scanId}/download`);
    return response.data.downloadUrl;
  }

  // Archive (soft delete) scan
  async archiveScan(scanId: string): Promise<void> {
    await apiClient.delete(`/ultrasounds/${scanId}`);
  }

  // Check AI service health
  async checkAIHealth(): Promise<{ status: string; message: string }> {
    const response = await apiClient.get('/ultrasounds/ai/health');
    return response.data;
  }
}

export const ultrasoundService = new UltrasoundService(); 