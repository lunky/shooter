import React, { useReducer, useEffect, useState, useCallback } from "react";
import "./App.css";
import { EditText } from "react-edit-text";
import BoxScore from "./boxscore";
import GameList from "./GameList";
import { Team, PeriodScore, SaveEvent } from "./types";
import { store } from "./store";
import { saveGame } from "./games";

const badmintonMode = import.meta.env.VITE_BadmintonMode === "true";

function initialPeriods(): PeriodScore[] {
  const periods: PeriodScore[] = [
    { flyers: 0, badGuys: 0, period: 1 },
    { flyers: 0, badGuys: 0, period: 2 },
    { flyers: 0, badGuys: 0, period: 3 },
  ];
  if (badmintonMode) periods.pop();
  return periods;
}

function opponent(who: Team): Team {
  return who === "flyers" ? "badGuys" : "flyers";
}

function vibrate() {
  try { window.navigator.vibrate(100); } catch (_) {}
}

// ---- State & reducer -------------------------------------------------------

interface GameState {
  hideResults: boolean;
  goals: PeriodScore[];
  game: PeriodScore[];
  period: number;
  last?: Team;
  savedHomeTeam?: string;
  savedBadGuys?: string;
}

type GameAction =
  | { type: "SCORE"; who: Team; delta: number }
  | { type: "GOAL"; who: Team; delta: number }
  | { type: "PERIOD_INC" }
  | { type: "PERIOD_DEC" }
  | { type: "TOGGLE_RESULTS" }
  | { type: "RESET" }
  | { type: "LOAD"; payload: Partial<GameState> }
  | { type: "SAVE_TEAM"; field: "savedHomeTeam" | "savedBadGuys"; value: string };

const initialState: GameState = {
  hideResults: false,
  goals: initialPeriods(),
  game: initialPeriods(),
  period: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SCORE": {
      const { who, delta } = action;
      if (delta < 0 && state.game[state.period][who] === 0) return state;
      if (delta > 0 && state.game[state.period][who] >= 29) return state;
      const game = state.game.map((g, i) =>
        i === state.period ? { ...g, [who]: g[who] + delta } : g
      );
      return { ...state, game, last: who };
    }
    case "GOAL": {
      const { who, delta } = action;
      if (delta < 0 && state.goals[state.period][who] === 0) return state;
      const goals = state.goals.map((g, i) =>
        i === state.period ? { ...g, [who]: g[who] + delta } : g
      );
      return { ...state, goals };
    }
    case "PERIOD_INC": {
      const { period, game, goals } = state;
      if (period === 2 && badmintonMode) return state;
      if (period === 3) return state;
      if (period === 2) {
        if (typeof game[3] !== "undefined") return state;
        return {
          ...state,
          game: [...game, { flyers: 0, badGuys: 0, period: 4 }],
          goals: [...goals, { flyers: 0, badGuys: 0, period: 4 }],
          period: 3,
        };
      }
      const need3rd = period === 1 && badmintonMode && typeof game[2] === "undefined";
      return {
        ...state,
        game: need3rd ? [...game, { flyers: 0, badGuys: 0, period: 3 }] : game,
        goals: need3rd ? [...goals, { flyers: 0, badGuys: 0, period: 3 }] : goals,
        period: period + 1,
      };
    }
    case "PERIOD_DEC":
      if (state.period === 0) return state;
      return { ...state, period: state.period - 1 };
    case "TOGGLE_RESULTS":
      return { ...state, hideResults: !state.hideResults };
    case "RESET":
      return { ...initialState, savedHomeTeam: state.savedHomeTeam, savedBadGuys: state.savedBadGuys };
    case "LOAD":
      return { ...state, ...action.payload };
    case "SAVE_TEAM":
      return { ...state, [action.field]: action.value };
  }
}

