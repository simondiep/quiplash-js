import { addPlayerToRoom, addPoints, getPlayersOfRoom, getPointsSortedHighestFirst } from "./state/PlayersInRooms";
import {
  assignPromptsForPlayers,
  getOnePromptAndAnswersForRoom,
  getNumberOfAnswersForRoom,
  getVotes,
  hasMorePromptsForRoom,
  storeAnswerForPrompt,
  storeVoteForPrompt,
} from "./state/PromptsAnswersVotes";

export function initializeSocketIo(io) {
  io.on(WS_EVENT.DEFAULT_CONNECTION, (socket) => {
    socket.on(WS_EVENT.INCOMING.HOST_JOINED_ROOM, (roomCode) => {
      if (roomCode) {
        console.log("Host has created room ", roomCode);
        socket.join(roomCode);
        socket.nickname = `Host ${roomCode}`;
        socket.roomCode = roomCode;
      }
    });
    socket.on(WS_EVENT.INCOMING.HOST_STARTING_GAME, () => {
      startNewGame(socket);
    });
    socket.on(WS_EVENT.INCOMING.HOST_START_ROUND, () => {
      if (hasMorePromptsForRoom(socket.roomCode)) {
        startNewRound(socket, io);
      } else {
        io.in(socket.roomCode).emit(WS_EVENT.OUTGOING.SHOW_PLAYER_POINTS, getPointsSortedHighestFirst(socket.roomCode));
      }
    });
    socket.on(WS_EVENT.INCOMING.PLAYER_JOIN, (player) => {
      if (
        addPlayerToRoom(player.roomCode, {
          id: socket.id,
          name: player.playerName,
        })
      ) {
        socket.nickname = player.playerName;
        socket.roomCode = player.roomCode;
        socket.join(player.roomCode);
        console.log(`added ${player.playerName} to room ${player.roomCode}`);
        socket.emit(WS_EVENT.OUTGOING.SUCCESSFULLY_JOINED_ROOM);
        socket.to(socket.roomCode).emit(WS_EVENT.OUTGOING.LOBBY_PLAYERS_UPDATED, getPlayersOfRoom(player.roomCode));
      }
    });
    socket.on(WS_EVENT.INCOMING.SUBMIT_ANSWER, ({ prompt, answer }) => {
      storeAnswerForPrompt({ prompt, playerName: socket.nickname, answer, roomCode: socket.roomCode });
      console.log("Got answer from ", socket.nickname, ": ", answer);
      // CHECK IF ALL PLAYERS HAVE SUBMITTED, then go to next phase (voting)
      if (getPlayersOfRoom(socket.roomCode).length * 2 <= getNumberOfAnswersForRoom(socket.roomCode)) {
        startNewRound(socket, io);
      }
    });
    socket.on(WS_EVENT.INCOMING.SUBMIT_VOTE, ({ prompt, answerVotedFor }) => {
      storeVoteForPrompt({ prompt, playerName: socket.nickname, roomCode: socket.roomCode, answerVotedFor });
      // TALLY Votes and display all votes
      io.in(socket.roomCode).clients((error, clients) => {
        if (error) throw error;
        const allVotes = getVotes(prompt, socket.roomCode, getPlayersOfRoom(socket.roomCode).length);
        const totalVotes = allVotes.reduce(function (currentSum, votersPerAnswer) {
          return currentSum + votersPerAnswer.votes.length;
        }, 0);
        if (totalVotes >= clients.length - 3) {
          // assign points
          addPoints(socket.roomCode, allVotes);
          // io.in Makes sure the original player gets this
          io.in(socket.roomCode).emit(
            WS_EVENT.OUTGOING.VOTING_RESULTS,
            allVotes,
            hasMorePromptsForRoom(socket.roomCode),
          );
        }
      });
    });
    socket.on(WS_EVENT.INCOMING.DISCONNECT, () => {
      console.log(`${socket.nickname} has disconnected from room ${socket.roomCode}`);
      io.in(socket.roomCode).emit(WS_EVENT.OUTGOING.PLAYER_DISCONNECTED, socket.nickname);
    });
  });
}

function startNewGame(socket) {
  console.log("Host is starting game for room ", socket.roomCode);
  const players = getPlayersOfRoom(socket.roomCode);
  const promptsForPlayers = assignPromptsForPlayers({
    players,
    roomCode: socket.roomCode,
  });
  promptsForPlayers.forEach((promptsForPlayer) => {
    socket.to(promptsForPlayer.player.id).emit(WS_EVENT.OUTGOING.START_GAME, promptsForPlayer.prompts);
  });
  socket.emit(WS_EVENT.OUTGOING.START_GAME);
}

function startNewRound(socket, io) {
  console.log("Starting round for room ", socket.roomCode);
  const onePromptAndAnswers = getOnePromptAndAnswersForRoom(socket.roomCode);
  io.in(socket.roomCode).emit(WS_EVENT.OUTGOING.START_VOTING_PHASE, {
    prompt: onePromptAndAnswers.prompt,
    answers: onePromptAndAnswers.answers,
  });
  // check if player answered prompt and instead send WAIT_FOR_VOTES_ON_YOUR_PROMPT
  const players = getPlayersOfRoom(socket.roomCode);
  for (let player of players) {
    if (onePromptAndAnswers.submitters.includes(player.name)) {
      if (player.id === socket.id) {
        socket.emit(WS_EVENT.OUTGOING.WAIT_FOR_VOTES_ON_YOUR_PROMPT);
      } else {
        socket.to(player.id).emit(WS_EVENT.OUTGOING.WAIT_FOR_VOTES_ON_YOUR_PROMPT);
      }
    }
  }
}

const WS_EVENT = {
  DEFAULT_CONNECTION: "connection",
  INCOMING: {
    DISCONNECT: "disconnect",
    HOST_JOINED_ROOM: "HOST_JOINED_ROOM",
    HOST_STARTING_GAME: "HOST_STARTING_GAME",
    HOST_START_ROUND: "HOST_START_ROUND",
    PLAYER_JOIN: "PLAYER_JOIN",
    SUBMIT_ANSWER: "SUBMIT_ANSWER",
    SUBMIT_VOTE: "SUBMIT_VOTE",
  },
  OUTGOING: {
    LOBBY_PLAYERS_UPDATED: "LOBBY_PLAYERS_UPDATED",
    PLAYER_DISCONNECTED: "PLAYER_DISCONNECTED",
    SHOW_PLAYER_POINTS: "SHOW_PLAYER_POINTS",
    START_GAME: "START_GAME",
    START_VOTING_PHASE: "START_VOTING_PHASE",
    SUCCESSFULLY_JOINED_ROOM: "SUCCESSFULLY_JOINED_ROOM",
    VOTING_RESULTS: "VOTING_RESULTS",
    WAIT_FOR_VOTES_ON_YOUR_PROMPT: "WAIT_FOR_VOTES_ON_YOUR_PROMPT",
  },
};
