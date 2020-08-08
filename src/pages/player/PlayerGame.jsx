import React, { Component } from "react";
import { withRouter } from "react-router";
import { getPlayerSocket } from "../../SocketIoConnection";
import "./PlayerGame.css";
import holdPhoneDownImage from "../../images/hold-phone-down.png";
import holdPhoneMidImage from "../../images/hold-phone-mid.png";
import holdPhoneUpImage from "../../images/hold-phone-up.png";

class PlayerGame extends Component {
  state = { phase: "WAITING_TO_START", answer: "" };
  // state = {
  //   phase: "START_SHAKING",
  //   shakes: 0,
  //   yAccel: 0,
  // };
  // Test state
  // state = {
  //   phase: "STARTED",
  //   promptsToAnswer: [
  //     "The most <i>horrific</i> way to start your day",
  //     "You are having a stroll in the park, only to see BLANK",
  //   ],
  //   currentPromptNumber: 0,
  // };

  constructor(props) {
    super(props);
    this.handleSubmitAnswerClick = this.handleSubmitAnswerClick.bind(this);
    this.handleSubmitVoteClick = this.handleSubmitVoteClick.bind(this);
    this.handleSubmitVoteClick = this.handleSubmitVoteClick.bind(this);
    this.onAnswerChange = this.onAnswerChange.bind(this);
    this.onPictureTaken = this.onPictureTaken.bind(this);
    this.handleMotion = this.handleMotion.bind(this);
    this.takePictureInputRef = React.createRef();
    this.takeSelfieInputRef = React.createRef();
    window.addEventListener("devicemotion", this.handleMotion);
  }

  componentDidMount() {
    const socket = getPlayerSocket();
    if (!socket) {
      // For easier local debugging with live-reload changes
      this.props.history.push("/");
      return;
    }
    socket.on("PLAYER_DISCONNECTED", (playerName) => {
      alert(`${playerName} has disconnected from the game.  Please join a new game to keep playing.`);
      this.props.history.push("/");
    });
    socket.on("START_GAME", (promptsToAnswer, roomOptions) =>
      this.setState({ phase: "STARTED", promptsToAnswer, currentPromptNumber: 0, roomOptions }),
    );
    socket.on("START_VOTING_PHASE", (onePromptAndAnswers) =>
      this.setState({
        phase: "VOTING",
        prompt: onePromptAndAnswers.prompt,
        votingOptions: onePromptAndAnswers.answers,
      }),
    );
    socket.on("WAIT_FOR_VOTES_ON_YOUR_PROMPT", () => this.setState({ phase: "WAIT_FOR_VOTES_ON_YOUR_PROMPT" }));
    socket.on("START_SHAKING", () => this.setState({ phase: "START_SHAKING", shakes: 0 }));
    socket.on("SHAKE_RESULTS", () => this.setState({ phase: "WAITING_FOR_NEXT_ROUND", yAccel: 0, shakes: 0 }));
  }

  handleSubmitAnswerClick(e) {
    e.preventDefault(); // To prevent page reload on form submit
    if (this.state.answer) {
      getPlayerSocket().emit("SUBMIT_ANSWER", {
        prompt: this.state.promptsToAnswer[this.state.currentPromptNumber],
        answer: this.state.answer,
      });
      if (this.state.currentPromptNumber >= 1) {
        this.setState({ answer: "", phase: "SUBMITTED_ANSWER" });
      } else {
        this.setState({ answer: "", currentPromptNumber: 1 });
      }
    }
  }

  handleSubmitVoteClick(answerVotedFor) {
    getPlayerSocket().emit("SUBMIT_VOTE", { prompt: this.state.prompt, answerVotedFor });
    this.setState({ phase: "WAITING_FOR_NEXT_ROUND" });
  }

  onAnswerChange(event) {
    this.setState({ answer: event.target.value });
  }

  onPictureTaken(event) {
    const picture = event.target.files[0];
    if (picture) {
      const reader = new FileReader();
      reader.onload = () => {
        getPlayerSocket().emit("SUBMIT_ANSWER", {
          prompt: this.state.promptsToAnswer[this.state.currentPromptNumber],
          answer: reader.result,
        });
        if (this.state.currentPromptNumber >= 1) {
          this.setState({ answer: "", phase: "SUBMITTED_ANSWER" });
        } else {
          this.setState({ answer: "", currentPromptNumber: 1 });
        }
      };
      reader.readAsDataURL(picture);
    }
  }