// ---- Component -------------------------------------------------------------

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [view, setView] = useState<"game" | "history">(
    () => window.location.hash === "#history" ? "history" : "game"
  );

  const navigate = useCallback((v: "game" | "history") => {
    setView(v);
    window.location.hash = v === "history" ? "history" : "";
  }, []);

  useEffect(() => {
    const handler = () => setView(window.location.hash === "#history" ? "history" : "game");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  useEffect(() => {
    Promise.all([
      store.get<Partial<GameState>>("gameState"),
      store.get<Partial<GameState>>("gamePrefs"),
    ]).then(([savedState, savedPrefs]) => {
      dispatch({ type: "LOAD", payload: { ...(savedState ?? {}), ...(savedPrefs ?? {}) } });
      setHasLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (hasLoaded) store.set("gameState", state);
  }, [state, hasLoaded]);

  const onSave = useCallback(({ name, value }: SaveEvent) => {
    if (name === "homeTeam") {
      dispatch({ type: "SAVE_TEAM", field: "savedHomeTeam", value });
      store.get<Record<string, unknown>>("gamePrefs").then(prefs =>
        store.set("gamePrefs", { ...(prefs ?? {}), savedHomeTeam: value })
      );
    }
    if (name === "badGuys") {
      dispatch({ type: "SAVE_TEAM", field: "savedBadGuys", value });
      store.get<Record<string, unknown>>("gamePrefs").then(prefs =>
        store.set("gamePrefs", { ...(prefs ?? {}), savedBadGuys: value })
      );
    }
  }, []);

  const handleScore = (who: Team, delta: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({ type: "SCORE", who, delta });
    vibrate();
  };

  const handleGoal = (who: Team, delta: number) => () => {
    dispatch({ type: "GOAL", who, delta });
    vibrate();
  };

  const handleSave = useCallback(() => {
    const { game, goals, savedHomeTeam, savedBadGuys } = state;
    saveGame({
      homeTeam: savedHomeTeam ?? import.meta.env.VITE_Flyers_name,
      badGuys: savedBadGuys ?? import.meta.env.VITE_Badguy_name,
      game,
      goals,
    }).then(() => { vibrate(); navigate("history"); });
  }, [state]);

  const { game, goals, period, hideResults, last, savedHomeTeam, savedBadGuys } = state;

  const score = last != null
    ? `${game[period][last]} serving ${game[period][opponent(last)]}`
    : "0 serving 0";

  const showPeriod = (): number | string => {
    if (period !== 3) return period + 1;
    return badmintonMode ? period : "OT";
  };

  const notResults: React.CSSProperties = hideResults ? { display: "none" } : {};
  const results: React.CSSProperties = hideResults ? {} : { display: "none" };
  const shotsName = import.meta.env.VITE_Shots_name;
  const homeTeam = savedHomeTeam ?? import.meta.env.VITE_Flyers_name;
  const badGuys = savedBadGuys ?? import.meta.env.VITE_Badguy_name;
  const periodName = import.meta.env.VITE_PeriodName ?? "Period";

  const gitHash = import.meta.env.VITE_GIT_HASH?.slice(0, 7) ?? "local";

  if (view === "history") {
    return (
      <div className="App">
        <header className="App-header">
          <GameList onClose={() => navigate("game")} />
        </header>
        <div className="gitHash">ver. {gitHash}</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="periodContainer">
          <div className="period" data-testid="periodName">
            <div>
              {" "}
              {badmintonMode ? "Badminton" : ""} {periodName}{" "}
            </div>
            <button type="button" className="period" onClick={() => { dispatch({ type: "PERIOD_DEC" }); vibrate(); }}>
              -
            </button>
            <div className="label">{showPeriod()}</div>
            <button type="button" className="period" onClick={() => { dispatch({ type: "PERIOD_INC" }); vibrate(); }}>
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
            onSave={onSave}
            game={game}
            periodName={periodName}
            badGuys={badGuys}
            badmintonMode={badmintonMode}
            hideTotals={badmintonMode}
            scoreInWords={score}
            who={last}
          />
          <div className="separator" />
          <div className="row">
          <div className="column Zone" style={notResults}>
            <EditText name="homeTeam" onSave={onSave} defaultValue={homeTeam} />{" "}
            <div className="column-content">
            <button type="button" className="add" onClick={handleScore("flyers", 1)}>+</button>
            <button type="button" className="subtract" onClick={handleScore("flyers", -1)}>-</button>
            {badmintonMode ? null : (
              <div>
                <button type="button" className="goal" onClick={handleGoal("flyers", 1)}>goal</button>
                <button type="button" className="goal" onClick={handleGoal("flyers", -1)}>-</button>
              </div>
            )}
            </div>
          </div>
          <div className="column Ztwo" style={notResults}>
            <EditText name="badGuys" onSave={onSave} defaultValue={badGuys} />{" "}
            <div className="column-content">
            <button type="button" className="add" onClick={handleScore("badGuys", 1)}>+</button>
            <button type="button" className="subtract" onClick={handleScore("badGuys", -1)}>-</button>
            {badmintonMode ? null : (
              <div>
                <button type="button" className="goal" onClick={handleGoal("badGuys", 1)}>goal</button>
                <button type="button" className="goal" onClick={handleGoal("badGuys", -1)}>-</button>
              </div>
            )}
          </div>
          </div>
          </div>
          {badmintonMode ? null : <BoxScore title="goals" homeTeam={homeTeam} game={goals} />}
          <div className="separator" />
          <button
            className="footerButtons"
            type="button"
            onClick={() => { if (window.confirm("Are you sure you want to reset?")) { dispatch({ type: "RESET" }); vibrate(); } }}
          >
            {" "}reset{" "}
          </button>
          &nbsp;&nbsp;
          <button type="button" onClick={() => { dispatch({ type: "TOGGLE_RESULTS" }); vibrate(); }} className="reset footerButtons">
            summary
          </button>
          <div className="separator" />
          <button type="button" className="footerButtons" onClick={handleSave}>
            save
          </button>
          &nbsp;&nbsp;
          <button type="button" className="footerButtons" onClick={() => navigate("history")}>
            history
          </button>
          <div className="separator" />
        </div>
      </header>
      <div className="gitHash">ver. {gitHash}</div>
    </div>
  );
}
