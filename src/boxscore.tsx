import React, { Component } from "react";
import { EditText } from "react-edit-text";
import "react-edit-text/dist/index.css";
import { Team, PeriodScore, SaveEvent } from "./types";

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
  results?: React.CSSProperties;
}

class BoxScore extends Component<BoxScoreProps> {
  showShots() {
    const { game } = this.props;
    return game.map((match, i) => (
      <div key={(match.period ?? 0) + 1}>
        <div className="boxScorePeriod">{i === 3 ? "OT" : i + 1}</div>
        <div className="boxScore flyers">{match.flyers}</div>
        <div className="boxScore badGuys">{match.badGuys}</div>
      </div>
    ));
  }

  summary() {
    const { game, results, hideTotals } = this.props;
    const nbsp = String.fromCodePoint(160);
    return (
      <div style={results}>
        <div className="total boxScorePeriod">&nbsp;</div>
        <div className="total boxScore">
          {hideTotals ? nbsp : game.reduce((acc, cur) => acc + cur.flyers, 0)}
        </div>
        <div className="total boxScore">
          {hideTotals ? nbsp : game.reduce((acc, cur) => acc + cur.badGuys, 0)}
        </div>
      </div>
    );
  }

  shuttle(badmintonMode: boolean | undefined, who: Team | undefined, side: Team) {
    if (!badmintonMode) return null;
    return who === side ? (
      <img alt="X" width="16" height="20" src="shuttle.gif" />
    ) : (
      <span className="shuttlePlaceHolder" />
    );
  }

  saving = ({ name, value, previousValue }: SaveEvent) => {
    const { onSave } = this.props;
    if (onSave != null) {
      onSave({ name, value, previousValue });
    }
  };

  render() {
    const { title, homeTeam, badGuys, periodName, scoreInWords, who, badmintonMode } = this.props;
    return (
      <div>
        {badmintonMode ? <div className="boxScoreInWords">{scoreInWords}</div> : null}
        <div data-testid="title">{title}</div>
        <div />
        <div className="row">
        <div className="boxScorePeriod">{periodName}</div>
        <div className="boxScore bsFlyers">
          <EditText name="homeTeam" onSave={this.saving} defaultValue={homeTeam} />{" "}
          {this.shuttle(badmintonMode, who, "flyers")}
        </div>
        <div className="boxScore bsBadGuys">
          <EditText name="badGuys" onSave={this.saving} defaultValue={badGuys} />{" "}
          {this.shuttle(badmintonMode, who, "badGuys")}
        </div>
        </div>
        <div>{this.showShots()}</div>
        <div>{this.summary()}</div>
      </div>
    );
  }
}

export default BoxScore;
