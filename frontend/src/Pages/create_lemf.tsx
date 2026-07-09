import React from 'react';

interface FormState {
  name: string;
  category: string;
  assignedTo: string;
  notes: string;
  status: string;
}

interface CreateLemfProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  navigateTo: (page: 'home' | 'display' | 'create' | 'details') => void;
}

export default function CreateLemf({
  form,
  setForm,
  handleSubmit,
  navigateTo,
}: CreateLemfProps) {
  return (
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
          <button className="secondary-btn" type="button" onClick={() => navigateTo('home')}>
            Back
          </button>
          <button className="primary-btn" type="submit">
            Save
          </button>
        </div>
      </form>
    </section>
  );
}
