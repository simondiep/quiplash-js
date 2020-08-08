import React from "react";
import { withRouter } from "react-router";
import { speakText } from "./Sounds";
import { clearSockets } from "../../SocketIoConnection";
import "./CreateNewGame.css";

class CreateNewGame extends React.Component {
  constructor(props) {
    super(props);
    this.onStartGameClick = this.onStartGameClick.bind(this);
    this.onAllowPicturesChange = this.onAllowPicturesChange.bind(this);
    this.state = {
      allowPictureUploads: false,
      playShakeGame: false,
    };
    clearSockets();
  }

  onStartGameClick() {
    fetch("/create-new-game", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((roomCode) => roomCode.text())
      .then((roomCode) => {
        if (roomCode && roomCode.length === 4) {
          this.props.history.push(`/lobby/${roomCode}`);
        } else {
          throw new Error("Could not create game.  Server not responding.");
        }
      })
      .catch(() => alert("Could not create game.  Server not responding."));
  }

  onAllowPicturesChange(e) {
    this.setState({ allowPictureUploads: e.target.value });
  }

  render() {
    return (
      <div>
        <h1>Quiplash-JS</h1>
        <button className="submit-form-button" onClick={this.onStartGameClick}>
          Start new Quiplash Game
        </button>
        <div className="room-options">
          <label>
            <input className="room-options-checkbox" type="checkbox" onChange={this.onAllowPicturesChange} />
            Allow Picture Uploads
          </label>
        </div>
        <button
          className="submit-form-button"
          onClick={() => {
            this.setState({ playShakeGame: true }, this.onStartGameClick);
          }}
        >
          Start new Shake Game
        </button>
        <button className="test-audio-button" onClick={() => speakText("Testing")}>
          Test Audio
        </button>
      </div>
    );
  }
}

export default withRouter(CreateNewGame);
