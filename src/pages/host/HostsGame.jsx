import React, { Component } from "react";
import { withRouter } from "react-router";
import "./HostsGame.css";
import { getHostSocket } from "../../SocketIoConnection";

class HostsGame extends Component {
  state = { phase: "SHOW_INSTRUCTIONS" };
  // Test state
  // state = {
  //   phase: "VOTING_RESULTS_PHASE",
  //   prompt: "How are you doing today?",
  //   votingOptions: ["I'm doing well", "Not so great"],
  //   votingResults: [
  //     { answer: "I'm doing well", submitter: "Allan", votes: [], state: "LOSER" },
  //     {
  //       answer: "Not so great",
  //       points: 800,
  //       submitter: "Simon",
  //       votes: ["Allan", "Bobby", "Simon"],
  //       state: "WINNER",
  //       quiplash: true,
  //     },
  //   ],
  // };
  // state = {
  //   phase: "SHOW_PLAYER_POINTS",
  //   playersAndPoints: [
  //     ["simon", 1500],
  //     ["alan", 1000],
  //     ["simon 1234", 300],
  //     ["Poop", 0],
  //   ],
  // };

  componentDidMount() {
    const socket = getHostSocket();
    if (!socket) {
      // For easier local debugging with live-reload changes
      this.props.history.push("/create");
      return;
    }
    socket.on("PLAYER_DISCONNECTED", (playerName) => {
      alert(`${playerName} has disconnected from the game.  Please create a new game to keep playing.`);
      this.props.history.push("/create");
    });
    socket.on("START_GAME", () => this.setState({ phase: "SHOW_INSTRUCTIONS" }));
    socket.on("START_VOTING_PHASE", (onePromptAndAnswers) =>
      this.setState({
        phase: "VOTING_PHASE",
        prompt: onePromptAndAnswers.prompt,
        votingOptions: onePromptAndAnswers.answers,
      }),
    );
    socket.on("VOTING_RESULTS", (votingResults, hasMoreRounds) =>
      this.setState({ phase: "VOTING_RESULTS_PHASE", hasMoreRounds, votingResults }),
    );
    socket.on("SHOW_PLAYER_POINTS", (playersAndPoints) =>
      this.setState({ phase: "SHOW_PLAYER_POINTS", playersAndPoints }),
    );
  }

  onStartNewGameClick() {
    getHostSocket().emit("HOST_STARTING_GAME");
  }

  onStartNewRoundClick() {
    getHostSocket().emit("HOST_START_ROUND");
  }

  render() {
    switch (this.state.phase) {
      case "SHOW_INSTRUCTIONS":
        return <h1>Look at your devices. Fill out a silly answer to your prompt.</h1>;
      case "SHOW_PLAYER_POINTS":
        return (
          <div>
            <h1>Final Scores</h1>
            <div className="player-scores">
              {this.state.playersAndPoints.map((playerAndPoints) => (
                <h2>{`${playerAndPoints[0]} : ${playerAndPoints[1]}`}</h2>
              ))}
            </div>
            <div>Scores carry over to the next game</div>
            <button className="submit-form-button start-new-round-button" onClick={this.onStartNewGameClick}>
              Start New Game
            </button>
          </div>
        );
      case "VOTING_PHASE":
        let answersCount = 0;
        return (
          <div>
            <h1 className="prompt" dangerouslySetInnerHTML={{ __html: this.state.prompt }}></h1>
            <div className="answers">
              {this.state.votingOptions.map((voteOption) => {
                let cardClasses = "card";
                if (answersCount % 2 === 1) {
                  cardClasses += " reversed";
                }
                answersCount++;
                return (
                  <div className="wrapper">
                    <div className={cardClasses}>
                      <h1>{voteOption}</h1>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="vote-instructions">Look at your device and vote for your favorite.</div>
          </div>
        );
      case "VOTING_RESULTS_PHASE":
        let count = 0;
        return (
          <div>
            <h1 className="prompt" dangerouslySetInnerHTML={{ __html: this.state.prompt }}></h1>
            <div className="answers">
              {this.state.votingResults.map((voteResult) => {
                let cardClasses = "card";
                if (count % 2 === 1) {
                  cardClasses += " reversed";
                }
                count++;
                if (voteResult.state === "WINNER") {
                  cardClasses += " winning-answer";
                } else if (voteResult.state === "LOSER") {
                  cardClasses += " losing-answer";
                }
                if (voteResult.quiplash) {
                  cardClasses += " winning-quiplash";
                }
                return (
                  <div className="wrapper">
                    <div className={cardClasses}>
                      {voteResult.quiplash && <div className="quiplash-text">QUIPLASH</div>}
                      <h1>{voteResult.answer}</h1>
                    </div>
                    <div className="submitter">{`Submitted by ${voteResult.submitter}`}</div>
                    <div className="points-gained">{`${
                      voteResult.points ? "+" + voteResult.points : "No"
                    } Points`}</div>
                    <div className="voters">
                      {voteResult.votes.length === 0 ? "No Votes" : voteResult.votes.join(", ")}
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="submit-form-button start-new-round-button" onClick={this.onStartNewRoundClick}>
              {this.state.hasMoreRounds ? "Start Next Round" : "View Scores"}
            </button>
          </div>
        );
      default:
        throw new Error("Invalid Host State ", this.state.phase);
    }
  }
}

export default withRouter(HostsGame);
