import React from "react";
import { withRouter } from "react-router";
import { initializePlayerSocketIoConnection } from "../../SocketIoConnection";

class JoinGame extends React.Component {
  constructor(props) {
    super(props);
    this.handleJoinClick = this.handleJoinClick.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onRoomCodeChange = this.onRoomCodeChange.bind(this);
    this.state = { errorMessage: "", playerName: this.getSavedName() };
  }

  getSavedName() {
    const savedName = localStorage.getItem("QUIPLASH_NAME");
    return savedName ? savedName : "";
  }

  handleJoinClick(e) {
    e.preventDefault(); // To prevent page reload on form submit
    localStorage.setItem("QUIPLASH_NAME", this.state.playerName);
    const socket = initializePlayerSocketIoConnection();
    socket.emit("PLAYER_JOIN", { roomCode: this.state.roomCode, playerName: this.state.playerName });
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
      <form onSubmit={this.handleJoinClick}>
        <h1>Join a Game</h1>
        <div>
          <label className="form-label">Room Code</label>
          <input className="form-input" type="text" placeholder="Four digit code" onChange={this.onRoomCodeChange} />
          <br />
          <label className="form-label">Your Name </label>
          <input
            className="form-input"
            type="text"
            placeholder="Name"
            defaultValue={this.getSavedName()}
            onChange={this.onNameChange}
          />
          <br />
        </div>
        <button className="player-button" type="submit">
          Play
        </button>
        <div>{this.state.errorMessage}</div>
      </form>
    );
  }
}

export default withRouter(JoinGame);
