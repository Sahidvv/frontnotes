import { useEffect, useState, useCallback, useRef } from 'react';
import NoteForm from './NoteForm';
import {
  fetchNotes,
  deleteNote,
  toggleArchive,
  updateNote,  
} from '../api/api';
import '../styles.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editState, setEditState] = useState({});
  const [editingCategory, setEditingCategory] = useState({ noteId: null, index: null });

  const loadNotes = useCallback(async () => {
    const data = await fetchNotes();
    setNotes(data);
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoriesList = [...new Set(notes.flatMap(note => note.categories || []))];

  const filteredNotes = notes.filter(note => {
    const matchesCategory = filter ? note.categories?.includes(filter) : true;
    const matchesArchive = showArchived ? note.archived : !note.archived;
    return matchesCategory && matchesArchive;
  });

const saveEdits = async (id) => {
  const edited = editState[id];
  if (edited) {
    await updateNote(id, edited); 
    setEditingNoteId(null);
    setEditState(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    loadNotes();
  }
};


return (
<div className="notes-container">
    <h2>Your Notes</h2>
    <button className="logout-btn"  onClick={() => {
      localStorage.removeItem('token');
      window.location.href = '/';
    }}>Logout</button>

    <NoteForm onNoteCreated={loadNotes} />

  <div className="filter-section">
      <h4>Filter by Category</h4>
      <div style={{ position: 'relative', display: 'inline-block' }} ref={suggestionsRef}>
        <input
          placeholder="Type to filter"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        {showSuggestions && (
  <div className="suggestions-dropdown">
            {categoriesList.filter(cat => cat.toLowerCase().includes(filter.toLowerCase()) || !filter)
              .map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFilter(cat);
                    setShowSuggestions(false);
                  }}
                  style={{ padding: '5px', cursor: 'pointer' }}
                >
                  {cat}
                </div>
              ))}
          </div>
        )}
      </div>
      <button onClick={() => setShowArchived(!showArchived)}>
        {showArchived ? 'Hide Archived' : 'Show Archived'}
      </button>
    </div>

    {filteredNotes.length === 0 && <p>No notes found.</p>}

    {filteredNotes.map(note => {
      const isEditing = editingNoteId === note.id;
      const edited = editState[note.id] || note;

      return (
        <div key={note.id} className="note-item">
          {isEditing ? (
            <>
              <input
                value={edited.title}
                onChange={(e) =>
                  setEditState(prev => ({
                    ...prev,
                    [note.id]: { ...edited, title: e.target.value }
                  }))
                }
              />
              <textarea
                value={edited.content}
                onChange={(e) =>
                  setEditState(prev => ({
                    ...prev,
                    [note.id]: { ...edited, content: e.target.value }
                  }))
                }
                rows={3}
              />
            <div className="categories">
                <strong>Categories:</strong>
                {edited.categories?.map((cat, idx) => (
                <span key={idx}>
                    {editingCategory.noteId === note.id && editingCategory.index === idx ? (
                      <input
                        autoFocus
                        defaultValue={cat}
                        onBlur={(e) => {
                          const updated = [...edited.categories];
                          updated[idx] = e.target.value.trim();
                          setEditState(prev => ({
                            ...prev,
                            [note.id]: { ...edited, categories: updated }
                          }));
                          setEditingCategory({ noteId: null, index: null });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.target.blur();
                        }}
                      />
                    ) : (
                      <>
                        <span
                          onDoubleClick={() => setEditingCategory({ noteId: note.id, index: idx })}
                          style={{ cursor: 'pointer', textDecoration: 'underline' }}
                          title="Double click to edit"
                        >
                          {cat}
                        </span>
                        <button
                          onClick={() => {
                            const updated = edited.categories.filter((c) => c !== cat);
                            setEditState(prev => ({
                              ...prev,
                              [note.id]: { ...edited, categories: updated }
                            }));
                          }}
                        >
                          x
                        </button>
                      </>
                    )}
                  </span>
                ))}
                <input
                  placeholder="New category"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const newCat = e.target.value.trim();
                      if (newCat && !(edited.categories || []).includes(newCat)) {
                        setEditState(prev => ({
                          ...prev,
                          [note.id]: { ...edited, categories: [...(edited.categories || []), newCat] }
                        }));
                        e.target.value = '';
                      }
                    }
                  }}
                />
              </div>
              <button onClick={() => saveEdits(note.id)}>Save</button>
<button
  onClick={() => {
    setEditingNoteId(null);
    setEditState(prev => {
      const newState = { ...prev };
      delete newState[note.id];  
      return newState;
    });
  }}
>
  Cancel
</button>            </>
          ) : (
            <>
              <h4>{note.title}</h4>
              <p>{note.content}</p>
            <div className="categories">
                <strong>Categories:</strong>
                {note.categories?.map((cat, idx) => (
                <span key={idx}>
                    {cat}
                    <button
                      onClick={() => {
                        const updated = note.categories.filter((c) => c !== cat);
                        updateNote(note.id, { ...note, categories: updated }).then(loadNotes);
                      }}
                    >
                      x
                    </button>
                  </span>
                ))}
                <input
                  placeholder="New category"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const newCat = e.target.value.trim();
                      if (newCat && !(note.categories || []).includes(newCat)) {
                        const updated = [...(note.categories || []), newCat];
                        updateNote(note.id, { ...note, categories: updated }).then(loadNotes);
                        e.target.value = '';
                      }
                    }
                  }}
                />
              </div>
              <button onClick={() => setEditingNoteId(note.id)}>Edit</button>
            </>
          )}

          <button onClick={() => deleteNote(note.id).then(loadNotes)}>Delete</button>
          <button onClick={() => toggleArchive(note.id).then(loadNotes)}>
            {note.archived ? 'Unarchive' : 'Archive'}
          </button>
        </div>
      );
    })}
  </div>
);

};

export default Notes;
