import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props){
    super();
    let game = [];
    game[1] = {flyers: [],badGuys: []};
    game[2] = {flyers: [],badGuys: []};
    game[3] = {flyers: [],badGuys: []};
    this.state = {
      period: 1,
      flyers: [],
      badGuys: [],
      game: game
    }
    this.scoreFlyers = this.scoreFlyers.bind(this);
    this.unscoreFlyers = this.unscoreFlyers.bind(this);
    this.unscoreBadGuys = this.unscoreBadGuys.bind(this);
    this.scoreBadGuys = this.scoreBadGuys.bind(this);
    this.periodInc = this.periodInc.bind(this);
    this.periodDec = this.periodDec.bind(this);
    this.showPeriod = this.showPeriod.bind(this);
    this.showGame = this.showGame.bind(this);
  }
  periodInc(e) {
    if (this.state.period===3){ 
      if(typeof this.state.game[4] === 'undefined') {
        let game = this.state.game;
        game.push({flyers:[], badGuys:[]})
        this.setState({game:game});
      }
    }
    if (this.state.period===4){ return; }
    let periods = this.state.game;
    periods[this.state.period] = {flyers: this.state.flyers, badGuys: this.state.badGuys};
    this.setState(state=>({ flyers: [], badGuys: [], periods: periods, period: state.period + 1}));
  }
  periodDec(e) {
    if (this.state.period===1){ return; }
    let periods = this.state.game 
    periods[this.state.period] = {flyers: this.state.flyers, badGuys: this.state.badGuys};

    this.setState(state=>({ flyers: [], badGuys: [], periods: periods, period: state.period - 1}));
  }
  scoreFlyers(e) {
    e.preventDefault();
    let flyers = this.state.game[this.state.period].flyers;
    flyers.push(1);
    this.setState({ flyers: flyers });
  }
  unscoreFlyers(e) {
    e.preventDefault();
    if (this.state.flyers===0){return;}
    let flyers = this.state.game[this.state.period].flyers;
    flyers.pop();
    this.setState({ flyers: flyers });
  }
  scoreBadGuys(e) {
    let badGuys = this.state.game[this.state.period].badGuys;
    badGuys.push(1);
    e.preventDefault();
    this.setState({ badGuys: badGuys });
  }
  unscoreBadGuys(e) {
    e.preventDefault();
    if (this.state.badGuys===0){return;}
    let badGuys = this.state.game[this.state.period].badGuys;
    badGuys.pop();
    this.setState({ badGuys: badGuys });
  }
  showPeriod(){
    if(this.state.period !== 4){
      return this.state.period;
    }
    return "OT"
  }
  showGame(){
    let game = this.state.game;
    let flyers = game.map((period,i) => {
      return (<div>
                <div className="boxScorePeriod">{i===4?"OT":i}</div>
                <div className="boxScore">{period.flyers.reduce((a, b) => a + b, 0)}</div>
                <div className="boxScore">{period.badGuys.reduce((a, b) => a + b, 0)}</div>
              </div>)
    })
    return flyers;
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="period">
            <div>Period</div>
            <button className="period" onClick={this.periodDec}>-</button>
            <div className="label">{this.showPeriod()}</div>
            <button className="period" onClick={this.periodInc}>+</button>
          </div>
          <div className="container">
          <div className="boxScorePeriod">Period</div>
          <div className="boxScore">Flyers</div>
          <div className="boxScore">BadGuys</div>
          {this.showGame()}
          <div className="one">
            <div className="name">Flyers</div>
            <button className="add" onClick={this.scoreFlyers}>+</button>
            <button className="subtract" onClick={this.unscoreFlyers}>-</button>
          </div>
          <div className="two">
            <div className="name" >Bad Guys </div>
            <button className="add" onClick={this.scoreBadGuys}>+</button>
            <button className="subtract" onClick={this.unscoreBadGuys}>-</button>
          </div>
        </div>
        </header>
      </div>
    );
  }
}

export default App;
