import type { LemfRecord } from '../types';

interface DetailsProps {
  selectedRecord: LemfRecord | null;
}

export default function Details({ selectedRecord }: DetailsProps) {
  return (
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
            <span>Name</span>
            <strong>{selectedRecord.name}</strong>
          </div>
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
  );
}
