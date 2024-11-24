import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import BoxScore from './boxscore';

const config  = {shotsName: "Shots",
    title: "thisisthetitle",
    homeTeam: "hometeam",
    game: [
        { flyers: 0, badGuys: 0, period: 1 },
        { flyers: 0, badGuys: 0, period: 2 },
        { flyers: 0, badGuys: 0, period: 3 },
        ],
    periodName: "period",
    badGuys: "badGuys",
    badmintonMode: true,
    hideTotals: true,
    score: "score",
    who: "nobody"
};

test("BoxScore renders Title successfully", () => {
    render( <BoxScore
              title={config.title}
              game={config.game}
              badmintonMode={config.badmintonMode}
            />
    );
    const { getByText } = within(screen.getByTestId('title'))
    expect(getByText(config.title)).toBeInTheDocument()
})
