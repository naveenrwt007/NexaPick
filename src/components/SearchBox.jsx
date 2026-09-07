function SearchBox({ query, setQuery, onSubmit, loading }) {
  return (
    <form
      className="search-box"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="text"
        aria-label="Product preferences"
        placeholder="e.g. I want a phone under $500 with a good camera"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        disabled={loading}
      />

      <button type="submit" disabled={loading || !query.trim()}>
        {loading ? "Finding..." : "Get Recommendations"}
      </button>
    </form>
  );
}

export default SearchBox;