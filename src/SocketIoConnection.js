import socketIOClient from "socket.io-client";

let hostSocket;
let playerSocket;

export function initializeHostSocketIoConnection() {
  hostSocket = socketIOClient();
  return hostSocket;
}

export function initializePlayerSocketIoConnection() {
  playerSocket = socketIOClient();
  return playerSocket;
}

export function getHostSocket() {
  return hostSocket;
}

export function getPlayerSocket() {
  return playerSocket;
}
