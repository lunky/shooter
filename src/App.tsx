import React, { Component } from "react";
import "./App.css";
import { EditText } from "react-edit-text";
import BoxScore from "./boxscore";
import * as ls from "local-storage";
import { Team, PeriodScore, SaveEvent } from "./types";

function initialPeriods(badmintonMode: boolean): PeriodScore[] {
  const periods: PeriodScore[] = [
    { flyers: 0, badGuys: 0, period: 1 },
    { flyers: 0, badGuys: 0, period: 2 },
    { flyers: 0, badGuys: 0, period: 3 },
  ];
  if (badmintonMode) {
    periods.pop();
  }
  return periods;
}

interface AppState {
  hideResults: boolean;
  goals: PeriodScore[];
  game: PeriodScore[];
  period: number;
  score: string;
  last?: Team;
  init?: boolean;
  savedHomeTeam?: string;
  savedBadGuys?: string;
}

class App extends Component<Record<string, never>, AppState> {
  badmintonMode: boolean;

  constructor(props: Record<string, never>) {
    super(props);
    this.badmintonMode = import.meta.env.VITE_BadmintonMode === "true";
    this.state = {
      hideResults: false,
      goals: initialPeriods(this.badmintonMode),
      game: initialPeriods(this.badmintonMode),
      period: 0,
      score: "0 serving 0",
    };
  }

  componentDidMount() {
    const savedState = ls.get<Partial<AppState>>("gameState") ?? {};
    const savedPrefs = ls.get<Partial<AppState>>("gamePrefs") ?? {};
    this.setState((state) => ({ ...state, ...savedState, ...savedPrefs, init: true }));
  }

  componentDidUpdate(_prevProps: Record<string, never>, prevState: AppState) {
    if (prevState.init && prevState !== this.state) {
      ls.set("gameState", this.state);
    }
  }

  summary = () => {
    this.setState((state) => ({ hideResults: !state.hideResults }));
    this.vibrate();
  };

  reset = () => {
    this.setState({
      hideResults: false,
      goals: initialPeriods(this.badmintonMode),
      game: initialPeriods(this.badmintonMode),
      period: 0,
      score: "0 serving 0",
      last: undefined,
    });
    this.vibrate();
  };

  goalz = (who: Team, val: number) => (_e: React.MouseEvent) => {
    const { goals, period } = this.state;
    if (val < 0 && goals[period][who] === 0) {
      return;
    }
    const updated = goals.map((g, i) =>
      i === period ? { ...g, [who]: g[who] + val } : g
    );
    this.setState({ goals: updated });
    this.vibrate();
  };

  periodInc = (_e: React.MouseEvent) => {
    const { period, game, goals } = this.state;

    if (period === 1 && this.badmintonMode) {
      if (typeof game[2] === "undefined") {
        this.setState((state) => ({
          game: [...state.game, { flyers: 0, badGuys: 0, period: 3 }],
          goals: [...state.goals, { flyers: 0, badGuys: 0, period: 3 }],
        }));
      }
    }
    if (period === 2 && this.badmintonMode) {
      return;
    }
    if (period === 2) {
      if (typeof game[3] === "undefined") {
        this.setState((state) => ({
          game: [...state.game, { flyers: 0, badGuys: 0, period: 4 }],
          goals: [...state.goals, { flyers: 0, badGuys: 0, period: 4 }],
          period: state.period + 1,
        }));
      }
      return;
    }
    if (period === 3) {
      return;
    }
    this.setState((state) => ({ period: state.period + 1 }));
    this.vibrate();
  };

  periodDec = (_e: React.MouseEvent) => {
    if (this.state.period === 0) {
      return;
    }
    this.setState((state) => ({ period: state.period - 1 }));
    this.vibrate();
  };

  vibrate = () => {
    try {
      window.navigator.vibrate(100);
    } catch (_v) {}
  };

  opponent = (who: Team): Team => {
    return who === "flyers" ? "badGuys" : "flyers";
  };

  shotz = (who: Team, val: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const { game, period } = this.state;
    if (val < 0 && game[period][who] === 0) {
      return;
    }
    const updated = game.map((g, i) =>
      i === period ? { ...g, [who]: g[who] + val } : g
    );
    const cur = updated[period];
    const score = `${cur[who]} serving ${cur[this.opponent(who)]}`;
    this.setState({ last: who, score, game: updated });
    this.vibrate();
  };

  showPeriod(): number | string {
    if (this.state.period !== 3) {
      return this.state.period + 1;
    }
    if (this.badmintonMode) {
      return this.state.period;
    }
    return "OT";
  }

  onSaveApp = ({ name, value }: SaveEvent) => {
    if (name === "homeTeam") {
      const savedPrefs = ls.get<Partial<AppState>>("gamePrefs") ?? {};
      ls.set("gamePrefs", { ...savedPrefs, savedHomeTeam: value });
      this.setState({ savedHomeTeam: value });
    }
    if (name === "badGuys") {
      const savedPrefs = ls.get<Partial<AppState>>("gamePrefs") ?? {};
      ls.set("gamePrefs", { ...savedPrefs, savedBadGuys: value });
      this.setState({ savedBadGuys: value });
    }
  };

  render() {
    const { game, goals, score } = this.state;
    const notResults: React.CSSProperties = this.state.hideResults ? { display: "none" } : {};
    const results: React.CSSProperties = this.state.hideResults ? {} : { display: "none" };
    const shotsName = import.meta.env.VITE_Shots_name;
    const homeTeam = this.state.savedHomeTeam ?? import.meta.env.VITE_Flyers_name;
    const badGuys = this.state.savedBadGuys ?? import.meta.env.VITE_Badguy_name;
    const periodName = import.meta.env.VITE_PeriodName ?? "Period";
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
              hideTotals={this.badmintonMode}
              scoreInWords={score}
              who={this.state.last}
            />
            <div className="separator" />
            <div className="row">
            <div className="column Zone" style={notResults}>
              <EditText name="homeTeam" onSave={this.onSaveApp} defaultValue={homeTeam} />{" "}
              <div className="column-content">
              <button type="button" className="add" onClick={this.shotz("flyers", 1)}>
                +
              </button>
              <button type="button" className="subtract" onClick={this.shotz("flyers", -1)}>
                -
              </button>
              {this.badmintonMode ? null : (
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
            </div>
            <div className="column Ztwo" style={notResults}>
              <EditText name="badGuys" onSave={this.onSaveApp} defaultValue={badGuys} />{" "}
              <div className="column-content">
              <button type="button" className="add" onClick={this.shotz("badGuys", 1)}>
                +
              </button>
              <button type="button" className="subtract" onClick={this.shotz("badGuys", -1)}>
                -
              </button>
              {this.badmintonMode ? null : (
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
            </div>
            </div>
            {this.badmintonMode ? null : <BoxScore title="goals" homeTeam={homeTeam} game={goals} />}
            <div className="separator" />
            <button
              className="footerButtons"
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to reset?")) this.reset();
              }}
            >
              {" "}
              reset{" "}
            </button>
            &nbsp;&nbsp;
            <button type="button" onClick={this.summary} className="reset footerButtons">
              summary
            </button>
            <div className="separator" />
          </div>
        </header>
      </div>
    );
  }
}

export default App;
