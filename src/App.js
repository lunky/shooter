import React, { Component } from "react";
import "./App.css";
import BoxScore from "./boxscore";
import ls from "local-storage";

class App extends Component {
  constructor(props) {
    super();
    this.badmintonMode = process.env.REACT_APP_BadmintonMode === "true" || process.env.REACT_APP_BadmintonMode === true;
    this.hideGoals = this.badmintonMode;
    this.hideTotals = this.badmintonMode;
    const goals = [
      { flyers: 0, badGuys: 0, period: 1 },
      { flyers: 0, badGuys: 0, period: 2 },
      { flyers: 0, badGuys: 0, period: 3 },
    ];
    if (this.badmintonMode) {
      goals.pop();
    }
    const game = [
      { flyers: 0, badGuys: 0, period: 1 },
      { flyers: 0, badGuys: 0, period: 2 },
      { flyers: 0, badGuys: 0, period: 3 },
    ];
    if (this.badmintonMode) {
      game.pop();
    }
    this.state = {
      hideResults: false,
      goals: goals,
      game: game,
      period: 0,
      score: "0 serving 0",
    };
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.init && prevState !== this.state) {
      ls.set("gameState", this.state);
    }
  }

  componentDidMount() {
    const savedState = ls.get("gameState") || [];
    if (!savedState?.length) {
      // empty
      this.setState({ ...savedState, init: true });
    }
    const savedPrefs = ls.get("gamePrefs") || [];
    if (!savedPrefs?.length) {
      // empty
      this.setState({ ...savedPrefs, init: true });
    }
  }

  summary = () => {
    this.setState((state) => ({ hideResults: !state.hideResults }));
    this.vibrate();
  };
  reset = () => {
    const goals = [
      { flyers: 0, badGuys: 0, period: 1 },
      { flyers: 0, badGuys: 0, period: 2 },
      { flyers: 0, badGuys: 0, period: 3 },
    ];
    if (this.badmintonMode) {
      goals.pop();
    }
    const game = [
      { flyers: 0, badGuys: 0, period: 1 },
      { flyers: 0, badGuys: 0, period: 2 },
      { flyers: 0, badGuys: 0, period: 3 },
    ];
    if (this.badmintonMode) {
      game.pop();
    }
    this.setState({
      hideResults: false,
      goals: goals,
      game: game,
      period: 0,
      score: "0 serving 0",
      last: null,
    });
    this.vibrate();
  };
  goalz = (who, val) => (e) => {
    const goals = this.state.goals;
    if (val < 0 && goals[this.state.period][who] === 0) {
      return;
    }
    goals[this.state.period][who] += val;
    this.setState({ goals: goals });
    this.vibrate();
  };
  periodInc = (e) => {
    if (this.state.period === 1 && this.badmintonMode) {
      if (typeof this.state.game[2] === "undefined") {
        const game = this.state.game;
        game.push({ flyers: 0, badGuys: 0, period: 3 });
        const goals = this.state.goals;
        goals.push({ flyers: 0, badGuys: 0, period: 3 });
        this.setState({ game: game, goals: goals });
      }
    }
    if (this.state.period === 2 && this.badmintonMode === true) {
      return;
    }
    if (this.state.period === 2) {
      if (typeof this.state.game[3] === "undefined") {
        const game = this.state.game;
        game.push({ flyers: 0, badGuys: 0, period: 4 });
        const goals = this.state.goals;
        goals.push({ flyers: 0, badGuys: 0, period: 4 });
        this.setState({ game: game, goals: goals, period: 4 });
      }
    }

    if (this.badmintonMode && this.state.period === 2) {
      return;
    }
    if (this.state.period === 3) {
      return;
    }
    const periods = this.state.game;
    const nextPeriod = periods[this.state.period + 1];
    this.setState((state) => ({
      flyers: nextPeriod.flyers,
      badGuys: nextPeriod.badGuys,
      periods: periods,
      period: state.period + 1,
    }));
    this.vibrate();
  };
  periodDec = (e) => {
    if (this.state.period === 0) {
      return;
    }
    this.setState((state) => ({ period: state.period - 1 }));
    this.vibrate();
  };

  vibrate = () => {
    try {
      window.navigator.vibrate(100);
    } catch (v) {}
  };

  opponent = (who) => {
    return who === "flyers" ? "badGuys" : "flyers";
  };
  shotz = (who, val) => (e) => {
    e.preventDefault();
    const game = this.state.game;
    if (val < 0 && game[this.state.period][who] === 0) {
      return;
    }
    game[this.state.period][who] += val;
    const score = `${game[this.state.period][who]} serving ${game[this.state.period][this.opponent(who)]}`;
    this.setState({ last: who, score: score, game: game });
    this.vibrate();
  };

  showPeriod() {
    if (this.state.period !== 3) {
      return this.state.period + 1;
    }
    if (this.badmintonMode === true) {
      return this.state.period;
    }
    return "OT";
  }

  onSaveApp = ({ name, value, previousValue }) => {
    console.log(`app ${name} saved as: ${value} (prev: ${previousValue})`);
    if (name === "homeTeam") {
      const savedPrefs = ls.get("gamePrefs") || [];
      const save = { ...savedPrefs, savedHomeTeam: value };
      this.setState({ ...save });
      ls.set("gamePrefs", save);
    }
    if (name === "badGuys") {
      const savedPrefs = ls.get("gamePrefs") || [];
      const save = { ...savedPrefs, savedBadGuys: value };
      this.setState({ ...save });
      ls.set("gamePrefs", save);
    }
  };

  render() {
    const { game, goals, score } = this.state;
    const notResults = this.state.hideResults ? { display: "none" } : {};
    const results = this.state.hideResults ? {} : { display: "none" };
    const shotsName = process.env.REACT_APP_Shots_name;
    const homeTeam = this.state.savedHomeTeam || process.env.REACT_APP_Flyers_name;
    const badGuys = this.state.savedBadGuys || process.env.REACT_APP_Badguy_name;
    const periodName = process.env.REACT_APP_PeriodName ?? "Period";
    return (
      <div className="App">
        <header className="App-header">
          <div className="periodContainer">
            <div className="period" data-testid="periodName">
              <div>
                {" "}
                {this.badmintonMode ? "Badminton" : ""} {periodName}{" "}
              </div>
              <button type="button" className="period" onClick={this.periodDec}>
                -
              </button>
              <div className="label">{this.showPeriod()}</div>
              <button type="button" className="period" onClick={this.periodInc}>
                +
              </button>
            </div>
          </div>
          <div className="container">
            <div style={results}>
              {new Date().toLocaleString()}
              <div className="separator" />
            </div>
            <BoxScore
              title={shotsName}
              homeTeam={homeTeam}
              onSave={this.onSaveApp}
              game={game}
              periodName={periodName}
              badGuys={badGuys}
              badmintonMode={this.badmintonMode}
              hideTotals={this.hideTotals}
              scoreInWords={score}
              who={this.state.last}
            />
            <div className="separator" />
            <div className="one" style={notResults}>
              <div className="name">{homeTeam}</div>
              <button type="button" className="add" onClick={this.shotz("flyers", 1)}>
                +
              </button>
              <button type="button" className="subtract" onClick={this.shotz("flyers", -1)}>
                -
              </button>
              {this.hideGoals ? null : (
                <div>
                  <button type="button" className="goal" onClick={this.goalz("flyers", 1)}>
                    goal
                  </button>
                  <button type="button" className="goal" onClick={this.goalz("flyers", -1)}>
                    -
                  </button>
                </div>
              )}
            </div>
            <div className="two" style={notResults}>
              <div className="name">{badGuys} </div>
              <button type="button" className="add" onClick={this.shotz("badGuys", 1)}>
                +
              </button>
              <button type="button" className="subtract" onClick={this.shotz("badGuys", -1)}>
                -
              </button>
              {this.hideGoals ? null : (
                <div>
                  <button type="button" className="goal" onClick={this.goalz("badGuys", 1)}>
                    goal
                  </button>
                  <button type="button" className="goal" onClick={this.goalz("badGuys", -1)}>
                    -
                  </button>
                </div>
              )}
            </div>
            {this.hideGoals ? null : <BoxScore title="goals" homeTeam={homeTeam} game={goals} />}
            <div className="separator" />
            <button
              type="button"
              onClick={(e) => {
                if (window.confirm("Are you sure you want to reset?")) this.reset();
              }}
            >
              {" "}
              reset{" "}
            </button>
            &nbsp;&nbsp;
            <button type="button" onClick={this.summary} className="reset">
              summary
            </button>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
