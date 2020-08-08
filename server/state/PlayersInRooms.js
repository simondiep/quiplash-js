const rooms = {};

const MAX_NUMBER_OF_PLAYERS = 8;

export function addHostToRoom(roomCode, hostSocketId) {
  rooms[roomCode].hostSocketId = hostSocketId;
}

export function addPlayerToRoom(roomCode, player) {
  if (rooms[roomCode]) {
    if (rooms[roomCode].started) {
      console.warn("Could not add player as game has already started: ", roomCode);
      return false;
    }
    if (rooms[roomCode].players.length > MAX_NUMBER_OF_PLAYERS) {
      console.warn("Could not add player as room is already full: ", roomCode);
      return false;
    }
    rooms[roomCode].players.push(player);
    return true;
  }
  console.warn("Could not add player as room was not found: ", roomCode);
  return false;
}

export function addPoints(roomCode, allVotes) {
  for (let vote of allVotes) {
    if (!rooms[roomCode].points[vote.submitter]) {
      rooms[roomCode].points[vote.submitter] = 0;
    }
    rooms[roomCode].points[vote.submitter] += vote.points;
  }
}

export function createRoom(roomOptions) {
  const CHAR_LIST = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let roomCode;
  do {
    roomCode = "";
    for (var i = 0; i < 4; i++) {
      roomCode += CHAR_LIST.charAt(Math.floor(Math.random() * CHAR_LIST.length));
    }
  } while (rooms[roomCode]);
  rooms[roomCode] = { players: [], points: {}, roomOptions };
  return roomCode;
}

export function deleteRoom(roomCode) {
  delete rooms[roomCode];
}

export function doesPlayerNameAlreadyExist(roomCode, playerName) {
  if (rooms[roomCode]) {
    return rooms[roomCode].players.find((player) => player.name === playerName);
  }
  return false;
}

export function getHostSocketIdForRoom(roomCode) {
  // handle case where stale client tries to connect to a past room
  try {
    return rooms[roomCode].hostSocketId;
  } catch (e) {
    return false;
  }
}

export function getPointsSortedHighestFirst(roomCode) {
  return Object.entries(rooms[roomCode].points).sort((a, b) => (a[1] > b[1] ? -1 : 1));
}

export function getPlayersOfRoom(roomCode) {
  if (rooms[roomCode]) {
    return rooms[roomCode].players;
  }
  return [];
}

export function getRoomOptions(roomCode) {
  return rooms[roomCode].roomOptions;
}

export function storeStartGame(roomCode) {
  rooms[roomCode].started = true;
}
