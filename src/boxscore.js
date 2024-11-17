import React, {Component} from 'react';

class BoxScore extends Component{
    shouldComponentUpdate(nextProps){
        return this.props.game[0]!==nextProps[0] 
        || this.props.game[1]!==nextProps[1] 
        || this.props.game[2]!==nextProps[2] 
        || ((typeof this.props.game[3] !== 'undefined') && (this.props.game[3]!==nextProps[3]));
    }
    showShots(){
        const {game} = this.props;
        let shots = game.map((period,i) => {
            return (<div key={i}>
                        <div className="boxScorePeriod">{i===3?"OT":i+1}</div>
                        <div className="boxScore">{period.flyers}</div>
                        <div className="boxScore">{period.badGuys}</div>
                    </div>)
        })
        return shots;
    }
    summary(){
        const {game, results} = this.props;
        let shots = process.env.REACT_APP_Hide_totals===true ?
            null:
        (<div style={results}>
                     <div className="total boxScorePeriod">&nbsp;</div>
                     <div className="total boxScore">{game.reduce((acc,cur) => acc + cur.flyers,0)}</div>
                     <div className="total boxScore">{game.reduce((acc,cur) => acc + cur.badGuys,0)}</div>
                    </div>)
        return shots;
    }
    render(){
        const {title,homeTeam,badGuys,periodName,scoreInWords } = this.props;
        
        return(
        <div>
          <div>{title}</div>
          <div className="boxScoreInWords">{scoreInWords}</div>
          <div className="boxScorePeriod">{periodName}</div>
          <div className="boxScore">{homeTeam}</div>
          <div className="boxScore">{badGuys}</div>
          <div>
          {this.showShots()}
          </div>
          <div>
              {this.summary()}
          </div>
          </div>)
    }
}
    
export default BoxScore;
