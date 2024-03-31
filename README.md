
# Pokémon Express App

  

This is a simple web application built with Express.js that allows users to explore Pokémon data. It follows the MVC (Model-View-Controller) pattern by separating views and controllers. It utilizes EJS (Embedded JavaScript) templates for rendering views dynamically.

 The app uses the Public Open Pokemon API to fetch data and other information:
  https://pokeapi.co/docs/v2#info

Made for the SupplyFrame Programming Challenge originally, I had a lot of fun creating this app, in the world of React and Vue the challenge forced me to go back to basics and write everything in vanilla Javascript. It was fun to figure out the flow of data and control structure at a root level which in turn gave me a better understanding of how the high level frameworks like React work ! 
 
## Features

  

- View Pokémon details

- Explore the Pokédex

- Cached data to optimize performance

- Responsive design

  

## Installation

  

To install and run the application, follow these steps:

  

1. Clone the repository:

```bash

git clone https://github.com/Sudhanva1999/supply-frame-pokedex.git

```

  

```bash

cd server

```

  

3. Install dependencies:

```bash

npm install

```

  

4. Start the server:

```bash

npm start

```

  

5. Open your web browser and visit `http://localhost:3000` to view the application.

  

## Directory Structure

  

-  `/public/css`: Contains all CSS files.

-  `/public/images/gifs`: Contains GIFs required for Pokémon types.

-  `/resources`: Contains favicon and `pokemon_names.json` with Pokémon names for search suggestions.

-  `/test`: Contains server tests.

-  `/views`: Contains EJS templates for rendering views.

  

## Caching

  

The application implements caching to avoid multiple API calls for the same request parameters. It utilizes Node.js `node-cache` module to store data in memory with a standard time-to-live of about 1 hour. Cached data is stored based on request URLs.

## Testing

  

To run tests, 
Change directory to server.
```bash

cd  server

```
then use the following command:
```bash

npm  test

```

  

## Note

  

- Ensure you are in the `server` directory to execute npm commands.



  


Enjoy exploring Pokémon data with this web application! 🚀🔥