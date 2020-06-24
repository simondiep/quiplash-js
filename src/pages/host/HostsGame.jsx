import React, { Component } from "react";
import { withRouter } from "react-router";
import "./HostsGame.css";
import { getHostSocket } from "../../SocketIoConnection";
import { playBackgroundMusic, playPunchSound, speakText } from "./Sounds";

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
    this.onStartNewGameNewPlayersClick = this.onStartNewGameNewPlayersClick.bind(this);
    const socket = getHostSocket();
    if (!socket) {
      // For easier local debugging with live-reload changes
      this.props.history.push("/create");
      return;
    }
    socket.on("PLAYER_ANSWER_RECEIVED", playPunchSound);
    socket.on("PLAYER_VOTE_RECEIVED", playPunchSound);
    socket.on("PLAYER_DISCONNECTED", (playerName) => {
      alert(`${playerName} has disconnected from the game.  Please create a new game to keep playing.`);
      this.props.history.push("/create");
    });
    socket.on("START_GAME", () => {
      this.setState({ phase: "SHOW_INSTRUCTIONS" });
      speakText(
        "Starting new game.  You'll get two prompts. Enter something hilarious. Your friends will vote for the most funny response.",
      );
    });
    socket.on("START_VOTING_PHASE", (onePromptAndAnswers) => {
      this.setState({
        phase: "VOTING_PHASE",
        prompt: onePromptAndAnswers.prompt,
        votingOptions: onePromptAndAnswers.answers,
      });
      speakText(onePromptAndAnswers.prompt);
      speakText(`${onePromptAndAnswers.answers[0]}, or, ${onePromptAndAnswers.answers[1]}.  Vote now!`);
    });
    socket.on("VOTING_RESULTS", (votingResults, hasMoreRounds) => {
      this.setState({ phase: "VOTING_RESULTS_PHASE", hasMoreRounds, votingResults });
      for (let votingResult of votingResults) {
        if (votingResult.state === "WINNER") {
          if (votingResult.quiplash) {
            speakText("Quiplash for " + votingResult.answer);
            break;
          } else {
            speakText("The winner is " + votingResult.answer);
            break;
          }
        } else if (votingResult.state === "TIE") {
          speakText("Tie vote");
          break;
        }
      }
    });
    socket.on("SHOW_PLAYER_POINTS", (playersAndPoints) => {
      this.setState({ phase: "SHOW_PLAYER_POINTS", playersAndPoints });
      speakText(`Here are the final scores.  ${playersAndPoints[0][0]} is the winner!`);
    });
    playBackgroundMusic();
  }

  onStartNewGameNewPlayersClick() {
    this.props.history.push("/create");
  }

  onStartNewGameSamePlayersClick() {
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
            <div className="start-game-buttons-container">
              Start New Game with
              <button
                className="submit-form-button start-new-game-button"
                onClick={this.onStartNewGameSamePlayersClick}
              >
                Same players
              </button>
              <button className="submit-form-button start-new-game-button" onClick={this.onStartNewGameNewPlayersClick}>
                New players
              </button>
            </div>
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
                  if (voteResult.quiplash) {
                    cardClasses += " winning-quiplash";
                  }
                } else if (voteResult.state === "LOSER") {
                  cardClasses += " losing-answer";
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
