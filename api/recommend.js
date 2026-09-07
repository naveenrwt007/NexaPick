import OpenAI from "openai";
import products from "../src/data/products.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function jsonResponse(res, status, body) {
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return jsonResponse(res, 200, {
      ok: true,
      message: "Recommendation API is running.",
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(res, 405, {
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return jsonResponse(res, 500, {
        error: "OPENAI_API_KEY is not configured.",
      });
    }

    const query = typeof req.body?.query === "string"
      ? req.body.query.trim()
      : "";

    if (!query) {
      return jsonResponse(res, 400, {
        error: "Please enter your product preferences.",
      });
    }

    const catalogue = products.map(({ id, name, category, price, rating, features }) => ({
      id,
      name,
      category,
      price,
      rating,
      features,
    }));

    const prompt = `
You are the recommendation engine for a small product catalogue.

USER REQUEST:
${query}

AVAILABLE PRODUCTS:
${JSON.stringify(catalogue, null, 2)}

TASK:
Choose up to 3 products that best match the user's request.

STRICT RULES:
- Only choose IDs from the AVAILABLE PRODUCTS list.
- Never invent a product, product ID, price, rating, or feature.
- Prefer products that satisfy explicit constraints such as budget and requested features.
- If several products match, rank the strongest matches first.
- If nothing is a perfect match, choose the closest available products.
- Return ONLY valid JSON. No markdown and no extra text.

JSON FORMAT:
{
  "recommendations": [
    {
      "productId": 1,
      "reason": "Short explanation based only on the catalogue."
    }
  ],
  "summary": "One short sentence explaining the overall recommendation."
}
`;

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: prompt,
    });

    const raw = (response.output_text || "").trim();

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error("The AI returned an invalid recommendation response.");
      }
      result = JSON.parse(match[0]);
    }

    const recommendations = Array.isArray(result.recommendations)
      ? result.recommendations
      : [];

    const safeRecommendations = recommendations
      .map((item) => {
        const productId = Number(item?.productId);
        const product = products.find((p) => p.id === productId);

        if (!product) return null;

        return {
          ...product,
          reason:
            typeof item?.reason === "string" && item.reason.trim()
              ? item.reason.trim()
              : "This product matches your stated preferences.",
        };
      })
      .filter(Boolean)
      .slice(0, 3);

    return jsonResponse(res, 200, {
      recommendations: safeRecommendations,
      summary:
        typeof result.summary === "string" && result.summary.trim()
          ? result.summary.trim()
          : "These products are the closest matches in the available catalogue.",
    });
  } catch (error) {
    console.error("Recommendation API error:", error);

    return jsonResponse(res, 500, {
      error:
        error?.message ||
        "Unable to get recommendations right now. Please try again.",
    });
  }
}