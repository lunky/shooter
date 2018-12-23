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
    render(){
        const {title} = this.props;
        return(
        <div>
          <div>{title}</div>
          <div className="boxScorePeriod">Period</div>
          <div className="boxScore">Flyers</div>
          <div className="boxScore">BadGuys</div>
          <div>
          {this.showShots()}
          </div>
          </div>)
    }
}
    
export default BoxScore;