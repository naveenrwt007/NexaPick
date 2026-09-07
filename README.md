# NexaPick — AI Product Recommender

A simple AI-powered product recommendation system built for my AI Engineer assessment.

The idea is simple: instead of selecting filters manually, the user can describe what they want in normal language, and AI recommends the best matching products from my existing product list.

For example:

> "I want a phone under $500 with a good camera"

The AI understands the requirement and returns matching products from the catalogue.

## What I Built

* React + Vite frontend
* 6-product smartphone catalogue
* Natural language search
* OpenAI API integration
* Vercel serverless API
* Server-side API key
* AI-generated product recommendations
* Product ID validation
* Recommendation reasons
* Loading and error handling
* Responsive UI

## How It Works

The basic flow is:

```text
User
  ↓
React Frontend
  ↓
/api/recommend
  ↓
OpenAI
  ↓
Product IDs + Reasons
  ↓
Validate IDs
  ↓
Find products from local catalogue
  ↓
Show recommendations
```

I don't let the AI directly create or display product information.

Instead, the AI returns the IDs of products it thinks are relevant. My backend checks those IDs against the actual product catalogue before sending anything back to the frontend.

This means the application only displays products that actually exist in my catalogue.

## Example

User enters:

```text
I want a phone under $400 with a good camera
```

The backend sends the user's request along with the available products to OpenAI.

The AI might return something like:

```json
{
  "recommendations": [
    {
      "productId": 5,
      "reason": "Good camera, AMOLED display and long battery life at $349."
    },
    {
      "productId": 6,
      "reason": "Affordable option with a 200MP camera and fast charging."
    }
  ]
}
```

The backend then finds those products from my local catalogue and displays them in the UI.

## Tech Stack

**Frontend**

* React
* Vite
* CSS

**Backend**

* Vercel Serverless Function
* Node.js

**AI**

* OpenAI API

**Deployment**

* Vercel

**Code**

* GitHub

## Project Structure

```text
NexaPick/
│
├── api/
│   └── recommend.js
│
├── src/
│   ├── components/
│   │   ├── ProductCard.jsx
│   │   └── SearchBox.jsx
│   │
│   ├── data/
│   │   └── products.js
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vercel.json
├── vite.config.js
└── README.md
```

## Getting Started

### 1. Clone the project

```bash
git clone https://github.com/naveenrwt007/NexaPick.git
cd NexaPick
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add OpenAI API Key

Create a `.env.local` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Keep the API key private. It should never be committed to GitHub.

### 4. Run the project

For the frontend:

```bash
npm run dev
```

For testing the Vercel API function locally:

```bash
vercel dev
```

Then open the local URL shown in the terminal.

## Try These Prompts

You can test the recommender with prompts like:

```text
I want a phone under $500 with a good camera
```

```text
I need a phone with long battery life
```

```text
I want the best phone for photography
```

```text
I want something under $400
```

```text
I need fast charging and strong performance
```

## API

The frontend sends the user's preference to:

```text
POST /api/recommend
```

The request contains the user's query and product catalogue.

The backend sends this information to OpenAI and asks it to return only valid product IDs and a short explanation for each recommendation.

Before returning the result, the backend checks that every returned ID exists in the catalogue.

## Why I Used AI

The main reason for using AI is to understand natural-language preferences.

A normal filter might require the user to separately select:

```text
Price < $500
Camera = Good
Battery = Long
```

With AI, the user can simply write:

```text
I want a phone under $500 with a good camera and long battery
```

The AI understands the request and maps it to the products available in the application.

## Security

The OpenAI API key is kept on the server side.

The React frontend never receives the API key.

For local development, the key is stored in `.env.local`, which is ignored by Git.

For Vercel deployment, the key is added as an environment variable.

## Deployment

I deployed the project using Vercel.

For a Vercel deployment:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the environment variable:

```text
OPENAI_API_KEY
```

4. Deploy the project.

Vercel automatically handles the `/api/recommend` serverless function.

## What I Learned

While building this project, I worked with:

* React state and UI handling
* API integration
* Serverless functions
* OpenAI API
* Environment variables
* Product filtering
* Basic AI prompt design
* Git and GitHub
* Vercel deployment

The project is intentionally small, but it demonstrates the complete flow from a user's natural-language request to an AI-generated recommendation and finally displaying the real product data in the frontend.
