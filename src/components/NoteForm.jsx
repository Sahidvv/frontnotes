import { useState } from 'react';
import { createNote } from '../api/api';
import '../styles.css';

const NoteForm = ({ onNoteCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createNote({ title, content, categories });
    setTitle('');
    setContent('');
    setCategories([]);
    setNewCategory('');
    onNoteCreated();
  };

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
    }
    setNewCategory('');
  };

  const removeCategory = (cat) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  return (
<form onSubmit={handleSubmit} className="note-form">
      <h2>Create Note</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" />
      <div>
        <h4>Categories</h4>
        {categories.map((cat, idx) => (
          <span key={idx} style={{ marginRight: '5px' }}>
            {cat} <button type="button" onClick={() => removeCategory(cat)}>x</button>
          </span>
        ))}
        <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addCategory();
          }
        }} placeholder="Add category" />
        <button type="button" onClick={addCategory}>Add Category</button>
      </div>
      <button type="submit">Save Note</button>
    </form>
  );
};

export default NoteForm;
