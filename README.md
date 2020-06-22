# Quiplash-JS

A creative word-smithing party game for 3-8 players. A recreation of the Jackbox game Quiplash, using javascript.

Playable in the same room or remotely via screensharing.

![demo preview](./preview.png?raw=true)

## How to Play

- Host starts a new game at https://quiplashjs.herokuapp.com/create
  - If players are remote, screen share this screen
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

- `npm start`

Note: The React web app needs to get built, whereas the node server does not.

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
- prevent start in lobby until at least 3 players (make a visual cue)
- code cleanup
- Host on heroku
  - Prod built artifacts?
  - variablize server (for client io connections) and client (for instructions page) URLS
- Test on heroku
- Test on phone
- Mobile safari doesn't use 100% height, causing screen to be scrolled down after clicking join
- Mobile safari scrolls down too far when inputting an answer, making you unable to see the prompt
- Easier way for mobile safari to join a new game since URL is at /game/1234
- BLANK in prompts are not being rendered with dangerouslySetInnerHtml
- Mobile safari - Button stays green after submitting prompt answer
- prevent answer submitter from voting on their own prompt
- Handle players dropping out
- Explain that scores carry over between games
- clean up abandonded rooms
- room code - use letters instead of numbers
- handle duplicates/collisions in same answer

### Not yet started

- Points are confusing
  - need to display points after votes are in
  - Display single game scores compared to total scores
  - use 100 instead of 1 to more intuitively show points
- Mobile safari scrolls down too far when inputting an answer, making you unable to see the prompt
- Tablet support for host (cards too wide)
- Display your player name on top of screen (player)
  - Maybe merge JoinGame and StartGame components or have a parent component to keep track of player name?
- Have first player to join have host controls to start game
- Time out inactive lobbies
- Testing faster - Automate creation of room and joining of a player
- Polish to make it look better
  - Sound effects
  - background music (only on host)
  - animations
- host - progress bar for showing who's still submitting their answer
- support pg13 / r-rated prompts
- keep track of used prompts so they don't repeat
- allow side-voting for creative answers
- consider converting REST endpoint into websocket call
- better instructions for those that haven't played before
- On score screen, recap the most voted answer and prompt
