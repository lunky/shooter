import React, { Component } from 'react';
import './App.css';
import BoxScore from './boxscore'
import ls from 'local-storage'

class App extends Component {

  constructor(props){
    super();
    this.badmintonMode = (process.env.REACT_APP_BadmintonMode==="true" || process.env.REACT_APP_BadmintonMode===true);
    this.hideGoals = (process.env.REACT_APP_Hide_goals === true|| process.env.REACT_APP_Hide_goals === "true");
    this.hideTotals = (process.env.REACT_APP_Hide_totals === true|| process.env.REACT_APP_Hide_goals === "true");
    let goals = [
      {flyers: 0, badGuys: 0},
      {flyers: 0, badGuys: 0},
      {flyers: 0, badGuys: 0},
    ];
    if(this.badmintonMode){ goals.pop();}
    let game = [
      {flyers: 0,badGuys: 0},
      {flyers: 0,badGuys: 0},
      {flyers: 0, badGuys: 0},
    ];
    if(this.badmintonMode){ game.pop();}
    this.state = {
      hideResults : false,
      goals: goals,
      game: game,
      period: 0,
      score: "0 serving 0"
    };
  }
   componentDidUpdate(prevProps, prevState) {
        if (prevState.init && prevState !== this.state) {
            ls.set('gameState', this.state);
        }
    }

  componentDidMount(){
    const savedState = ls.get('gameState') || [];
    if (savedState !== []){
        this.setState({...savedState, init:true});
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
      {flyers: 0, badGuys: 0},
    ];
    if(this.badmintonMode){ goals.pop();}
    let game = [
      {flyers: 0, badGuys: 0},
      {flyers: 0, badGuys: 0},
      {flyers: 0, badGuys: 0},
    ];
    if(this.badmintonMode){ game.pop();}
    this.setState({
      hideResults : false,
      goals: goals,
      game: game,
      period: 0,
      score: "0 serving 0",
      last: null
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
    if (this.state.period===1 && this.badmintonMode){ 
      if(typeof this.state.game[2] === 'undefined') {
        let game = this.state.game;
        game.push({flyers:0, badGuys:0})
        let goals = this.state.goals;
        goals.push({flyers:0, badGuys:0})
        this.setState({game:game,goals:goals });
      }
    }
    if ((this.state.period===2) && this.badmintonMode === true){ 
      return; 
    }
    if (this.state.period===2){ 
      if(typeof this.state.game[3] === 'undefined') {
        let game = this.state.game;
        game.push({flyers:0, badGuys:0})
        let goals = this.state.goals;
        goals.push({flyers:0, badGuys:0})
        this.setState({game:game,goals:goals });
      }
    }

    if (this.badmintonMode && this.state.period===2){ return; }
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
    try{
      window.navigator.vibrate(100);
    }catch(v){ }
  }

  opponent = (who) => {
    return who==='flyers' ? 'badGuys': 'flyers'
  }
  shotz = (who, val) => (e) => {
    e.preventDefault();
    let game = this.state.game;
    if (val<0 &&game[this.state.period][who]===0){return;}
    game[this.state.period][who] += val;
    let score = `${game[this.state.period][who]} serving ${game[this.state.period][this.opponent(who)]}`;
    this.setState({last: who, score: score, game: game});
    this.vibrate();
  }

  showPeriod(){
    if(this.state.period !== 3){
      return this.state.period +1;
    }
    else if(this.badmintonMode===true){
      return this.state.period;
    }
    return "OT"
  }

  render() {
    const {game,goals, score} = this.state;
    const notResults = this.state.hideResults ? {display: 'none'} : {}
    const results = this.state.hideResults ? {} : {display: 'none'}
    var shotsName = process.env.REACT_APP_Shots_name;
    var homeTeam = process.env.REACT_APP_Flyers_name;
    var badGuys = process.env.REACT_APP_Badguy_name;
    var periodName = process.env.REACT_APP_PeriodName ?? "Period";
    return (
      <div className="App">
        <header className="App-header">
          <div className="periodContainer">
            <div className="period">
              <div>{this.badmintonMode ? "Badminton" : ""} {periodName}</div>
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
          <BoxScore title={shotsName} homeTeam={homeTeam} 
          game={game} periodName={periodName} badGuys={badGuys} 
          badmintonMode={this.badmintonMode}
          hideTotals={this.hideTotals} scoreInWords={score} who={this.state.last} />
          <div className="separator"></div>
          
          <div className="one" style={notResults}>
            <div className="name">{homeTeam}</div>
            <button className="add" onClick={this.shotz('flyers',1)}>+</button>
            <button className="subtract" onClick={this.shotz('flyers',-1)}>-</button>
            {this.hideGoals ?  null :
               <div>
              <button className="goal" onClick={this.goalz('flyers', 1)}>goal</button>
              <button className="goal" onClick={this.goalz('flyers', -1)}>-</button>
              </div>
            }
          </div>
          <div className="two" style={notResults} >
            <div className="name" >{badGuys} </div>
            <button className="add" onClick={this.shotz('badGuys',1)}>+</button>
            <button className="subtract" onClick={this.shotz('badGuys', -1)}>-</button>
            {this.hideGoals ?  null :
            <div>
              <button className="goal" onClick={this.goalz('badGuys', 1)}>goal</button>
              <button className="goal" onClick={this.goalz('badGuys', -1)}>-</button>
            </div>
            }
          </div>
            {this.hideGoals ?  null :
          <BoxScore title="goals" homeTeam={homeTeam} game={goals} />
            }
          <div className="separator"></div>
        <button  onClick={(e) => { if (window.confirm('Are you sure you want to reset?')) this.reset() } }> reset </button>
        &nbsp;&nbsp;
        <button onClick={this.summary} className="reset">summary</button>
        </div>
        </header>
      </div>
    );
  }
}

export default App;
