import { useEffect, useState } from 'react';
import './App.css';
import type { LemfRecord } from './types';
import Home from './Pages/home';
import DisplayLemf from './Pages/display_lemf';
import CreateLemf from './Pages/create_lemf';
import Details from './Pages/details';
import Login from './Pages/login';
import EditLemf from './Pages/edit_lemf';

type PageKey = 'home' | 'display' | 'create' | 'details' | 'edit';

const emptyForm = {
  name: '',
  category: 'Network',
  assignedTo: 'Support team',
  notes: 'Created from React',
  status: 'PENDING',
};

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('home');
  const [searchValue, setSearchValue] = useState('');
  const [rows, setRows] = useState<LemfRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<LemfRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('isLoggedIn') === 'true');
  const [user, setUser] = useState<string>(() => localStorage.getItem('username') || '');
  const [editRecord, setEditRecord] = useState<LemfRecord | null>(null);

  const navigateTo = (page: PageKey) => {
    setActivePage(page);
    window.history.pushState({}, '', `#${page}`);
  };

  const handleSessionExpired = () => {
    setIsLoggedIn(false);
    setUser('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    setToast({ message: 'Session expired. Please log in again.', type: 'error' });
    setTimeout(() => setToast(null), 5000);
  };

  const loadRows = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lemf', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!response.ok) throw new Error('Failed to load Lemf records');
      const data = await response.json() as LemfRecord[];
      setRows(data);
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'display' || hash === 'create' || hash === 'details' || hash === 'edit' || hash === 'home') {
        setActivePage(hash as PageKey);
      } else {
        setActivePage('home');
      }
    };

    if (isLoggedIn) {
      loadRows();
    }
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [isLoggedIn]);

  const handleLogin = async (username: string, pass: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });

      if (!response.ok) return false;
      const data = await response.json();
      if (data.status === 'success') {
        setIsLoggedIn(true);
        setUser(username);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('token', data.token);
        setToast({ message: `Welcome, ${username}! Login successful.`, type: 'success' });
        setTimeout(() => setToast(null), 3000);
        navigateTo('home');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log(`${user} logged out successfully`);
    setUser('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    setToast({ message: 'Logged out successfully.', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lemf/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!response.ok) throw new Error('Delete failed');
      setRows((current) => current.filter((row) => row.id !== id));
      setToast({ message: 'Record deleted successfully.', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(null);
      }
      navigateTo('display');
    } catch {
      setToast({ message: 'Failed to delete record.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleUpdate = async (updatedForm: LemfRecord) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lemf/${updatedForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedForm),
      });
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!response.ok) throw new Error('Failed to update');
      const updated = await response.json() as LemfRecord;
      setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      setSelectedRecord(updated);
      setToast({ message: `Successfully updated entry "${updated.name}"!`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
      navigateTo('display');
    } catch {
      setToast({ message: 'Failed to update record.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    if (!trimmed) {
      navigateTo('home');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lemf', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!response.ok) throw new Error('Failed to load Lemf records');
      const data = await response.json() as LemfRecord[];
      setRows(data);

      const matched = data.find(row => row.name.toLowerCase() === trimmed.toLowerCase());
      if (matched) {
        setSelectedRecord(matched);
        navigateTo('details');
      } else {
        setForm({
          ...emptyForm,
          name: trimmed,
        });
        navigateTo('create');
      }
    } catch {
      const matched = rows.find(row => row.name.toLowerCase() === trimmed.toLowerCase());
      if (matched) {
        setSelectedRecord(matched);
        navigateTo('details');
      } else {
        setForm({
          ...emptyForm,
          name: trimmed,
        });
        navigateTo('create');
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lemf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          assignedTo: form.assignedTo,
          notes: form.notes,
          status: form.status,
        }),
      });
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!response.ok) throw new Error('Failed to save');
      const saved = await response.json() as LemfRecord;
      setRows((current) => [saved, ...current]);
      setSelectedRecord(saved);
      setMessage(`Saved ${saved.name} to MySQL.`);
      setToast({ message: `Successfully created entry "${saved.name}"!`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
      setForm(emptyForm);
      navigateTo('details');
    } catch {
      setMessage('Save failed. Check the backend and MySQL connection.');
      setToast({ message: 'Save failed. Check the backend and MySQL connection.', type: 'error' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Login onLogin={handleLogin} />
        {toast && (
          <div className={`toast-notification toast-${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <p className="eyebrow">Logged in as: {user}</p>
          <h1>LEMF MANAGEMENT PORTAL</h1>
        </div>
        <div className="topbar-actions">
          <a href="#display" className="text-link" onClick={(event) => { event.preventDefault(); navigateTo('display'); }}>
            Display All
          </a>
          <button className="primary-btn" onClick={() => navigateTo('create')}>
            Create New
          </button>

          <button className="primary-btn" onClick={() => navigateTo('home')}>
            Home
          </button>

          <button className="secondary-btn" onClick={handleLogout} style={{ background: '#f1f5f9', color: '#475569' }}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-panel">
        {activePage === 'home' && (
          <Home
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            handleSearch={handleSearch}
            message={message}
          />
        )}

        {activePage === 'display' && (
          <DisplayLemf
            rows={rows}
            onEdit={(record) => {
              setEditRecord(record);
              navigateTo('edit');
            }}
            onDelete={handleDelete}
          />
        )}

        {activePage === 'create' && (
          <CreateLemf
            form={form}
            setForm={setForm}
            handleSubmit={handleSubmit}
            navigateTo={navigateTo}
          />
        )}

        {activePage === 'details' && (
          <Details selectedRecord={selectedRecord} />
        )}

        {activePage === 'edit' && editRecord && (
          <EditLemf
            record={editRecord}
            handleUpdate={handleUpdate}
            navigateTo={navigateTo}
          />
        )}
      </main>
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
