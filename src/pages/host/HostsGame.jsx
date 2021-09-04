import React, { Component } from "react";
import { withRouter } from "react-router";
import "./HostsGame.css";
import { getHostSocket } from "../../SocketIoConnection";
import Countdown from "react-countdown";
import { playBackgroundMusic, playPunchSound, playPunchHitSound, playShakeSound, speakText } from "./Sounds";
import holdPhoneDownImage from "../../images/hold-phone-down.png";
import holdPhoneMidImage from "../../images/hold-phone-mid.png";
import holdPhoneUpImage from "../../images/hold-phone-up.png";
import chargingPunchImage from "../../images/starting-punch.png";
import completedPunchImage from "../../images/completed-punch.png";
import completedStrongPunchImage from "../../images/completed-powerful-punch.png";

class HostsGame extends Component {
  state = {
    phase: "SHOW_INSTRUCTIONS",
    shakeImageSrc: holdPhoneMidImage,
  };
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
  //     ["bob", 0],
  //   ],
  //   popularAnswers: [
  //     { answer: "aha", submitter: "simon" },
  //     {
  //       answer:
  //         "I'm baby dIY bushwick pok pok gentrify, prism seitan poke ramps ennui crucifix locavore vinyl pabst pinterest. Locavore hell of migas cardigan, taiyaki shoreditch beard glossier health goth chillwave four loko paleo. Pitchfork freegan letterpress man bun helvetica taiyaki organic venmo 90's hammock. Prism XOXO master cleanse, sartorial lyft twee irony hexagon flannel roof party hammock. Actually iceland health goth tattooed. Mlkshk four dollar toast four loko messenger bag, readymade waistcoat gentrify tacos franzen iceland fixie blog paleo.",
  //       submitter: "bob",
  //     },
  //   ],
  // };
  // state = {
  //   phase: "SHOW_SHAKE_RESULTS",
  //   shakeImageSrc: holdPhoneUpImage,
  //   gameWinner: "Simon",
  //   shakePlayers: {
  //     Simon: 1,
  //     Ness: 2,
  //     Paula: 3,
  //     Jeff: 4,
  //     Poo: 5,
  //     Starman: 6,
  //     RunawayFive: 7,
  //     Pookie: 8,
  //   },
  //   gamePlayersResults: {
  //     Simon: 1,
  //     Ness: 2,
  //     Paula: 3,
  //     Jeff: 4,
  //     Poo: 5,
  //     Starman: 6,
  //     RunawayFive: 7,
  //     Pookie: 8,
  //   },
  // state = {
  //   phase: "SHOW_PUNCH_RESULTS",
  //   gameWinner: "Simon",
  //   punchPlayers: {
  //     Simon: { punchAccel: 1 },
  //     Ness: { punchAccel: 2 },
  //     Paula: { punchAccel: 3 },
  //     Jeff: { punchAccel: 4 },
  //     Poo: { punchAccel: 5 },
  //     Starman: { punchAccel: 6 },
  //     RunawayFive: { punchAccel: 7 },
  //     Pookie: { punchAccel: 80 },
  //   },
  //   gamePlayersResults: {
  //     Simon: { punchAccel: 1 },
  //     Ness: { punchAccel: 2 },
  //     Paula: { punchAccel: 3 },
  //     Jeff: { punchAccel: 4 },
  //     Poo: { punchAccel: 5 },
  //     Starman: { punchAccel: 6 },
  //     RunawayFive: { punchAccel: 7 },
  //     Pookie: { punchAccel: 80 },
  //   },
  // };

