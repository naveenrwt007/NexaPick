import { useState } from "react";
import products from "./data/products";
import ProductCard from "./components/ProductCard";
import SearchBox from "./components/SearchBox";
import "./index.css";

const exampleQueries = [
  "I want a phone under $400 with a good camera and long battery",
  "I want the best phone for photography under $500",
  "I need fast charging and strong performance",
];

function App() {
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getRecommendations() {
    if (!query.trim()) {
      setError("Tell us what you want in a phone.");
      return;
    }

    setLoading(true);
    setError("");
    setRecommendations([]);
    setSummary("");

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const contentType = response.headers.get("content-type") || "";
      const raw = await response.text();

      if (!contentType.includes("application/json")) {
        throw new Error(
          `The API did not return JSON (HTTP ${response.status}). Check your Vercel API route and environment variable.`
        );
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("The API returned invalid JSON.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Recommendation request failed.");
      }

      setRecommendations(data.recommendations || []);
      setSummary(data.summary || "");

      if (!data.recommendations?.length) {
        setSummary(
          "No strong match was found. Try a different budget or feature."
        );
      }
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function useExample(example) {
    setQuery(example);
    setError("");
  }

  return (
    <div className="app">
      <header className="hero">
        <nav className="nav">
          <div className="brand">
            <span className="brand-mark">✦</span>
            AI Recommender
          </div>
          <span className="nav-badge">OpenAI Powered</span>
        </nav>

        <div className="hero-content">
          <div className="eyebrow">SMART PRODUCT DISCOVERY</div>
          <h1>
            Find the right product
            <span> with AI.</span>
          </h1>
          <p>
            Describe what you need in natural language. The AI understands
            your preferences and recommends the best matches from our catalogue.
          </p>

          <SearchBox
            query={query}
            setQuery={setQuery}
            onSubmit={getRecommendations}
            loading={loading}
          />

          <div className="examples">
            <span>Try:</span>
            {exampleQueries.map((example) => (
              <button key={example} onClick={() => useExample(example)}>
                {example}
              </button>
            ))}
          </div>

          {error && <div className="error-message">⚠ {error}</div>}
        </div>
      </header>

      <main className="container">
        {loading && (
          <section className="results-panel loading-panel">
            <div className="spinner" />
            <div>
              <h2>Finding your best matches...</h2>
              <p>AI is comparing your request with the product catalogue.</p>
            </div>
          </section>
        )}

        {!loading && recommendations.length > 0 && (
          <section className="results-panel">
            <div className="section-heading">
              <div>
                <span className="section-kicker">PERSONALIZED FOR YOU</span>
                <h2>AI Recommendations</h2>
                <p>{summary}</p>
              </div>
              <span className="result-count">
                {recommendations.length} match
                {recommendations.length !== 1 ? "es" : ""}
              </span>
            </div>

            <div className="product-grid">
              {recommendations.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  recommended
                />
              ))}
            </div>
          </section>
        )}

        <section className="catalogue-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">LOCAL CATALOGUE</span>
              <h2>Available Products</h2>
              <p>
                AI recommendations are always selected from these products.
              </p>
            </div>
            <span className="catalogue-count">{products.length} products</span>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>
          AI Product Recommender • React + Vite + OpenAI + Vercel
        </p>
      </footer>
    </div>
  );
}

export default App;