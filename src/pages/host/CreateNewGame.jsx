import React from "react";
import { withRouter } from "react-router";

function CreateNewGame(props) {
  function handleClick() {
    fetch("/create-new-game", { method: "POST" })
      .then((roomCode) => roomCode.text())
      .then((roomCode) => props.history.push(`/lobby/${roomCode}`));
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
