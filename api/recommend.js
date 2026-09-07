function localRecommendations(query, products) {
const text = query.toLowerCase();

const scored = products.map((product) => {
let score = product.rating;
const reasons = [];

// Budget
const priceMatch = text.match(
  /(?:under|below|less than)\s*\$?(\d+)/i
);

if (priceMatch) {
  const maxPrice = Number(priceMatch[1]);

  if (product.price <= maxPrice) {
    score += 10;
    reasons.push(`within your $${maxPrice} budget`);
  } else {
    score -= 20;
  }
}

const features = product.features.map((f) =>
  f.toLowerCase()
);

// Camera
if (
  text.includes("camera") ||
  text.includes("photography") ||
  text.includes("photo")
) {
  if (features.some((f) => f.includes("camera"))) {
    score += 6;
    reasons.push("good camera");
  }
}

// Battery
if (
  text.includes("battery") ||
  text.includes("battery life")
) {
  if (features.some((f) => f.includes("battery"))) {
    score += 6;
    reasons.push("long battery life");
  }
}

// Fast charging
if (
  text.includes("fast charging") ||
  text.includes("fast charge")
) {
  if (features.some((f) => f.includes("fast charging"))) {
    score += 6;
    reasons.push("fast charging");
  }
}

// Performance
if (
  text.includes("performance") ||
  text.includes("powerful") ||
  text.includes("processor")
) {
  if (
    features.some(
      (f) =>
        f.includes("performance") ||
        f.includes("processor")
    )
  ) {
    score += 6;
    reasons.push("strong performance");
  }
}

return {
  productId: product.id,
  score,
  reason:
    reasons.length > 0
      ? `Recommended because it has ${reasons.join(" and ")}.`
      : "Good overall match for your requirements.",
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
res.setHeader("Content-Type", "application/json");

if (req.method !== "POST") {
return res.status(405).json({
error: "Method not allowed",
});
}

try {
const { query, products } = req.body || {};


if (!query || !Array.isArray(products)) {
  return res.status(400).json({
    error: "Query and products are required",
  });
}

/*
 * Try OpenAI first.
 */
if (process.env.OPENAI_API_KEY) {
  try {
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: [
            {
              role: "system",
              content:
                "You are a product recommendation assistant. Only recommend products from the provided catalogue. Return JSON only.",
            },
            {
              role: "user",
              content: `


User request:
${query}

Product catalogue:
${JSON.stringify(products)}

Return at most 3 recommendations.

Return exactly this JSON structure:
{
"recommendations": [
{
"productId": 1,
"reason": "short reason"
}
]
}
`,
},
],
}),
}
);

    /*
     * OpenAI returned an error such as 429.
     * Use local fallback instead of failing the application.
     */
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();

      console.error(
        "OpenAI API error:",
        openAIResponse.status,
        errorText
      );

      const fallback = localRecommendations(
        query,
        products
      );

      return res.status(200).json({
        recommendations: fallback,
        source: "fallback",
        message:
          "AI service is unavailable. Showing catalogue-based recommendations.",
      });
    }

    const data = await openAIResponse.json();

    /*
     * Extract text returned by the Responses API.
     */
    const outputText =
      data.output_text ||
      data.output
        ?.flatMap((item) => item.content || [])
        ?.map((item) => item.text || "")
        ?.join("");

    if (!outputText) {
      throw new Error("OpenAI returned no text");
    }

    /*
     * Remove markdown code fences if the model adds them.
     */
    const cleanedText = outputText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const result = JSON.parse(cleanedText);

    /*
     * Validate every AI-generated product ID.
     */
    const validated = (result.recommendations || [])
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
            "Recommended based on your preferences.",
        };
      })
      .filter(Boolean)
      .slice(0, 3);

    return res.status(200).json({
      recommendations: validated,
      source: "openai",
    });
  } catch (openAIError) {
    console.error(
      "OpenAI processing error:",
      openAIError
    );

    /*
     * Any OpenAI failure falls back to local matching.
     */
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
}

/*
 * No API key configured.
 */
const fallback = localRecommendations(
  query,
  products
);

return res.status(200).json({
  recommendations: fallback,
  source: "fallback",
  message:
    "OpenAI API key is not configured. Showing catalogue-based recommendations.",
});


} catch (error) {
console.error("Server error:", error);


/*
 * Even unexpected errors return JSON.
 */
return res.status(500).json({
  error: "Recommendation service failed",
  recommendations: [],
});


}
}
