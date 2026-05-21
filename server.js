const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load all sports data from data/sports.json
function getData() {
  const file = path.join(__dirname, 'data', 'sports.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// GET /v4/sports  — list all available sports (same as The Odds API)
app.get('/v4/sports', (req, res) => {
  const data = getData();
  const sports = [...new Set(data.map(g => g.sport_key))].map(key => {
    const sample = data.find(g => g.sport_key === key);
    return {
      key:         key,
      group:       sample.sport_group,
      title:       sample.sport_title,
      description: sample.sport_title,
      active:      true,
      has_outrights: false
    };
  });
  res.json(sports);
});

// GET /v4/sports/:sportKey/odds  — get odds for a sport (same as The Odds API)
app.get('/v4/sports/:sportKey/odds', (req, res) => {
  const { sportKey } = req.params;
  const data = getData();

  // Support group filtering (e.g. "soccer" matches all soccer_* keys)
  const games = data.filter(g =>
    g.sport_key === sportKey ||
    g.sport_group === sportKey
  );

  if (!games.length) {
    return res.json([]);
  }

  res.json(games);
});

app.get('/', (req, res) => {
  res.json({ message: 'API de Apuestas - Prueba. Compatible con The Odds API v4.' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
