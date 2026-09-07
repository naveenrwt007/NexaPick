function ProductCard({ product, recommended = false }) {
  return (
    <article className={`product-card ${recommended ? "recommended-card" : ""}`}>
      {recommended && <div className="ai-tag">✨ AI Match</div>}

      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-content">
        <span className="category">{product.category}</span>
        <h3>{product.name}</h3>

        <div className="product-meta">
          <span className="rating">★ {product.rating}</span>
          <span className="price">${product.price}</span>
        </div>

        {product.reason && (
          <div className="reason">
            <strong>Why AI recommends it</strong>
            <p>{product.reason}</p>
          </div>
        )}

        <div className="features">
          {product.features.slice(0, 4).map((feature) => (
            <span key={feature}>{feature}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;