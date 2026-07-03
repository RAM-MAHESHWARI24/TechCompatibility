import { useEffect, useState } from 'react';
import './App.css';
import type { LemfRecord } from './types';

type PageKey = 'home' | 'display' | 'create' | 'details';

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

  const navigateTo = (page: PageKey) => {
    setActivePage(page);
    window.history.pushState({}, '', `#${page}`);
  };

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'display' || hash === 'create' || hash === 'details' || hash === 'home') {
        setActivePage(hash as PageKey);
      } else {
        setActivePage('home');
      }
    };

    const loadRows = async () => {
      try {
        const response = await fetch('/api/lemf');
        if (!response.ok) throw new Error('Failed to load Lemf records');
        const data = await response.json() as LemfRecord[];
        setRows(data);
      } catch {
        setRows([]);
      }
    };

    syncFromHash();
    loadRows();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchValue.trim().toLowerCase();
    if (trimmed && trimmed.includes('detail')) {
      navigateTo('details');
    } else if (trimmed) {
      navigateTo('create');
    } else {
      navigateTo('home');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/lemf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          assignedTo: form.assignedTo,
          notes: form.notes,
          status: form.status,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      const saved = await response.json() as LemfRecord;
      setRows((current) => [saved, ...current]);
      setSelectedRecord(saved);
      setMessage(`Saved ${saved.name} to MySQL.`);
      setForm(emptyForm);
      navigateTo('details');
    } catch {
      setMessage('Save failed. Check the backend and MySQL connection.');
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <p className="eyebrow">Lemf Management</p>
          <h1>React port of Lemf page</h1>
          <p className="subtitle">This replica keeps the original flow and routes to dummy pages with simple text.</p>
        </div>
        <div className="topbar-actions">
          <a href="#display" className="text-link" onClick={(event) => { event.preventDefault(); navigateTo('display'); }}>
            Display All
          </a>
          <button className="primary-btn" onClick={() => navigateTo('create')}>
            Create New
          </button>
        </div>
      </header>

      <main className="main-panel">
        {activePage === 'home' && (
          <section className="panel-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Home</p>
                <h2>Select Lemf</h2>
              </div>
              <span className="chip">Dummy routing</span>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <label htmlFor="sName">Lemf Name</label>
              <div className="search-row">
                <input
                  id="sName"
                  name="sName"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Type a name"
                />
                <button className="primary-btn" type="submit">
                  Go
                </button>
              </div>
            </form>

            <div className="info-box">
              <p>Enter a name to go to a dummy details page or create page.</p>
              <p className="hint">Use the buttons above to open the display or creation flow directly.</p>
              {message && <p className="hint success">{message}</p>}
            </div>
          </section>
        )}

        {activePage === 'display' && (
          <section className="panel-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Display</p>
                <h2>Lemf_display page</h2>
              </div>
              <span className="chip">Dummy page</span>
            </div>

            <p className="page-text">This page loads rows from the MySQL-backed Lemf API.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.status}</td>
                    <td>{row.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activePage === 'create' && (
          <section className="panel-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Create</p>
                <h2>Lemf_create page</h2>
              </div>
              <span className="chip">Dummy page</span>
            </div>

            <p className="page-text">This page saves a new Lemf record to the MySQL-backed API.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Lemf Name
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                </label>
                <label>
                  Category
                  <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
                </label>
                <label>
                  Assigned To
                  <input value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} />
                </label>
                <label>
                  Status
                  <input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} />
                </label>
                <label>
                  Notes
                  <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                </label>
              </div>
              <div className="actions">
                <button className="secondary-btn" type="button" onClick={() => navigateTo('home')}>Back</button>
                <button className="primary-btn" type="submit">Save</button>
              </div>
            </form>
          </section>
        )}

        {activePage === 'details' && (
          <section className="panel-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Details</p>
                <h2>Lemf_details page</h2>
              </div>
              <span className="chip">Dummy page</span>
            </div>

            <p className="page-text">This page shows the last record created through the MySQL-backed API.</p>
            {selectedRecord ? (
              <div className="details-grid">
                <div className="detail-box">
                  <span>Request ID</span>
                  <strong>{selectedRecord.id}</strong>
                </div>
                <div className="detail-box">
                  <span>Status</span>
                  <strong>{selectedRecord.status}</strong>
                </div>
                <div className="detail-box">
                  <span>Owner</span>
                  <strong>{selectedRecord.assignedTo}</strong>
                </div>
                <div className="detail-box">
                  <span>Category</span>
                  <strong>{selectedRecord.category}</strong>
                </div>
              </div>
            ) : (
              <p className="page-text">No record selected yet. Save one from the create page.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
