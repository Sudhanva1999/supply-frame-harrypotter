const express = require('express');
const axios = require('axios');
const path = require('path');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const cache = new NodeCache({ stdTTL: 3600 });


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


app.get('/list', async (req, res) => {
  try {
    let pokemonList = [];

    const page = parseInt(req.query.page) || 1;
    const pageSize = 20;
    const startIdx = (page - 1) * pageSize + 1;
    const endIdx = startIdx + pageSize - 1;

   
    const cacheKey = `${startIdx}-${endIdx}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      pokemonList = cachedData;
    } else {
      
      for (let i = startIdx; i <= endIdx; i++) {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}/`);
        const pokemonDetails = response.data;
        pokemonList.push(pokemonDetails);
      }
      
      cache.set(cacheKey, pokemonList);
    }
    res.render('list', { pokemonList });

  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/pokemon', async (req, res) => {
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.query.pokemonId}/`);
    const pokemon = response.data;
    res.render('pokemon', { pokemon });

  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
