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
app.use(express.static(__dirname + '/resources'));

function cacheMiddleware(req, res, next) {
    const cacheKey = req.originalUrl;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        res.send(cachedData);
    } else {
        res.sendResponse = res.send;
        res.send = (body) => {
            cache.set(cacheKey, body);
            res.sendResponse(body);
        };
        next();
    }
}

app.get('/', cacheMiddleware, async (req, res) => {
    try {
        res.render('index');
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/list', cacheMiddleware, async (req, res) => {
    try {
        let pokemonList = [];
        const page = parseInt(req.query.page) || 1;
        const pageSize = 20;
        const startIdx = (page - 1) * pageSize + 1;
        const endIdx = startIdx + pageSize - 1;
        const cacheKey = `${startIdx}-${endIdx}`;
        const currentPage = page;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            pokemonList = cachedData;
        } else {
            for (let i = startIdx; i <= endIdx; i++) {
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}/`);
                const pokemonDetails = response.data;
                pokemonDetails.pokemonMainImg = pokemonDetails.sprites.other.showdown.front_default || pokemonDetails.sprites.other.home.front_default;
                pokemonList.push(pokemonDetails);
            }
            cache.set(cacheKey, pokemonList);
        }
        res.render('list', { pokemonList, currentPage });
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
        res.status(500).send('Internal Server Error');
    }
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.get('/pokemon', cacheMiddleware, async (req, res) => {
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.query.pokemonId}/`);
        const pokemon = response.data;
        pokemon.pokemonMainImg = pokemon.sprites.other.showdown.front_default || pokemon.sprites.other.home.front_default;

        const typeResponse = await axios.get(pokemon.types[0].type.url);
      
        const allSamePokemons = shuffleArray(typeResponse.data.pokemon).slice(0, 8);
        const pokemonDataArray = [];

        for (const samePokemon of allSamePokemons) {
            if (samePokemon.pokemon.name !== pokemon.name) {
                const pokemonResponse = await axios.get(samePokemon.pokemon.url);
                const tempPokemon = pokemonResponse.data;
                tempPokemon.pokemonMainImg = tempPokemon.sprites.other.showdown.front_default || tempPokemon.sprites.other.home.front_default;
                pokemonDataArray.push(pokemonResponse.data);
            }
        }
        res.render('pokemon', { pokemon, pokemonDataArray });
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
