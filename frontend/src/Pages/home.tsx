import React from 'react';

interface HomeProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  handleSearch: (event: React.FormEvent<HTMLFormElement>) => void;
  message: string;
}

export default function Home({
  searchValue,
  setSearchValue,
  handleSearch,
  message,
}: HomeProps) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Home</p>
          <h2>Select Lemf</h2>
        </div>
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
  );
}
