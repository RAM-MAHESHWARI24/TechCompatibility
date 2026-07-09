import React, { useState } from 'react';
import type { LemfRecord } from '../types';

interface EditLemfProps {
  record: LemfRecord;
  handleUpdate: (updatedRecord: LemfRecord) => Promise<void>;
  navigateTo: (page: 'home' | 'display' | 'create' | 'details') => void;
}

export default function EditLemf({ record, handleUpdate, navigateTo }: EditLemfProps) {
  const [form, setForm] = useState({
    id: record.id,
    name: record.name,
    category: record.category,
    assignedTo: record.assignedTo,
    notes: record.notes,
    status: record.status,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleUpdate(form);
  };

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Modify</p>
          <h2>Edit Lemf Entry</h2>
        </div>
        <span className="chip">ID: {record.id}</span>
      </div>

      <p className="page-text">Update the details of the Lemf record below.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Lemf Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label>
            Category
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            />
          </label>
          <label>
            Assigned To
            <input
              value={form.assignedTo}
              onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}
            />
          </label>
          <label>
            Status
            <input
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            />
          </label>
          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </label>
        </div>
        <div className="actions">
          <button className="secondary-btn" type="button" onClick={() => navigateTo('display')}>
            Cancel
          </button>
          <button className="primary-btn" type="submit">
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}
