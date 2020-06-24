import React, { Component } from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import CreateNewGame from "./pages/host/CreateNewGame";
import HostsGame from "./pages/host/HostsGame";
import PlayerGame from "./pages/player/PlayerGame";
import JoinGame from "./pages/player/JoinGame";
import Lobby from "./pages/host/Lobby";

class App extends Component {
  // Mobile (IOS Safari) support for 100vh so there's no scrolling
  componentDidMount() {
    window.height = window.innerHeight;

    window.addEventListener("resize", () => {
      window.height = window.innerHeight;
    });
  }

  render() {
    return (
      <Router>
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
      </Router>
    );
  }
}

export default App;
