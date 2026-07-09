import type { LemfRecord } from '../types';

interface DisplayLemfProps {
  rows: LemfRecord[];
  onEdit: (record: LemfRecord) => void;
  onDelete: (id: number) => void;
}

export default function DisplayLemf({ rows, onEdit, onDelete }: DisplayLemfProps) {
  return (
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.status}</td>
              <td>{row.assignedTo}</td>
              <td>
                <button
                  className="primary-btn"
                  onClick={() => onEdit(row)}
                  style={{ marginRight: '8px', padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  Edit
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => onDelete(row.id)}
                  style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#fee2e2', color: '#ef4444' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
