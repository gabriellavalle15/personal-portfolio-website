import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/recipes", async (req, res) => {
  const { q, diet, cuisine } = req.query;

  const url = new URL("https://api.edamam.com/search");
  url.searchParams.append("q", q);
  url.searchParams.append("app_id", "e2e9cd56");
  url.searchParams.append("app_key", "8c497b89cf979fc14139f9743742d99a");
  url.searchParams.append("to", "20");

  if (diet) url.searchParams.append("diet", diet);
  if (cuisine) url.searchParams.append("cuisineType", cuisine);

  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("Server running on port 3000"));