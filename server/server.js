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
app.use(express.static(__dirname + '/views'));

// Cache Middle layer to avoid multiple calls for the same request parameters.
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

// Abstracted function to fetch pokemon data.
async function fetchPokemonData(url) {
  const response = await axios.get(url);
  return response.data;
}

// Root Path.
function handleRootRequest(req, res) {
  res.render('index');
}

// Path for Pokedex page.
function handlePokedexRequest(req, res) {
  let page = parseInt(req.query.page) || 1;
  let currentPage = page
  if(page > 51 ||  page < 1) {
    page = 1
    currentPage = 1
  }
  const pageSize = 20;
  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = startIdx + pageSize - 1;
  const cacheKey = `${startIdx}-${endIdx}`;
  
  const cachedData = cache.get(cacheKey);
  let pokemonList = [];

  if (cachedData) {
    pokemonList = cachedData;
    return Promise.resolve({ pokemonList, currentPage });
  } else {
    return Promise.all(
      Array.from({ length: pageSize }, (_, index) => fetchPokemonData(`https://pokeapi.co/api/v2/pokemon/${startIdx + index}/`))
    ).then(pokemonData => {
      pokemonList = pokemonData.map(pokemon => {
        pokemon.pokemonMainImg = pokemon.sprites.other.showdown.front_default || pokemon.sprites.other.home.front_default;
        return pokemon;
      });
      cache.set(cacheKey, pokemonList);
      return { pokemonList, currentPage };
    });
  }
}

// Path for Pokemon detail page.
function handlePokemonRequest(req, res) {
  const pokemonId = req.query.pokemonId;
  const cachedPokemon = cache.get(pokemonId);
  if (cachedPokemon) {
    return Promise.resolve({ pokemon: cachedPokemon, pokemonDataArray: [] });
  } else {
    return axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`)
      .then(response => {
        const pokemon = response.data;
        pokemon.pokemonMainImg = pokemon.sprites.other.showdown.front_default || pokemon.sprites.other.home.front_default;
        cache.set(pokemonId, pokemon);
        return axios.get(pokemon.types[0].type.url);
      })
      .then(typeResponse => {
        const allSamePokemons = shuffleArray(typeResponse.data.pokemon).slice(0, 8);
        const pokemonDataArray = allSamePokemons
          .filter(samePokemon => samePokemon.pokemon.name !== pokemonId)
          .map(samePokemon => axios.get(samePokemon.pokemon.url))
        return Promise.all(pokemonDataArray);
      })
      .then(responses => {
        const pokemonDataArray = responses.map(response => {
          const tempPokemon = response.data;
          tempPokemon.pokemonMainImg = tempPokemon.sprites.other.showdown.front_default || tempPokemon.sprites.other.home.front_default;
          return tempPokemon;
        });
        return { pokemon: cache.get(pokemonId), pokemonDataArray };
      });
  }
}

// Function to Shuffle Array inorder to get random pokemons 
// in suggested section from similar types.
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = {
  app,
  handleRootRequest,
  handlePokedexRequest,
  handlePokemonRequest,
  fetchPokemonData,
  shuffleArray,
  cacheMiddleware
};

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}

app.get('/', cacheMiddleware, (req, res) => {
  handleRootRequest(req, res)
    .then(response => res.send(response))
    .catch(error => {
      console.error('Error fetching Pokemon data:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/pokemon', cacheMiddleware, (req, res) => {
  handlePokemonRequest(req, res)
    .then(({ pokemon, pokemonDataArray }) => res.render('pokemon', { pokemon, pokemonDataArray }))
    .catch(error => {
      console.error('Error fetching Pokemon data:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/pokedex', cacheMiddleware, (req, res) => {
  handlePokedexRequest(req, res)
    .then(({ pokemonList, currentPage }) => res.render('pokedex', { pokemonList, currentPage }))
    .catch(error => {
      console.error('Error fetching Pokemon data:', error);
      res.status(500).send('Internal Server Error');
    });
});