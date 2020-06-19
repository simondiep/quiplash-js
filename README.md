# Quiplash-JS

A creative word-smithing party game for 3-8 players. A recreation of the Jackbox game Quiplash, using javascript.

![demo preview](./preview.png?raw=true)

## How to Play

- Host starts a new game at https://quiplashjs.herokuapp.com/create
- Players join game at https://quiplashjs.herokuapp.com (recommended to use a mobile device)
- Host starts the game
- Players receive two prompts to answer (Be as silly as possible)
- Players then vote for their favorite answer to different prompts
- Whoever gets the most votes for their submitted answer is technically the winner, but the person that had the most fun is the true winner

## Tech Stack

- Frontend - React
- Backend - Nodejs, Express
- SocketIO

## How to Start Local Server

- Build your React app
- `npm run build-react`
- Start your server
- `npm start`

Note: Remember to build your web code. The webpack-dev-server content does not get hosted by node.

## Directory Structure

- `build` - Built web app
- `public` - Template html from create-react-app
- `server` - Node Server code
- `src` - Front-end code

## TODO List

### Done

- Set up Node Express Server
- Set up routing for host vs client pages
- On click of Create New Game, transition to lobby page
  - Call create backend and have it return back the room code
- Generate and store room code in backend
- Hook up Join game page to call join-game backend
- Transition to "Waiting for game to start" page
- CORS issue with websockets going from web (port 3000) to backend (port 3001) - fix was remove duplicate http server in bin/www
- Convert join REST call to websocket
- websocket updates for player join
- hook up game start to show "YOU ARE IN GAME"
- Figure out how to persist socket io between React pages (is this needed or a single spot?)
- figure out game logic
- Have server send prompt to all players
- CHECK IF ALL PLAYERS HAVE SUBMITTED, then go to next phase (voting)
- second client is not getting past "Waiting for other players to submit their responses..." - io.in fixed this
- need a big pool of prompts
- Make the prompts look decent on Host
- assign pairs for each prompt - these pairs will not be able to vote on their round
- determine number of rounds based on number of players (play some games in jackbox)
- more responsive host and player cards so longer answers still fit on screen
- implement support for 3-8 players
- notify of the last round and show final scores (host only)
- better readme
- enter key should submit an answer
- code cleanup
- Host on heroku
  - Prod built artifacts?
  - variablize server (for client io connections) and client (for instructions page) URLS
- Test on heroku

### Not yet started

- cold-start strategies
- handle duplicates/collisions in same answer
- Display your player name on top of screen (player)
  - Maybe merge JoinGame and StartGame components or have a parent component to keep track of player name?
- Have first player to join have host controls to start game
- prevent answer submitter from voting on their own prompt
- Time out inactive lobbies
- Handle players dropping out (automatic?)
- Testing faster - Automate creation of room and joining of a player
- Clean up console logs
- Polish to make it look good
  - Sound effects
  - background music
  - animations
- Better instructions
- host - progress bar for showing who's still submitting their answer
- consider getting rid of room state and leverage only socket rooms
- support pg13 / r-rated prompts
- keep track of used prompts so they don't repeat
- allow voting for creative answers
- consider converting REST endpoint into websocket call
- gray out start button in lobby until at least 3 players (make a visual cue)
- unit tests? makes sense if im the only dev?
- Test on phone