  render() {
    switch (this.state.phase) {
      case "STARTED":
        return (
          <form onSubmit={this.handleSubmitAnswerClick}>
            <div>
              <h1 dangerouslySetInnerHTML={{ __html: this.state.promptsToAnswer[this.state.currentPromptNumber] }}></h1>
              <input
                className="answer-input"
                type="text"
                placeholder="Answer Here"
                value={this.state.answer}
                onChange={this.onAnswerChange}
              />
              <br />
            </div>
            <button className="player-submit-button" type="submit">
              Submit Answer
            </button>
            {this.state.roomOptions.allowPictureUploads && (
              <div style={{ display: this.state.roomOptions.allowPictureUploads ? "block" : "none" }}>
                <div>or</div>
                <button className="player-submit-button" onClick={() => this.takePictureInputRef.current.click()}>
                  Take a picture
                </button>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={this.onPictureTaken}
                  ref={this.takePictureInputRef}
                  style={{ display: "none" }}
                />
                <div>or</div>
                <button className="player-submit-button" onClick={() => this.takeSelfieInputRef.current.click()}>
                  Take a selfie
                </button>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={this.onPictureTaken}
                  ref={this.takeSelfieInputRef}
                  style={{ display: "none" }}
                />
              </div>
            )}
          </form>
        );
      case "SUBMITTED_ANSWER":
        return <h1>Waiting for other players to submit their responses...</h1>;
      case "VOTING":
        let answersCount = 0;
        return (
          <div>
            <h1 dangerouslySetInnerHTML={{ __html: this.state.prompt }}></h1>
            <h2>Which one do you like more?</h2>
            {this.state.votingOptions.map((voteOption) => {
              let buttonText = voteOption;
              if (voteOption.startsWith("data:")) {
                if (answersCount === 0) {
                  buttonText = "The left picture";
                } else {
                  buttonText = "The right picture";
                }
              }
              answersCount++;
              return (
                <button className="player-submit-button" onClick={() => this.handleSubmitVoteClick(voteOption)}>
                  {buttonText}
                </button>
              );
            })}
          </div>
        );
      case "WAITING_TO_START":
        return <h1>Waiting for game to start...</h1>;
      case "WAITING_FOR_NEXT_ROUND":
        return <h1>See the results on the host screen</h1>;
      case "WAIT_FOR_VOTES_ON_YOUR_PROMPT":
        return <h1>See others vote for your answer on the host screen</h1>;
      case "START_SHAKING":
        let imgSrc;
        if (this.state.yAccel > 0) {
          imgSrc = holdPhoneUpImage;
        } else if (this.state.yAccel < 0) {
          imgSrc = holdPhoneDownImage;
        } else {
          imgSrc = holdPhoneMidImage;
        }
        let speedText = "Stopped";
        const absSpeed = Math.abs(this.state.yAccel);
        if (absSpeed > 10) {
          speedText = "Too fast to read!";
        } else if (absSpeed > 5) {
          speedText = "So Fast";
        } else if (absSpeed > 3) {
          speedText = "Fast";
        } else if (absSpeed >= 1) {
          speedText = "Slow";
        }
        return (
          <div>
            <h1>Start Shaking!</h1>
            <img src={imgSrc} className="shake-image" />
            <div>{`Speed: ${speedText}`}</div>
            <h1>{`Number of Shakes: ${this.state.shakes}`}</h1>
          </div>
        );
      default:
        throw new Error("Invalid Player State ", this.state.phase);
    }
  }

  handleMotion(event) {
    event.preventDefault();
    if (this.state.phase === "WAITING_TO_START" || this.state.phase === "START_SHAKING") {
      const currentAccel = Math.round(event.acceleration.y);
      const previousYAccel = Math.round(this.state.yAccel);
      let shakes = this.state.shakes;
      if ((previousYAccel > 0 && currentAccel < 0) || (previousYAccel < 0 && currentAccel > 0)) {
        shakes++;
        getPlayerSocket().emit("SHAKE_COUNT_UP");
      }
      this.setState({
        yAccel: currentAccel,
        shakes,
      });
    }
  }
}

export default withRouter(PlayerGame);
