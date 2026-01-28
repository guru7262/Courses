const API_BASE_URL = 'http://localhost:5000/api';

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