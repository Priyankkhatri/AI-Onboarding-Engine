const API_BASE = '/api';

export async function analyzResume(resumeFile, jdText, useAi = false) {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jd_text', jdText);
  formData.append('use_ai', useAi);

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || 'Analysis failed');
  }

  return response.json();
}

export async function getDemoData() {
  const response = await fetch(`${API_BASE}/demo`);

  if (!response.ok) {
    throw new Error('Failed to load demo data');
  }

  return response.json();
}

export async function checkHealth() {
  try {
    const response = await fetch('/health');
    return response.json();
  } catch {
    return { status: 'unreachable', openai_configured: false };
  }
}