  componentDidMount() {
    this.onStartNewGameNewPlayersClick = this.onStartNewGameNewPlayersClick.bind(this);
    const socket = getHostSocket();
    if (!socket) {
      // For easier local debugging with live-reload changes
      this.props.history.push("/create");
      return;
    }
    socket.on("PLAYER_ANSWER_RECEIVED", (expectedNumberOfAnswers, receivedNumberOfAnswers) => {
      playPunchSound();
      this.setState({ expectedNumberOfAnswers, receivedNumberOfAnswers });
    });
    socket.on("PLAYER_VOTE_RECEIVED", (expectedNumberOfVotes, receivedNumberOfVotes) => {
      playPunchSound();
      this.setState({
        expectedNumberOfVotes,
        receivedNumberOfVotes,
      });
    });
    socket.on("PLAYER_DISCONNECTED", (playerName) => {
      alert(`${playerName} has disconnected from the game.  Please create a new game to keep playing.`);
      this.props.history.push("/create");
    });
    socket.on("START_GAME", (expectedNumberOfAnswers) => {
      this.setState({ phase: "SHOW_INSTRUCTIONS", expectedNumberOfAnswers, receivedNumberOfAnswers: 0 });
      speakText(
        "Starting new game.  You'll get two prompts. Enter something hilarious. Your friends will vote for the most funny response.",
      );
    });
    socket.on("START_VOTING_PHASE", (onePromptAndAnswers, expectedNumberOfVotes) => {
      this.setState({
        phase: "VOTING_PHASE",
        prompt: onePromptAndAnswers.prompt,
        votingOptions: onePromptAndAnswers.answers,
        expectedNumberOfVotes,
        receivedNumberOfVotes: 0,
      });
      speakText(onePromptAndAnswers.prompt);
      speakText(
        `${getSpokenAnswer(onePromptAndAnswers.answers[0])}, or, ${getSpokenAnswer(
          onePromptAndAnswers.answers[1],
        )}.  Vote now!`,
      );
    });
    socket.on("VOTING_RESULTS", (votingResults, hasMoreRounds) => {
      this.setState({ phase: "VOTING_RESULTS_PHASE", hasMoreRounds, votingResults });
      for (let votingResult of votingResults) {
        if (votingResult.state === "WINNER") {
          if (votingResult.quiplash) {
            speakText("Quiplash for " + getSpokenAnswer(votingResult.answer));
            break;
          } else {
            speakText("The winner is " + getSpokenAnswer(votingResult.answer));
            break;
          }
        } else if (votingResult.state === "TIE") {
          speakText("Tie vote");
          break;
        }
      }
    });
    socket.on("SHOW_PLAYER_POINTS", (playersAndPoints, popularAnswers) => {
      this.setState({ phase: "SHOW_PLAYER_POINTS", playersAndPoints, popularAnswers });
      speakText(`Here are the final scores.  ${playersAndPoints[0][0]} is the winner!`);
    });
    socket.on("SHOW_SHAKE_INSTRUCTIONS", (players) => {
      const playersObject = {};
      for (let player of players) {
        playersObject[player.name] = 0;
      }
      speakText(`Get ready to shake your phone up and down as fast as you can.`);
      this.setState({ phase: "SHOW_SHAKE_INSTRUCTIONS", shakePlayers: playersObject });
    });
    socket.on("START_SHAKING", () => {
      this.setState({ phase: "SHAKE_COUNTDOWN", getReadyCountdownTimer: Date.now() + 3000 });
    });
    socket.on("SHAKE_COUNT_UP", (playerName) => {
      this.state.shakePlayers[playerName]++;
      playShakeSound();
      this.setState({ shakePlayers: this.state.shakePlayers });
    });
    socket.on("SHOW_SHAKE_RESULTS", () => {
      let winner;
      let highScore = -1;
      for (let playerName in this.state.shakePlayers) {
        const shakes = this.state.shakePlayers[playerName];
        if (shakes > highScore) {
          winner = playerName;
          highScore = shakes;
        }
      }
      speakText(`The winner is ${winner}!`);
      this.setState({
        phase: "SHOW_SHAKE_RESULTS",
        gameWinner: winner,
        gamePlayersResults: Object.assign({}, this.state.shakePlayers),
      });
    });
    socket.on("SHOW_PUNCH_INSTRUCTIONS", (players) => {
      const playersObject = {};
      for (let player of players) {
        playersObject[player.name] = { punchAccel: 0, state: "STARTING_PUNCH" };
      }
      speakText(`Grip your phone and get ready to punch as hard as you can.`);
      this.setState({ phase: "SHOW_PUNCH_INSTRUCTIONS", punchPlayers: playersObject });
    });
    socket.on("START_PUNCHING", () => {
      this.setState({ phase: "PUNCH_COUNTDOWN", getReadyCountdownTimer: Date.now() + 3000 });
    });
    socket.on("STARTING_PUNCH", (playerName, punchAccel) => {
      if (punchAccel > this.state.punchPlayers[playerName].punchAccel) {
        this.state.punchPlayers[playerName].punchAccel = punchAccel;
      }
      if (punchAccel >= 5) {
        this.state.punchPlayers[playerName].state = "STARTING_STRONG_PUNCH";
      } else {
        this.state.punchPlayers[playerName].state = "STARTING_PUNCH";
      }
      playPunchHitSound();
      this.setState({ punchPlayers: this.state.punchPlayers });
    });
    socket.on("STOPPED_PUNCH", (playerName) => {
      this.state.punchPlayers[playerName].state = "STOPPED_PUNCH";
      this.setState({ punchPlayers: this.state.punchPlayers });
    });
    socket.on("SHOW_PUNCH_RESULTS", () => {
      let winner;
      let highScore = -1;
      for (let playerName in this.state.punchPlayers) {
        const punchAccel = this.state.punchPlayers[playerName].punchAccel;
        if (punchAccel > highScore) {
          winner = playerName;
          highScore = punchAccel;
        }
      }
      speakText(`The winner is ${winner}!`);
      this.setState({
        phase: "SHOW_PUNCH_RESULTS",
        gameWinner: winner,
        gamePlayersResults: JSON.parse(JSON.stringify(this.state.punchPlayers)),
      });
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

  onStartPunchRoundClick() {
    getHostSocket().emit("HOST_START_PUNCH_ROUND");
  }

  onStartShakeRoundClick() {
    getHostSocket().emit("HOST_START_SHAKE_ROUND");
  }

  render() {
    switch (this.state.phase) {
      case "SHOW_INSTRUCTIONS":
        return (
          <div>
            <h1>Look at your devices. Fill out a silly answer to your prompt.</h1>
            <div>{`${this.state.receivedNumberOfAnswers}/${this.state.expectedNumberOfAnswers} answers received`}</div>
          </div>
        );
      case "SHOW_PLAYER_POINTS":
        const popularAnswerOne = this.state.popularAnswers[0].answer.startsWith("data:") ? (
          <img className="uploaded-image" src={this.state.popularAnswers[0].answer} />
        ) : (
          <div>{this.state.popularAnswers[0].answer}</div>
        );
        const popularAnswerTwo = this.state.popularAnswers[1].answer.startsWith("data:") ? (
          <img className="uploaded-image" src={this.state.popularAnswers[1].answer} />
        ) : (
          <div>{this.state.popularAnswers[1].answer}</div>
        );
        return (
          <div>
            <h1>Final Scores</h1>
            <div className="player-scores-container">
              <div className="player-scores-column">
                <div>Most popular answer</div>
                <div className="popular-answer">{popularAnswerOne}</div>
                <div className="popular-answer-submitter">{`Submitted by ${this.state.popularAnswers[0].submitter}`}</div>
              </div>
              <div className="player-scores-column">
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
                  <button
                    className="submit-form-button start-new-game-button"
                    onClick={this.onStartNewGameNewPlayersClick}
                  >
                    New players
                  </button>
                </div>
              </div>
              <div className="player-scores-column">
                <div>Second most popular answer</div>
                <div className="popular-answer">{popularAnswerTwo}</div>
                <div className="popular-answer-submitter">{`Submitted by ${this.state.popularAnswers[1].submitter}`}</div>
              </div>
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
                const cardContent = voteOption.startsWith("data:") ? (
                  <img className="uploaded-image" src={voteOption} />
                ) : (
                  <h1>{voteOption}</h1>
                );
                return (
                  <div className="wrapper">
                    <div className={cardClasses}>{cardContent}</div>
                  </div>
                );
              })}
            </div>
            <div className="vote-instructions">Look at your device and vote for your favorite.</div>
            <div>{`${this.state.receivedNumberOfVotes}/${this.state.expectedNumberOfVotes} votes received`}</div>
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
                const cardContent = voteResult.answer.startsWith("data:") ? (
                  <img className="uploaded-image" src={voteResult.answer} />
                ) : (
                  <h1>{voteResult.answer}</h1>
                );
                return (
                  <div className="wrapper">
                    <div className={cardClasses}>
                      {voteResult.quiplash && <div className="quiplash-text">QUIPLASH</div>}
                      {cardContent}
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
      case "SHOW_SHAKE_INSTRUCTIONS":
        // TODO theme based on shaking soda pop
        return (
          <div>
            <h1>Get ready to shake your phone up and down!</h1>
            <h2>Whoever shakes the most in five seconds, wins</h2>
            <div className="all-shake-players">{getShakeGamePlayersComponent(this.state.shakePlayers)}</div>
            <br />
            <button className="submit-form-button start-new-round-button" onClick={this.onStartShakeRoundClick}>
              Start
            </button>
          </div>
        );
      case "SHAKE_COUNTDOWN":
        return (
          <div>
            <Countdown
              date={this.state.getReadyCountdownTimer}
              renderer={({ seconds }) => <h1>{`Starting in ${seconds}`}</h1>}
              onComplete={() => {
                for (let playerName in this.state.shakePlayers) {
                  this.state.shakePlayers[playerName] = 0;
                }
                speakText(`Start shaking!`);
                this.setState({
                  phase: "START_SHAKING",
                  roundCountdownTimer: Date.now() + 5000,
                  shakePlayers: this.state.shakePlayers,
                });
              }}
            />
            <div className="all-shake-players">{getShakeGamePlayersComponent(this.state.shakePlayers)}</div>
          </div>
        );
      case "START_SHAKING":
        // TODO background music?
        // TODO winning animation?
        // TODO extract shake logic as a module similar to future games?
        return (
          <div>
            <Countdown
              date={this.state.roundCountdownTimer}
              key={this.state.roundCountdownTimer}
              renderer={countdownRenderer}
              onComplete={() => getHostSocket().emit("HOST_SHAKE_DONE")}
            />
            <div className="all-shake-players">{getShakeGamePlayersComponent(this.state.shakePlayers)}</div>
          </div>
        );
      case "SHOW_SHAKE_RESULTS":
        return (
          <div>
            <h1>{`Winner - ${this.state.gameWinner}`}</h1>
            <div className="all-shake-players">
              {getShakeGamePlayersComponent(this.state.shakePlayers, true, this.state.gamePlayersResults)}
            </div>
            <div className="button-bar">
              <button className="submit-form-button start-new-round-button" onClick={this.onStartShakeRoundClick}>
                Play Again
              </button>
              <button className="submit-form-button start-new-game-button" onClick={this.onStartNewGameNewPlayersClick}>
                Play Different Game
              </button>
            </div>
          </div>
        );
      case "SHOW_PUNCH_INSTRUCTIONS":
        return (
          <div>
            <h1>Get ready to punch while holding your phone!</h1>
            <h2>Whoever has the most powerful punch, wins</h2>
            <div className="all-shake-players">{getPunchGamePlayersComponent(this.state.punchPlayers)}</div>
            <br />
            <button className="submit-form-button start-new-round-button" onClick={this.onStartPunchRoundClick}>
              Start
            </button>
          </div>
        );
      case "PUNCH_COUNTDOWN":
        return (
          <div>
            <Countdown
              date={this.state.getReadyCountdownTimer}
              renderer={({ seconds }) => <h1>{`Starting in ${seconds}`}</h1>}
              onComplete={() => {
                for (let playerName in this.state.punchPlayers) {
                  this.state.punchPlayers[playerName] = { punchAccel: 0, state: "STARTING_PUNCH" };
                }
                speakText(`Start punching!`);
                this.setState({
                  phase: "START_PUNCHING",
                  roundCountdownTimer: Date.now() + 5000,
                  punchPlayers: this.state.punchPlayers,
                });
              }}
            />
            <div className="all-shake-players">{getPunchGamePlayersComponent(this.state.punchPlayers)}</div>
          </div>
        );
      case "START_PUNCHING":
        return (
          <div>
            <Countdown
              date={this.state.roundCountdownTimer}
              key={this.state.roundCountdownTimer}
              renderer={countdownRenderer}
              onComplete={() => getHostSocket().emit("HOST_PUNCH_DONE")}
            />
            <div className="all-shake-players">{getPunchGamePlayersComponent(this.state.punchPlayers)}</div>
          </div>
        );
      case "SHOW_PUNCH_RESULTS":
        return (
          <div>
            <h1>{`Winner - ${this.state.gameWinner}`}</h1>
            <div className="all-shake-players">
              {getPunchGamePlayersComponent(this.state.punchPlayers, true, this.state.gamePlayersResults)}
            </div>
            <div className="button-bar">
              <button className="submit-form-button start-new-round-button" onClick={this.onStartPunchRoundClick}>
                Play Again
              </button>
              <button className="submit-form-button start-new-game-button" onClick={this.onStartNewGameNewPlayersClick}>
                Play Different Game
              </button>
            </div>
          </div>
        );
      default:
        throw new Error("Invalid Host State ", this.state.phase);
    }
  }
}

function countdownRenderer({ seconds, completed }) {
  if (completed) {
    return <h1>Finished!</h1>;
  } else if (seconds === 5) {
    return <h1>Go!</h1>;
  } else {
    return <h1>{seconds}</h1>;
  }
}

function getPunchGamePlayersComponent(players, shouldShowScore = false, finalResults = {}) {
  let connectedPlayersComponent = [];
  for (let playerName in players) {
    const player = players[playerName];
    const finalResultsPlayer = finalResults[playerName];
    let punchImgSrc = chargingPunchImage;
    if (player.state === "STOPPED_PUNCH") {
      punchImgSrc = chargingPunchImage;
    } else if (player.state === "STARTING_PUNCH") {
      punchImgSrc = completedPunchImage;
    } else if (player.state === "STARTING_STRONG_PUNCH") {
      punchImgSrc = completedStrongPunchImage;
    }
    connectedPlayersComponent.push(
      <div className="shake-player-avatar" key={playerName}>
        <div>{playerName}</div>
        {shouldShowScore && <div>{`Most powerful punch: ${finalResultsPlayer.punchAccel}`}</div>}
        <img src={punchImgSrc} className="shake-image" />
      </div>,
    );
  }
  return connectedPlayersComponent;
}

function getShakeGamePlayersComponent(players, shouldShowScore = false, finalResults = {}) {
  let connectedPlayersComponent = [];
  for (let playerName in players) {
    const shakes = players[playerName];
    const finalShakes = finalResults[playerName];
    let shakeImgSrc = holdPhoneDownImage;
    if (shakes % 2 === 1) {
      shakeImgSrc = holdPhoneUpImage;
    }
    connectedPlayersComponent.push(
      <div className="shake-player-avatar" key={playerName}>
        <div>{playerName}</div>
        {shouldShowScore && <div>{`Shakes: ${finalShakes}`}</div>}
        <img src={shakeImgSrc} className="shake-image" />
      </div>,
    );
  }
  return connectedPlayersComponent;
}

function getSpokenAnswer(answer) {
  if (answer.startsWith("data:")) {
    return "this picture";
  }
  return answer;
}

export default withRouter(HostsGame);
