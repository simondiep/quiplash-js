const rooms = {};

export function addPlayerToRoom(roomCode, player) {
  if (rooms[roomCode]) {
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
    const numberOfPlayers = rooms[roomCode].players.length;
    const votesReceivedForPrompt = vote.votes.length;
    if (numberOfPlayers === votesReceivedForPrompt) {
      // Double points!
      rooms[roomCode].points[vote.submitter] += 2 * votesReceivedForPrompt;
    } else {
      rooms[roomCode].points[vote.submitter] += votesReceivedForPrompt;
    }
  }
}

export function createRoom() {
  const CHAR_LIST = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let roomCode;
  do {
    roomCode = "";
    for (var i = 0; i < 4; i++) {
      roomCode += CHAR_LIST.charAt(Math.floor(Math.random() * CHAR_LIST.length));
    }
  } while (rooms[roomCode]);
  rooms[roomCode] = { players: [], points: {} };
  return roomCode;
}

export function deleteRoom(roomCode) {
  delete rooms[roomCode];
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
