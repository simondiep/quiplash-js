import WS_EVENT from "./WebsocketEvents";
import { getHostSocketIdForRoom } from "../state/PlayersInRooms";

export function initializePunchGameHandler(io) {
  io.on(WS_EVENT.DEFAULT_CONNECTION, (socket) => {
    socket.on(WS_EVENT.INCOMING.HOST_START_PUNCH_ROUND, () => {
      io.in(socket.roomCode).emit(WS_EVENT.OUTGOING.START_PUNCHING);
    });
    socket.on(WS_EVENT.INCOMING.HOST_PUNCH_DONE, () => {
      io.in(socket.roomCode).emit(WS_EVENT.OUTGOING.SHOW_PUNCH_RESULTS);
    });
    socket.on(WS_EVENT.INCOMING.STARTING_PUNCH, (punchAccel) => {
      const hostSocketId = getHostSocketIdForRoom(socket.roomCode);
      if (hostSocketId) {
        socket.to(hostSocketId).emit(WS_EVENT.OUTGOING.STARTING_PUNCH, socket.nickname, punchAccel);
      }
    });
    socket.on(WS_EVENT.INCOMING.STOPPED_PUNCH, () => {
      const hostSocketId = getHostSocketIdForRoom(socket.roomCode);
      if (hostSocketId) {
        socket.to(hostSocketId).emit(WS_EVENT.OUTGOING.STOPPED_PUNCH, socket.nickname);
      }
    });
  });
}
