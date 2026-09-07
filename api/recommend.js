import OpenAI from "openai";

const client = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

function localRecommendations(query, products) {
const text = query.toLowerCase();

const scored = products.map((product) => {
let score = 0;
const reasons = [];


// Price matching
const priceMatch = text.match(
  /(?:under|below|less than|within)\s*\$?(\d+)/i
);

if (priceMatch) {
  const maxPrice = Number(priceMatch[1]);

  if (product.price <= maxPrice) {
    score += 5;
    reasons.push(`Within your $${maxPrice} budget`);
  } else {
    score -= 10;
  }
}

// Camera / photography
if (
  text.includes("camera") ||
  text.includes("photography") ||
  text.includes("photo")
) {
  if (
    product.features.some((feature) =>
      feature.toLowerCase().includes("camera")
    )
  ) {
    score += 4;
    reasons.push("Good camera features");
  }
}

// Battery
if (
  text.includes("battery") ||
  text.includes("battery life")
) {
  if (
    product.features.some((feature) =>
      feature.toLowerCase().includes("battery")
    )
  ) {
    score += 4;
    reasons.push("Long battery life");
  }
}

// Fast charging
if (
  text.includes("fast charging") ||
  text.includes("fast charge")
) {
  if (
    product.features.some((feature) =>
      feature.toLowerCase().includes("fast charging")
    )
  ) {
    score += 4;
    reasons.push("Supports fast charging");
  }
}

// Performance
if (
  text.includes("performance") ||
  text.includes("powerful") ||
  text.includes("strong performance")
) {
  if (
    product.features.some((feature) => {
      const featureText = feature.toLowerCase();

      return (
        featureText.includes("performance") ||
        featureText.includes("processor")
      );
    })
  ) {
    score += 4;
    reasons.push("Strong performance");
  }
}

// Display
if (
  text.includes("display") ||
  text.includes("screen") ||
  text.includes("amoled") ||
  text.includes("oled")
) {
  if (
    product.features.some((feature) => {
      const featureText = feature.toLowerCase();

      return (
        featureText.includes("display") ||
        featureText.includes("amoled") ||
        featureText.includes("oled")
      );
    })
  ) {
    score += 2;
    reasons.push("Good display");
  }
}

// 5G
if (text.includes("5g")) {
  if (
    product.features.some((feature) =>
      feature.toLowerCase().includes("5g")
    )
  ) {
    score += 2;
    reasons.push("Supports 5G");
  }
}

// General quality fallback
score += product.rating;

return {
  productId: product.id,
  score,
  reason:
    reasons.length > 0
      ? reasons.slice(0, 2).join(" and ")
      : "Good overall match for your request",
};


});

return scored
.filter((item) => item.score > 0)
.sort((a, b) => b.score - a.score)
.slice(0, 3)
.map(({ productId, reason }) => ({
productId,
reason,
}));
}

export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({
error: "Method not allowed",
});
}

try {
const { query, products } = req.body;

```
if (!query || !products || !Array.isArray(products)) {
  return res.status(400).json({
    error: "Query and products are required",
  });
}

try {
  const prompt = `
```

You are an AI product recommendation assistant.

The user wants:
"${query}"

Here is the complete product catalogue:
${JSON.stringify(products, null, 2)}

Recommend the products that best match the user's request.

IMPORTANT RULES:

1. Only recommend products from the provided catalogue.
2. Never invent a product.
3. Use the product ID from the catalogue.
4. Recommend at most 3 products.
5. Give a short reason for every recommendation.
6. Return ONLY valid JSON.

Return exactly:

{
"recommendations": [
{
"productId": 1,
"reason": "Short explanation"
}
]
}
`;

```
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a precise product recommendation assistant. Always return valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  const result = JSON.parse(
    completion.choices[0].message.content
  );

  // Validate AI-generated product IDs
  const validatedRecommendations = (
    result.recommendations || []
  )
    .map((recommendation) => {
      const product = products.find(
        (p) => p.id === recommendation.productId
      );

      if (!product) {
        return null;
      }

      return {
        productId: product.id,
        reason:
          recommendation.reason ||
          "Recommended based on your preferences",
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  return res.status(200).json({
    recommendations: validatedRecommendations,
    source: "openai",
  });
} catch (aiError) {
  console.error("OpenAI unavailable:", aiError);

  // Fallback when OpenAI is unavailable,
  // including 429/no-credit errors.
  const fallback = localRecommendations(
    query,
    products
  );

  return res.status(200).json({
    recommendations: fallback,
    source: "fallback",
    message:
      "AI service is temporarily unavailable. Showing catalogue-based recommendations.",
  });
}
```

} catch (error) {
console.error("Recommendation error:", error);

```
return res.status(500).json({
  error: "Failed to generate recommendations",
});
```

}
}
