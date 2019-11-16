import React, { Component } from 'react';
import './App.css';
import BoxScore from './boxscore'
import ls from 'local-storage'

class App extends Component {

  constructor(props){
    super();
    let goals = [
      {flyers: 0, badGuys: 0},
      {flyers: 0, badGuys: 0},
      {flyers: 0, badGuys: 0}
    ];
    let game = [
      {flyers: 0,badGuys: 0},
      {flyers: 0,badGuys: 0},
      {flyers: 0,badGuys: 0},
    ];
    this.state = {
      hideResults : false,
      goals: goals,
      game: game,
      period: 0
    };
  }
   componentDidUpdate(prevProps, prevState) {
        if (prevState !== this.state) {
            ls.set('gameState', this.state);
        }
    }

  componentDidMount(){
    const savedState = ls.get('gameState') || [];
    if (savedState !== []){
        console.log("hideresults : " + this.state.hideResults)
        this.setState(savedState);
    }
  }

  summary = () => {
    this.setState(state => ({hideResults : !state.hideResults}));
    this.vibrate();
  }
  reset = ()=>{
    let goals = [
      {flyers: 0, badGuys: 0},
      {flyers: 0, badGuys: 0},
      {flyers: 0, badGuys: 0}
    ];
    let game = [
      {flyers: 0,badGuys: 0},
      {flyers: 0,badGuys: 0},
      {flyers: 0,badGuys: 0},
    ];
    this.setState({
      hideResults : false,
      goals: goals,
      game: game,
      period: 0
    });
    this.vibrate();
  }
  goalz = (who, val) => (e) => {
    let goals = this.state.goals;
    if(val<0 && goals[this.state.period][who] === 0){ return;} 
    goals[this.state.period][who] += val;
    this.setState({goals: goals});
    this.vibrate();
  }
  periodInc = (e) => {
    if (this.state.period===2){ 
      if(typeof this.state.game[3] === 'undefined') {
        let game = this.state.game;
        game.push({flyers:0, badGuys:0})
        let goals = this.state.goals;
        goals.push({flyers:0, badGuys:0})
        this.setState({game:game,goals:goals });
      }
    }
    if (this.state.period===3){ return; }
    let periods = this.state.game;
    let nextPeriod = periods[this.state.period+1];
    this.setState(state=>({ flyers: nextPeriod.flyers, badGuys: nextPeriod.badGuys, periods: periods, period: state.period + 1}));
    this.vibrate();
  }
  periodDec = (e) =>{
    if (this.state.period===0){ return; }
    this.setState(state=>({ period: state.period - 1}));
    this.vibrate();
  }

  vibrate = () =>  {
    window.navigator.vibrate(100);
  }

  shotz = (who, val) => (e) => {
    e.preventDefault();
    let game = this.state.game;
    if (val<0 &&game[this.state.period][who]===0){return;}
    game[this.state.period][who] += val;
    this.setState({game: game});
    this.vibrate();
  }
  showPeriod(){
    if(this.state.period !== 3){
      return this.state.period +1;
    }
    return "OT"
  }
  render() {
    const {game,goals} = this.state;
    const notResults = this.state.hideResults ? {display: 'none'} : {}
    const results = this.state.hideResults ? {} : {display: 'none'}
    return (
      <div className="App">
        <header className="App-header">
          <div className="periodContainer">
            <div className="period">
              <div>Period</div>
              <button className="period" onClick={this.periodDec}>-</button>
              <div className="label">{this.showPeriod()}</div>
              <button className="period" onClick={this.periodInc}>+</button>
            </div>
          </div>
          <div className="container">
          <div style={results}>
            {new Date().toLocaleString()}
            <div className="separator"></div>
          </div>
          <BoxScore title="shots" game={game} />
          <div className="separator"></div>
          
          <div className="one" style={notResults}>
            <div className="name">Flyers</div>
            <button className="add" onClick={this.shotz('flyers',1)}>+</button>
            <button className="subtract" onClick={this.shotz('flyers',-1)}>-</button>
            <button className="goal" onClick={this.goalz('flyers', 1)}>goal</button>
            <button className="goal" onClick={this.goalz('flyers', -1)}>-</button>
          </div>
          <div className="two" style={notResults} >
            <div className="name" >Bad Guys </div>
            <button className="add" onClick={this.shotz('badGuys',1)}>+</button>
            <button className="subtract" onClick={this.shotz('badGuys', -1)}>-</button>
            <button className="goal" onClick={this.goalz('badGuys', 1)}>goal</button>
            <button className="goal" onClick={this.goalz('badGuys', -1)}>-</button>
          </div>
          <BoxScore title="goals" game={goals} />
          <div className="separator"></div>
        <button onClick={this.reset} className="reset">reset</button>
        &nbsp;&nbsp;
        <button onClick={this.summary} className="reset">summary</button>
        </div>
        </header>
      </div>
    );
  }
}

export default App;
