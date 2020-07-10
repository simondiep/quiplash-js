import {
  addHostToRoom,
  addPlayerToRoom,
  addPoints,
  doesPlayerNameAlreadyExist,
  deleteRoom,
  getHostSocketIdForRoom,
  getPlayersOfRoom,
  getPointsSortedHighestFirst,
  storeStartGame,
} from "./state/PlayersInRooms";
import {
  assignPromptsForPlayers,
  deleteSavedPromptsForRoom,
  getOnePromptAndAnswersForRoom,
  getNumberOfAnswersForRoom,
  getPopularAnswers,
  getVotes,
  hasMorePromptsForRoom,
  storeAnswerForPrompt,
  storeVoteForPrompt,
} from "./state/PromptsAnswersVotes";

/**
 * Handles all player/server interactions
 */
export function initializeSocketIo(io) {
  io.on(WS_EVENT.DEFAULT_CONNECTION, (socket) => {
    socket.on(WS_EVENT.INCOMING.HOST_JOINED_ROOM, (roomCode) => {
      if (roomCode) {
        console.log("Host has created room ", roomCode);
        socket.join(roomCode);
        socket.nickname = `Host ${roomCode}`;
        socket.roomCode = roomCode;
        addHostToRoom(roomCode, socket.id);
      }
    });
    socket.on(WS_EVENT.INCOMING.HOST_STARTING_GAME, () => {
      startNewGame(socket);
    });
    socket.on(WS_EVENT.INCOMING.HOST_START_ROUND, () => {
      if (hasMorePromptsForRoom(socket.roomCode)) {
        startNewRound(socket, io);
      } else {
        io.in(socket.roomCode).emit(
          WS_EVENT.OUTGOING.SHOW_PLAYER_POINTS,
          getPointsSortedHighestFirst(socket.roomCode),
          getPopularAnswers(socket.roomCode),
        );
      }
    });
    socket.on(WS_EVENT.INCOMING.PLAYER_JOIN, (player) => {
      let newPlayerName = player.playerName;
      if (doesPlayerNameAlreadyExist(player.roomCode.toUpperCase(), player.playerName)) {
        newPlayerName += " ditto";
      }
      if (
        addPlayerToRoom(player.roomCode.toUpperCase(), {
          id: socket.id,
          name: newPlayerName,
        })
      ) {
        socket.nickname = newPlayerName;
        socket.roomCode = player.roomCode;
        socket.join(player.roomCode);
        console.log(`Added ${newPlayerName} to room ${player.roomCode}`);
        socket.emit(WS_EVENT.OUTGOING.SUCCESSFULLY_JOINED_ROOM);
        socket.to(socket.roomCode).emit(WS_EVENT.OUTGOING.LOBBY_PLAYERS_UPDATED, getPlayersOfRoom(player.roomCode));
      } else {
        socket.emit(WS_EVENT.OUTGOING.FAILED_TO_JOIN_ROOM);
      }
    });
    socket.on(WS_EVENT.INCOMING.SUBMIT_ANSWER, ({ prompt, answer }) => {
      console.log("Got answer from ", socket.nickname, ": ", answer);
      storeAnswerForPrompt({ prompt, playerName: socket.nickname, answer, roomCode: socket.roomCode });
      // CHECK IF ALL PLAYERS HAVE SUBMITTED, then go to next phase (voting)
      const expectedNumberOfAnswers = getPlayersOfRoom(socket.roomCode).length * 2;
      const receivedNumberOfAnswers = getNumberOfAnswersForRoom(socket.roomCode);
      if (receivedNumberOfAnswers >= expectedNumberOfAnswers) {
        startNewRound(socket, io);
      } else {
        // Notify host of progress
        socket
          .to(getHostSocketIdForRoom(socket.roomCode))
          .emit(WS_EVENT.OUTGOING.PLAYER_ANSWER_RECEIVED, expectedNumberOfAnswers, receivedNumberOfAnswers);
      }
    });
    socket.on(WS_EVENT.INCOMING.SUBMIT_VOTE, ({ prompt, answerVotedFor }) => {
      console.log("Got vote from ", socket.nickname, ": ", answerVotedFor);
      storeVoteForPrompt({ prompt, playerName: socket.nickname, roomCode: socket.roomCode, answerVotedFor });
      // TALLY Votes and display all votes
      io.in(socket.roomCode).clients((error, clients) => {
        if (error) throw error;
        const allVotes = getVotes(prompt, socket.roomCode, getPlayersOfRoom(socket.roomCode).length);
        const totalVotes = allVotes.reduce(function (currentSum, votersPerAnswer) {
          return currentSum + votersPerAnswer.votes.length;
        }, 0);
        const expectedNumberOfVotes = getPlayersOfRoom(socket.roomCode).length - 2;
        if (totalVotes >= expectedNumberOfVotes) {
          // assign points
          addPoints(socket.roomCode, allVotes);
          // io.in Makes sure the original player gets this
          io.in(socket.roomCode).emit(
            WS_EVENT.OUTGOING.VOTING_RESULTS,
            allVotes,
            hasMorePromptsForRoom(socket.roomCode),
          );
        } else {
          // Notify host of progress
          socket
            .to(getHostSocketIdForRoom(socket.roomCode))
            .emit(WS_EVENT.OUTGOING.PLAYER_VOTE_RECEIVED, expectedNumberOfVotes, totalVotes);
        }
      });
    });
    socket.on(WS_EVENT.INCOMING.DISCONNECT, () => {
      console.log(`${socket.nickname} has disconnected from room ${socket.roomCode}`);
      io.in(socket.roomCode).emit(WS_EVENT.OUTGOING.PLAYER_DISCONNECTED, socket.nickname);
      deleteRoom(socket.roomCode);
      deleteSavedPromptsForRoom(socket.roomCode);
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
  storeStartGame(socket.roomCode);
  promptsForPlayers.forEach((promptsForPlayer) => {
    socket.to(promptsForPlayer.player.id).emit(WS_EVENT.OUTGOING.START_GAME, promptsForPlayer.prompts);
  });
  const expectedNumberOfAnswers = getPlayersOfRoom(socket.roomCode).length * 2;
  socket.emit(WS_EVENT.OUTGOING.START_GAME, expectedNumberOfAnswers);
}

function startNewRound(socket, io) {
  console.log("Starting round for room ", socket.roomCode);
  const onePromptAndAnswers = getOnePromptAndAnswersForRoom(socket.roomCode);
  const expectedNumberOfVotes = getPlayersOfRoom(socket.roomCode).length - 2;
  io.in(socket.roomCode).emit(
    WS_EVENT.OUTGOING.START_VOTING_PHASE,
    {
      prompt: onePromptAndAnswers.prompt,
      answers: onePromptAndAnswers.answers,
    },
    expectedNumberOfVotes,
  );
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
    FAILED_TO_JOIN_ROOM: "FAILED_TO_JOIN_ROOM",
    LOBBY_PLAYERS_UPDATED: "LOBBY_PLAYERS_UPDATED",
    PLAYER_ANSWER_RECEIVED: "PLAYER_ANSWER_RECEIVED",
    PLAYER_VOTE_RECEIVED: "PLAYER_VOTE_RECEIVED",
    PLAYER_DISCONNECTED: "PLAYER_DISCONNECTED",
    SHOW_PLAYER_POINTS: "SHOW_PLAYER_POINTS",
    START_GAME: "START_GAME",
    START_VOTING_PHASE: "START_VOTING_PHASE",
    SUCCESSFULLY_JOINED_ROOM: "SUCCESSFULLY_JOINED_ROOM",
    VOTING_RESULTS: "VOTING_RESULTS",
    WAIT_FOR_VOTES_ON_YOUR_PROMPT: "WAIT_FOR_VOTES_ON_YOUR_PROMPT",
  },
};
