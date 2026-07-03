import { useEffect, useState } from 'react';
import type { ConnectionCheckResponse } from './types';

export default function App() {
  const [data, setData] = useState<ConnectionCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/check')
      .then((res) => {
        if (!res.ok) throw new Error('Network response failure');
        return res.json();
      })
      .then((data: ConnectionCheckResponse) => setData(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Technology Stack Compatibility Check</h1>
      <hr />
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!data && !error && <p>Probing stack layers...</p>}
      
      {data && (
        <div>
          <p><strong>Frontend Status:</strong> Active (React + TypeScript)</p>
          <p><strong>Proxy Routing:</strong> Functional (NGINX)</p>
          <p><strong>Backend API Connection:</strong> {data.status} (Spring Boot + DTO)</p>
          <p><strong>Target Database Engine:</strong> {data.dbVersion} (MySQL)</p>
          <p><strong>Payload Timestamp:</strong> {new Date(data.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
