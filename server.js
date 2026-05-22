const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load data once at startup
let DATA = [];
try {
  DATA = require('./Data/sports.json');
  console.log('Loaded', DATA.length, 'games');
} catch(e) {
  console.error('Error loading sports.json:', e.message);
}

// GET /v4/sports
app.get('/v4/sports', (req, res) => {
  try {
    const seen = {};
    const sports = [];
    DATA.forEach(g => {
      if (!seen[g.sport_key]) {
        seen[g.sport_key] = true;
        sports.push({
          key: g.sport_key,
          group: g.sport_group,
          title: g.sport_title,
          description: g.sport_title,
          active: true,
          has_outrights: false
        });
      }
    });
    res.json(sports);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /v4/sports/:sportKey/odds
app.get('/v4/sports/:sportKey/odds', (req, res) => {
  try {
    const { sportKey } = req.params;
    const games = DATA.filter(g =>
      g.sport_key === sportKey || g.sport_group === sportKey
    );
    res.json(games);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', games: DATA.length });
});

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
