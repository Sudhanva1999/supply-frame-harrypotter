const axios = require('axios');
const NodeCache = require('node-cache');
const {
  handleRootRequest,
  handlePokedexRequest,
  shuffleArray,
  cacheMiddleware
} = require('../server');

jest.mock('axios');
jest.mock('node-cache');

describe('Express App Functions', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {
        page: 1
      }
    };
    res = {
      render: jest.fn(),
      send: jest.fn(),
      data: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Check if Index page is reachable.', () => {
    it('should render index page', () => {
      handleRootRequest(req, res);
      expect(res.render).toHaveBeenCalledWith('index');
    });
  });

  describe('Check if request to Pokedex page is handeled correctly.', () => {
    it('should handle pokedex request', async () => {
      axios.get.mockResolvedValue({
        data: {
          sprites: {
            other: {
              showdown: { front_default: 'https://pokeapi.co/image1' },
              home: { front_default: 'https://pokeapi.co/image2' }
            }
          }
        }
      });
      const result = await handlePokedexRequest(req, res);
      expect(result.pokemonList).toBeDefined();
      expect(result.currentPage).toBeDefined();
    });
  });

  describe('Check if array shuffle works as intended.', () => {
    it('should shuffle the array', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffledArray = shuffleArray([1, 2, 3, 4, 5]);
      expect(shuffledArray).not.toEqual(array);
    });
  });

  it('Check if next is being called for uncached data', () => {
    const mockSend = jest.fn();
    const next = jest.fn();
    const req = {
      originalUrl: 'https://dummyURL.com'
    };
    const res = {
      send: mockSend
    };
    const cache = new NodeCache({ stdTTL: 3600 });

    cacheMiddleware(req, res, next);

    expect(mockSend).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
