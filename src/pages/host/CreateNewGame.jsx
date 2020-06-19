import React from "react";
import { withRouter } from "react-router";

function CreateNewGame(props) {
  function handleClick() {
    fetch("/create-new-game", { method: "POST" })
      .then((roomCode) => roomCode.text())
      .then((roomCode) => {
        if (roomCode && roomCode.length === 4) {
          props.history.push(`/lobby/${roomCode}`);
        } else {
          throw new Error("Could not create game.  Server not responding.");
        }
      })
      .catch(() => alert("Could not create game.  Server not responding."));
  }

  return (
    <div>
      <h1>Quiplash-JS</h1>
      <button className="submit-form-button" onClick={handleClick}>
        Start new Game
      </button>
    </div>
  );
}

export default withRouter(CreateNewGame);
