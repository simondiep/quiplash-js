import React, { Component } from "react";
import { withRouter } from "react-router";
import { getHostSocket, initializeHostSocketIoConnection } from "../../SocketIoConnection";
import "./Lobby.css";

class Lobby extends Component {
  state = { lobbyPlayers: [] };

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
    });
  }

  getConnectedPlayersComponent() {
    if (this.state.lobbyPlayers.length === 0) {
      return <div>No connected players yet.</div>;
    }
    return this.state.lobbyPlayers.map((lobbyPlayer) => <div key={lobbyPlayer.id}>{lobbyPlayer.name}</div>);
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
      <div>
        <h1>Quiplash-JS</h1>
        <div className="lobby-room-instructions">
          Go to <span className="room-url">quiplashjs.herokuapp.com</span> on your mobile device
        </div>
        <div className="lobby-room-code-text">Room Code</div>
        <div className="room-code">{this.getRoomCode()}</div>
        <div className="connected-players">{this.getConnectedPlayersComponent()}</div>
        <button className="submit-form-button" onClick={this.onStartGameClick.bind(this)}>
          Start Game
        </button>
      </div>
    );
  }
}

export default withRouter(Lobby);
