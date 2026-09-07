import { useState } from "react";
import products from "./data/products";
import "./index.css";

const suggestions = [
  "I want a phone under $400 with a good camera and long battery",
  "I want the best phone for photography under $500",
  "I need fast charging and strong performance",
];

function App() {
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRecommendations = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setRecommendations([]);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          products,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to get recommendations"
        );
      }

      const matchedProducts = (data.recommendations || [])
        .map((recommendation) => {
          const product = products.find(
            (item) => item.id === recommendation.productId
          );

          if (!product) return null;

          return {
            ...product,
            reason:
              recommendation.reason ||
              "Recommended based on your preferences.",
          };
        })
        .filter(Boolean);

      setRecommendations(matchedProducts);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong while getting recommendations."
      );
    } finally {
      setLoading(false);
    }
  };

  const useSuggestion = (suggestion) => {
    setQuery(suggestion);
    setError("");
  };

  return (
    <div className="app">
      {/* ================= HEADER ================= */}

      <header className="hero">
        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        <nav className="navbar">
          <div className="brand">
            <div className="brand-icon">✦</div>
            <span>NexaPick</span>
          </div>

          <div className="ai-badge">
            <span>✦</span>
            AI Powered
          </div>
        </nav>

        <div className="hero-content">
          <div className="eyebrow">
            SMART PRODUCT DISCOVERY
          </div>

          <h1>
            Find the right product
            <br />
            <span>with AI.</span>
          </h1>

          <p className="hero-description">
            Describe what you need in natural language. The AI
            understands your preferences
            <br className="desktop-break" />
            and recommends the best matches from our catalogue.
          </p>

          {/* SEARCH */}

          <div className="search-wrapper">
            <div className="search-icon">✦</div>

            <input
              type="text"
              value={query}
              placeholder="e.g. I want a phone under $500 with a good camera"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  getRecommendations();
                }
              }}
            />

            <button
              className="recommend-button"
              onClick={getRecommendations}
              disabled={loading || !query.trim()}
            >
              {loading ? "Finding..." : "Get Recommendations"}
              {!loading && <span>→</span>}
            </button>
          </div>

          {/* SUGGESTIONS */}

          <div className="suggestions">
            <span className="try-label">Try:</span>

            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                className="suggestion-chip"
                onClick={() => useSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {error && (
            <div className="error-message">
              <span>⚠</span>
              {error}
            </div>
          )}
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main>
        {/* AI RECOMMENDATIONS */}

        {recommendations.length > 0 && (
          <section className="catalogue-panel recommendations-panel">
            <div className="section-header">
              <div>
                <div className="section-label">
                  AI MATCHES
                </div>

                <h2>Recommended for you</h2>

                <p>
                  Based on the preferences you provided.
                </p>
              </div>

              <span className="product-count">
                {recommendations.length} matches
              </span>
            </div>

            <div className="product-grid">
              {recommendations.map((product) => (
                <article
                  className="product-card recommendation-card"
                  key={product.id}
                >
                  <div className="product-image-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                    />

                    <div className="match-badge">
                      AI Match
                    </div>
                  </div>

                  <div className="product-info">
                    <div className="product-category">
                      {product.category}
                    </div>

                    <h3>{product.name}</h3>

                    <div className="product-meta">
                      <span className="product-price">
                        ${product.price}
                      </span>

                      <span className="rating">
                        ★ {product.rating}
                      </span>
                    </div>

                    <div className="reason-box">
                      <span>✦</span>
                      <p>{product.reason}</p>
                    </div>

                    <div className="features">
                      {product.features
                        .slice(0, 3)
                        .map((feature) => (
                          <span key={feature}>
                            {feature}
                          </span>
                        ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* AVAILABLE PRODUCTS */}

        <section className="catalogue-panel">
          <div className="section-header">
            <div>
              <div className="section-label">
                LOCAL CATALOGUE
              </div>

              <h2>Available Products</h2>

              <p>
                AI recommendations are always selected from
                these products.
              </p>
            </div>

            <span className="product-count">
              {products.length} products
            </span>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <article
                className="product-card"
                key={product.id}
              >
                <div className="product-image-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                  />
                </div>

                <div className="product-info">
                  <div className="product-category">
                    {product.category}
                  </div>

                  <h3>{product.name}</h3>

                  <div className="product-meta">
                    <span className="product-price">
                      ${product.price}
                    </span>

                    <span className="rating">
                      ★ {product.rating}
                    </span>
                  </div>

                  <div className="features">
                    {product.features
                      .slice(0, 3)
                      .map((feature) => (
                        <span key={feature}>
                          {feature}
                        </span>
                      ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <span>NexaPick</span>
        <span>AI-powered product discovery</span>
      </footer>
    </div>
  );
}

export default App;