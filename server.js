const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Debug: show directory structure
app.get('/debug', (req, res) => {
  const root = __dirname;
  let result = { root, files: [] };
  try {
    result.files = fs.readdirSync(root);
    result.files.forEach((f, i) => {
      try {
        const sub = fs.readdirSync(path.join(root, f));
        result.files[i] = f + '/ -> ' + sub.join(', ');
      } catch(e) {}
    });
  } catch(e) { result.error = e.message; }
  res.json(result);
});

// Load data
let DATA = [];
const attempts = [
  path.join(__dirname, 'Data', 'Sports.json'),
  path.join(__dirname, 'Data', 'sports.json'),
  path.join(__dirname, 'data', 'Sports.json'),
  path.join(__dirname, 'data', 'sports.json')
];
for (const p of attempts) {
  try {
    DATA = JSON.parse(fs.readFileSync(p, 'utf8'));
    console.log('Loaded from:', p, '- games:', DATA.length);
    break;
  } catch(e) {
    console.log('Failed:', p, e.message);
  }
}

app.get('/v4/sports', (req, res) => {
  const seen = {};
  const sports = [];
  DATA.forEach(g => {
    if (!seen[g.sport_key]) {
      seen[g.sport_key] = true;
      sports.push({ key: g.sport_key, group: g.sport_group, title: g.sport_title, description: g.sport_title, active: true, has_outrights: false });
    }
  });
  res.json(sports);
});

app.get('/v4/sports/:sportKey/odds', (req, res) => {
  const { sportKey } = req.params;
  const games = DATA.filter(g => g.sport_key === sportKey || g.sport_group === sportKey);
  res.json(games);
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', games: DATA.length });
});

app.listen(PORT, () => console.log('Server on port', PORT));
