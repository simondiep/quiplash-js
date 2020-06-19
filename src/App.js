import React, { Component } from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import CreateNewGame from "./pages/host/CreateNewGame";
import HostsGame from "./pages/host/HostsGame";
import PlayerGame from "./pages/player/PlayerGame";
import JoinGame from "./pages/player/JoinGame";
import Lobby from "./pages/host/Lobby";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="centered-text colorful-background">
          <div style={{ position: "absolute", top: 0, left: 0, opacity: 0 }}>
            <Link to="/create">HOST</Link>
            <br />
            <Link to="/">JOIN</Link>
          </div>
          <Switch>
            <Route exact path="/">
              <JoinGame />
            </Route>
            <Route path="/create">
              <CreateNewGame />
            </Route>
            <Route path="/game">
              <PlayerGame />
            </Route>
            <Route path="/hostsgame">
              <HostsGame />
            </Route>
            <Route path="/lobby">
              <Lobby />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
