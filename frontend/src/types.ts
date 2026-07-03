export interface ConnectionCheckResponse {
  status: string;
  dbVersion: string;
  timestamp: number;
}

export interface LemfRecord {
  id: number;
  name: string;
  category: string;
  assignedTo: string;
  notes: string;
  status: string;
}
