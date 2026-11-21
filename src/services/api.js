const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const DEFAULT_DATA = {
  users: [
    { id: '1', name: 'Dr. Jane Mwangi', email: 'admin@inst.edu', password: 'password123', role: 'admin', provider: 'email' },
    { id: '2', name: 'Brian Ochieng', email: 'brian@inst.edu', password: 'password123', role: 'student', provider: 'email' },
  ],
  students: [
    { id: 'STU-001', fullName: 'Brian Ochieng', email: 'brian@inst.edu', program: 'BSc Computer Science', year: 2, status: 'Active' },
    { id: 'STU-002', fullName: 'Amina Hassan', email: 'amina@inst.edu', program: 'BSc Software Engineering', year: 3, status: 'Active' },
  ],
  courses: [
    { id: 'CS-201', code: 'CS-201', title: 'Data Structures & Algorithms', credits: 4, instructor: 'Dr. K. Kamau', capacity: 40 },
    { id: 'SE-305', code: 'SE-305', title: 'Web Application Engineering', credits: 3, instructor: 'Prof. L. Wanjiku', capacity: 35 },
  ],
  enrollments: [
    { id: 'ENR-1', studentId: 'STU-001', courseId: 'CS-201', term: 'Fall 2026', grade: 'A', points: 4.0 },
    { id: 'ENR-2', studentId: 'STU-002', courseId: 'SE-305', term: 'Fall 2026', grade: 'B+', points: 3.5 },
  ],
};
function getLocalCollection(resource) {
  const stored = localStorage.getItem(`sis_${resource}`);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(`sis_${resource}`, JSON.stringify(DEFAULT_DATA[resource] || []));
  return DEFAULT_DATA[resource] || [];
}
function setLocalCollection(resource, items) {
  localStorage.setItem(`sis_${resource}`, JSON.stringify(items));
}
export const api = {
  async getAll(resource) {
    try {
      const res = await fetch(`${API_URL}/${resource}`);
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setLocalCollection(resource, data);
      return data;
    } catch {
      return getLocalCollection(resource);
    }
  },
  async create(resource, payload) {
    const newItem = {
        ...payload,
      id: payload.id ? String(payload.id) : `${resource.slice(0, 3).toUpperCase()}-${Date.now()}`,
      
    };
    try {
      const res = await fetch(`${API_URL}/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error('API create failed');
      const saved = await res.json();
      const current = getLocalCollection(resource);
      setLocalCollection(resource, [...current, saved]);
      return saved;
    } catch {
      const current = getLocalCollection(resource);
      setLocalCollection(resource, [...current, newItem]);
      return newItem;
    }
  },
  async update(resource, id, updates) {
    try {
      const res = await fetch(`${API_URL}/${resource}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('API update failed');
      const updated = await res.json();
      const current = getLocalCollection(resource).map((item) => (item.id === id ? updated : item));
      setLocalCollection(resource, current);
      return updated;
    } catch {
      const current = getLocalCollection(resource).map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      setLocalCollection(resource, current);
      return current.find((item) => item.id === id);
    }
  },
  async remove(resource, id) {
    try {
      await fetch(`${API_URL}/${resource}/${id}`, { method: 'DELETE' });
    } finally {
      const current = getLocalCollection(resource).filter((item) => item.id !== id);
      setLocalCollection(resource, current);
    }
    return true;
  },
};

