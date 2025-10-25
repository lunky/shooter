import React, { Component } from "react";
import { EditText } from "react-edit-text";
import "react-edit-text/dist/index.css";

class BoxScore extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      this.props.game[0] !== nextProps[0] ||
      this.props.game[1] !== nextProps[1] ||
      this.props.game[2] !== nextProps[2] ||
      (typeof this.props.game[3] !== "undefined" && this.props.game[3] !== nextProps[3])
    );
  }
  showShots() {
    const { game } = this.props;
    const shots = game.map((match, i) => {
      return (
        <div key={(match.period ?? 0) + 1}>
          <div className="boxScorePeriod">{i === 3 ? "OT" : i + 1}</div>
          <div className="boxScore flyers">{match.flyers}</div>
          <div className="boxScore badGuys">{match.badGuys}</div>
        </div>
      );
    });
    return shots;
  }
  summary() {
    const { game, results, hideTotals } = this.props;
    const nbsp = String.fromCodePoint(160);
    const shots = (
      <div style={results}>
        <div className="total boxScorePeriod">&nbsp;</div>
        <div className="total boxScore">{hideTotals ? nbsp : game.reduce((acc, cur) => acc + cur.flyers, 0)}</div>
        <div className="total boxScore">{hideTotals ? nbsp : game.reduce((acc, cur) => acc + cur.badGuys, 0)}</div>
      </div>
    );
    return shots;
  }
  shuttle(badmintonMode, who, side) {
    return badmintonMode ? (
      who === side ? (
        <img alt="X" width="16" height="20" src="shuttle.gif" />
      ) : (
        <span className="shuttlePlaceHolder" />
      )
    ) : null;
  }
  saving = ({ name, value, previousValue }) => {
    const { onSave } = this.props;

    if (onSave != null) {
      onSave({ name, value, previousValue });
    }
    console.log(`boxscore ${name} saved as: ${value} (prev: ${previousValue})`);
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
