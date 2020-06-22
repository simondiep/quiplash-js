import React, { Component } from "react";
import { withRouter } from "react-router";
import { getHostSocket, initializeHostSocketIoConnection } from "../../SocketIoConnection";
import { playBackgroundMusic, playWooYeahSound } from "./Sounds";
import "./Lobby.css";

class Lobby extends Component {
  state = { lobbyPlayers: [] };
  // Test state
  // state = {
  //   lobbyPlayers: [
  //     { id: "simon", name: "simon" },
  //     { id: "simon", name: "al" },
  //     { id: "simon", name: "simon redux" },
  //     { id: "simon", name: "popo" },
  //     { id: "simon", name: "v" },
  //   ],
  // };

  componentDidMount() {
    const socket = initializeHostSocketIoConnection();
    if (!socket) {
      // For easier local debugging with live-reload changes
      this.props.history.push("/create");
      return;
    }
    socket.emit("HOST_JOINED_ROOM", this.getRoomCode());
    socket.on("LOBBY_PLAYERS_UPDATED", (lobbyPlayers) => {
      this.setState({ lobbyPlayers });
      playWooYeahSound();
    });
    playBackgroundMusic();
  }

  getConnectedPlayersComponent() {
    let connectedPlayersComponent = [];
    for (let i = 0; i < 8; i++) {
      let classNames = "connected-player";
      let lobbyPlayer = this.state.lobbyPlayers[i];
      if (!lobbyPlayer) {
        classNames += " empty-player-slot";
        lobbyPlayer = { id: i, name: "Join Game!" };
      }
      connectedPlayersComponent.push(
        <div className={classNames} key={lobbyPlayer.id}>
          {lobbyPlayer.name}
        </div>,
      );
    }
    return connectedPlayersComponent;
  }

  getRoomCode() {
    return this.props.location.pathname.split("/lobby/")[1];
  }

  onStartGameClick() {
    if (this.state.lobbyPlayers.length < 3) {
      alert("You need at least three players to play this game.");
      return;
    } else if (this.state.lobbyPlayers.length > 8) {
      alert("You have too many players.  Max number of players is 8.");
      return;
    }
    const socket = getHostSocket();
    socket.emit("HOST_STARTING_GAME");
    this.props.history.push("/hostsgame");
  }

  render() {
    return (
      <table>
        <tr>
          <td className="instructions-cell">
            <div className="lobby-room-instructions">
              Go to <span className="room-url">quiplashjs.herokuapp.com</span> on your mobile device
            </div>
            <div className="lobby-room-code-text">Room Code</div>
            <div className="room-code">{this.getRoomCode()}</div>
            <button className="submit-form-button start-game-button" onClick={this.onStartGameClick.bind(this)}>
              Start Game
            </button>
          </td>
          <td className="players-cell">
            <div className="connected-players">{this.getConnectedPlayersComponent()}</div>
          </td>
        </tr>
      </table>
    );
  }
}

export default withRouter(Lobby);
