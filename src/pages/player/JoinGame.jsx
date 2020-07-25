import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import { clearSockets, initializePlayerSocketIoConnection } from "../../SocketIoConnection";
import "./JoinGame.css";

class JoinGame extends React.Component {
  constructor(props) {
    super(props);
    this.handleJoinClick = this.handleJoinClick.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onRoomCodeChange = this.onRoomCodeChange.bind(this);
    this.state = { errorMessage: "", playerName: this.getSavedName() };
    clearSockets();
  }

  getSavedName() {
    const savedName = localStorage.getItem("QUIPLASH_NAME");
    return savedName ? savedName : "";
  }

  handleJoinClick(e) {
    e.preventDefault(); // To prevent page reload on form submit
    localStorage.setItem("QUIPLASH_NAME", this.state.playerName);
    const socket = initializePlayerSocketIoConnection();
    if (this.state.roomCode) {
      socket.emit("PLAYER_JOIN", { roomCode: this.state.roomCode.toUpperCase(), playerName: this.state.playerName });
    }
    socket.on("FAILED_TO_JOIN_ROOM", () =>
      this.setState({
        errorMessage: `Failed to join room ${this.state.roomCode.toUpperCase()} as it does not exist or is full.`,
      }),
    );
    socket.on("SUCCESSFULLY_JOINED_ROOM", () => this.props.history.push(`/game/${this.state.roomCode}`));
  }

  onNameChange(event) {
    this.setState({ playerName: event.target.value });
  }

  onRoomCodeChange(event) {
    this.setState({ roomCode: event.target.value });
  }

  render() {
    return (
      <div>
        {/* For easier testing */}
        <div className="quick-links-container" style={{ opacity: 0 }}>
          <Link to="/create">HOST</Link>
        </div>
        <form onSubmit={this.handleJoinClick}>
          <h1>Join a Game</h1>
          <div className="join-game-container">
            <label className="join-form-label">Room Code</label>
            <input
              className="join-form-input room-code-input"
              type="text"
              placeholder="Four letter code"
              onChange={this.onRoomCodeChange}
            />
            <br />
            <label className="join-form-label">Your Name </label>
            <input
              className="join-form-input"
              type="text"
              placeholder="Name"
              defaultValue={this.getSavedName()}
              onChange={this.onNameChange}
            />
            <br />
          </div>
          <button className="player-submit-button" type="submit">
            Play
          </button>
          <div>{this.state.errorMessage}</div>
        </form>
      </div>
    );
  }
}

export default withRouter(JoinGame);
