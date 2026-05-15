// Cleanly handles the API URL to prevent double '/api/v1' issues
const RAW_URL = import.meta.env.VITE_API_URL || 'https://luxurious-fiction-backroom.ngrok-free.dev';
const API_BASE_URL = RAW_URL.endsWith('/api/v1') ? RAW_URL : `${RAW_URL}/api/v1`;

/**
 * Handle API responses globally
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const clone = response.clone();
      const errorData = await clone.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
      if (Array.isArray(errorMessage)) errorMessage = errorMessage.map(e => e.msg || JSON.stringify(e)).join(', ');
    } catch {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Standard headers needed for all Ngrok tunneled requests
const NGROK_HEADERS = {
  'ngrok-skip-browser-warning': 'true',
  'Bypass-Tunnel-Reminder': 'true'
};

export const submitCoaxBeforeJob = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/jobs/coax-before`, {
    method: 'POST',
    headers: { ...NGROK_HEADERS },
    body: formData,
  });
  return handleResponse(response);
};

export const submitJob = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { ...NGROK_HEADERS },
    body: formData,
  });
  return handleResponse(response);
};

export const submitFiberOverviewJob = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/jobs/fiber-overview`, {
    method: 'POST',
    headers: { ...NGROK_HEADERS },
    body: formData,
  });
  return handleResponse(response);
};

export const submitFiberBeforeJob = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/jobs/fiber-overview-before`, {
    method: 'POST',
    headers: { ...NGROK_HEADERS },
    body: formData,
  });
  return handleResponse(response);
};

export const submitFiberAfterJob = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/jobs/fiber-after`, {
    method: 'POST',
    headers: { ...NGROK_HEADERS },
    body: formData,
  });
  return handleResponse(response);
};

export const getJobStatus = async (jobId, token) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'GET',
    headers: {
      ...NGROK_HEADERS,
      'X-Job-Token': token
    },
  });
  return handleResponse(response);
};

export const getJobResult = async (jobId, token) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/result`, {
    method: 'GET',
    headers: {
      ...NGROK_HEADERS,
      'X-Job-Token': token
    },
  });
  return handleResponse(response);
};

export const downloadJobFile = async (jobId, token) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/download`, {
    method: 'GET',
    headers: {
      ...NGROK_HEADERS,
      'X-Job-Token': token
    },
  });
  if (!response.ok) {
    let msg = 'Download failed';
    try { const d = await response.json(); msg = d.detail || msg; } catch { }
    throw new Error(msg);
  }
  return response;
};

export const triggerDownload = async (jobId, token, filename) => {
  const response = await downloadJobFile(jobId, token);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename || `telecom_report_${jobId.slice(0, 8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { }
  }, 10000);
};

export const postJobAction = async (jobId, token, action, overrides = null) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/action`, {
    method: 'POST',
    headers: {
      ...NGROK_HEADERS,
      'Content-Type': 'application/json',
      'X-Job-Token': token
    },
    body: JSON.stringify({ action, overrides }),
  });
  return handleResponse(response);
};
