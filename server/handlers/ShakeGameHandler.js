import WS_EVENT from "./WebsocketEvents";
import { getHostSocketIdForRoom } from "../state/PlayersInRooms";

export function initializeShakeGameHandler(io) {
  io.on(WS_EVENT.DEFAULT_CONNECTION, (socket) => {
    socket.on(WS_EVENT.INCOMING.HOST_START_SHAKE_ROUND, () => {
      io.in(socket.roomCode).emit(WS_EVENT.OUTGOING.START_SHAKING);
    });
    socket.on(WS_EVENT.INCOMING.HOST_SHAKE_DONE, () => {
      io.in(socket.roomCode).emit(WS_EVENT.OUTGOING.SHAKE_RESULTS);
    });
    socket.on(WS_EVENT.INCOMING.SHAKE_COUNT_UP, () => {
      socket.to(getHostSocketIdForRoom(socket.roomCode)).emit(WS_EVENT.OUTGOING.SHAKE_COUNT_UP, socket.nickname);
    });
  });
}
