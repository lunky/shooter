import type { CSSProperties } from "react";
import { EditText } from "react-edit-text";
import "react-edit-text/dist/index.css";
import { Team, PeriodScore, SaveEvent } from "./types";

import { winningScore } from "./scoring";

const NBSP = String.fromCodePoint(160);

interface BoxScoreProps {
  title?: string;
  homeTeam?: string;
  badGuys?: string;
  periodName?: string;
  scoreInWords?: string;
  who?: Team;
  game: PeriodScore[];
  onSave?: (event: SaveEvent) => void;
  badmintonMode?: boolean;
  hideTotals?: boolean;
  results?: CSSProperties;
}

function Shuttle({ badmintonMode, who, side }: { badmintonMode?: boolean; who?: Team; side: Team }) {
  if (!badmintonMode) return null;
  return who === side
    ? <img alt="X" width="16" height="20" src="shuttle.gif" />
    : <span className="shuttlePlaceHolder" />;
}

export default function BoxScore({ title, homeTeam, badGuys, periodName, scoreInWords, who, game, onSave, badmintonMode, hideTotals, results }: BoxScoreProps) {
  return (
    <div>
      {badmintonMode ? <div className="boxScoreInWords">{scoreInWords}</div> : null}
      <div data-testid="title">{title}</div>
      <div />
      <div className="row">
      <div className="boxScorePeriod">{periodName}</div>
      <div className="boxScore bsFlyers">
        <EditText name="homeTeam" onSave={onSave} defaultValue={homeTeam} />{" "}
        <Shuttle badmintonMode={badmintonMode} who={who} side="flyers" />
      </div>
      <div className="boxScore bsBadGuys">
        <EditText name="badGuys" onSave={onSave} defaultValue={badGuys} />{" "}
        <Shuttle badmintonMode={badmintonMode} who={who} side="badGuys" />
      </div>
      </div>
      <div>
        {game.map((match, i) => (
          <div key={(match.period ?? 0) + 1}>
            <div className="boxScorePeriod">{i === 3 ? "OT" : i + 1}</div>
            <div className={`boxScore flyers${winningScore(match.flyers, match.badGuys) ? " winningScore" : ""}`}>{match.flyers}</div>
            <div className={`boxScore badGuys${winningScore(match.badGuys, match.flyers) ? " winningScore" : ""}`}>{match.badGuys}</div>
          </div>
        ))}
      </div>
      <div style={results}>
        <div className="total boxScorePeriod">&nbsp;</div>
        <div className="total boxScore">
          {hideTotals ? NBSP : game.reduce((acc, cur) => acc + cur.flyers, 0)}
        </div>
        <div className="total boxScore">
          {hideTotals ? NBSP : game.reduce((acc, cur) => acc + cur.badGuys, 0)}
        </div>
      </div>
    </div>
  );
}
