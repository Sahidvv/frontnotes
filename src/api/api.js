import axios from 'axios';

const api = import.meta.env.VITE_API_URL;

// Login
export const login = async (username, password) => {
  const res = await axios.post(`${api}/auth/login`, { username, password });
  return res.data;
};

// Notes CRUD
export const fetchNotes = () => axios.get(`${api}/notes`).then(res => res.data);
export const createNote = (note) => axios.post(`${api}/notes`, note);
export const updateNote = (id, note) => axios.put(`${api}/notes/${id}`, note);
export const deleteNote = (id) => axios.delete(`${api}/notes/${id}`);
export const toggleArchive = (id) => axios.patch(`${api}/notes/${id}/archive`);
export const updateCategories = (id, categories) => axios.put(`${api}/notes/${id}`, { categories });
