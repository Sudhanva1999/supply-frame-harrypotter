const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
    try {
        res.render('index');
    } catch (error) {
      console.error('Error fetching Pokemon data:', error);
      res.status(500).send('Internal Server Error');
    }
  });

// Route for fetching Pokemon data
app.get('/list', async (req, res) => {
  try {
    // Fetch data from PokeAPI
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon/');
    const pokemonList = response.data.results;

    // Render the index template with the fetched data
    res.render('list', { pokemonList });
  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
