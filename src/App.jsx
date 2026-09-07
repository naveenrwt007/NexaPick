import { useState } from "react";
import products from "./data/products";
import "./index.css";

function App() {
const [query, setQuery] = useState("");
const [recommendations, setRecommendations] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const getRecommendations = async () => {
if (!query.trim()) {
return;
}

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

  const aiRecommendations =
    data.recommendations || [];

  const matchedProducts = aiRecommendations
    .map((recommendation) => {
      const product = products.find(
        (item) =>
          item.id === recommendation.productId
      );

      if (!product) {
        return null;
      }

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

return ( <div className="app"> <header className="hero"> <div className="badge">✨ AI Powered</div>

    <h1>SMART PRODUCT DISCOVERY</h1>

    <h2>Find the right product with AI.</h2>

    <p>
      Describe what you need in natural language. The AI
      understands your preferences and recommends the best
      matches from our catalogue.
    </p>

    <div className="search-box">
      <input
        type="text"
        placeholder="e.g. I want a phone under $500 with a good camera"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            getRecommendations();
          }
        }}
      />

      <button
        onClick={getRecommendations}
        disabled={loading || !query.trim()}
      >
        {loading
          ? "Finding..."
          : "Get Recommendations"}
      </button>
    </div>

    <div className="try-text">
      <strong>Try:</strong>
      <span>
        I want a phone under $400 with a good camera and
        long battery
      </span>
      <span>
        I want the best phone for photography under $500
      </span>
      <span>
        I need fast charging and strong performance
      </span>
    </div>

    {error && (
      <div className="error-message">
        ⚠ {error}
      </div>
    )}
  </header>

  <main>
    {recommendations.length > 0 && (
      <section className="products-section recommendations-section">
        <div className="section-header">
          <div>
            <h2>AI Recommendations</h2>
            <p>
              Based on your preferences, these products
              are the best matches.
            </p>
          </div>

          <span className="product-count">
            {recommendations.length} Matches
          </span>
        </div>

        <div className="product-grid">
          {recommendations.map((product) => (
            <div
              className="product-card recommendation-card"
              key={product.id}
            >
              <img
                src={product.image}
                alt={product.name}
              />

              <div className="product-content">
                <span className="category">
                  {product.category}
                </span>

                <h3>{product.name}</h3>

                <div className="rating">
                  ⭐ {product.rating}
                </div>

                <div className="price">
                  ${product.price}
                </div>

                <div className="recommendation-reason">
                  <strong>Why this match:</strong>
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
            </div>
          ))}
        </div>
      </section>
    )}

    <section className="products-section">
      <div className="section-header">
        <div>
          <h2>Available Products</h2>
          <p>
            AI recommends products from this catalogue.
          </p>
        </div>

        <span className="product-count">
          {products.length} Products
        </span>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <div
            className="product-card"
            key={product.id}
          >
            <img
              src={product.image}
              alt={product.name}
            />

            <div className="product-content">
              <span className="category">
                {product.category}
              </span>

              <h3>{product.name}</h3>

              <div className="rating">
                ⭐ {product.rating}
              </div>

              <div className="price">
                ${product.price}
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
          </div>
        ))}
      </div>
    </section>
  </main>
</div>
);
}

export default App;
