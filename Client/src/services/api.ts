const API_BASE_URL = '/api/categories';

const requestHeaders = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true' // This is the magic line
};

export const subjectsAPI = {
  getAllSubjects: async () => {
    const response = await fetch(`${API_BASE_URL}/subjects`);
    if (!response.ok) throw new Error('Failed to fetch subjects');
    return response.json();
  },

  getSubjectById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch subject');
    return response.json();
  }
};