import { useEffect, useState } from "react";
import { winningScore } from "./scoring";
import { EditText } from "react-edit-text";
import "react-edit-text/dist/index.css";
import { listGames, deleteGame, updateGame } from "./games";
import type { SavedGame, PeriodScore } from "./types";

interface GameListProps {
  onClose: () => void;
}

function MiniBoxScore({ homeTeam, badGuys, game }: { homeTeam: string; badGuys: string; game: PeriodScore[] }) {
  const flyersTotal = game.reduce((a, p) => a + p.flyers, 0);
  const badGuysTotal = game.reduce((a, p) => a + p.badGuys, 0);
  return (
    <table className="miniBoxScore">
      <thead>
        <tr>
          <th />
          {game.map((_, i) => <th key={i}>{i === 3 ? "OT" : i + 1}</th>)}
          <th>T</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="miniBoxScoreTeam">{homeTeam}</td>
          {game.map((p, i) => <td key={i} className={winningScore(p.flyers, p.badGuys) ? "winningScore" : ""}>{p.flyers}</td>)}
          <td><strong>{flyersTotal}</strong></td>
        </tr>
        <tr>
          <td className="miniBoxScoreTeam">{badGuys}</td>
          {game.map((p, i) => <td key={i} className={winningScore(p.badGuys, p.flyers) ? "winningScore" : ""}>{p.badGuys}</td>)}
          <td><strong>{badGuysTotal}</strong></td>
        </tr>
      </tbody>
    </table>
  );
}

function GameItem({ g, expanded, onToggle, onDelete, onUpdate }: {
  g: SavedGame;
  expanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<SavedGame, "homeTeam" | "badGuys">>) => void;
}) {
  const flyersTotal = g.game.reduce((a, p) => a + p.flyers, 0);
  const badGuysTotal = g.game.reduce((a, p) => a + p.badGuys, 0);

  return (
    <div className="gameListItem">
      <div className="gameListDate">{new Date(g.savedAt).toLocaleString()}</div>
      <div className="gameListRow">
        <div className="gameListScore">
          <EditText
            className="savedGameTeamName"
            defaultValue={g.homeTeam}
            onSave={({ value }) => onUpdate(g.id, { homeTeam: value })}
          />
          <span className={winningScore(flyersTotal, badGuysTotal) ? "winningScore" : ""}>{flyersTotal}</span>
          {" – "}
          <span className={winningScore(badGuysTotal, flyersTotal) ? "winningScore" : ""}>{badGuysTotal}</span>
          <EditText
            className="savedGameTeamName"
            defaultValue={g.badGuys}
            onSave={({ value }) => onUpdate(g.id, { badGuys: value })}
          />
        </div>
        <button type="button" className="expandButton" onClick={onToggle} aria-label="toggle box score">
          {expanded ? "▼" : "▶"}
        </button>
      </div>
      {expanded && <MiniBoxScore homeTeam={g.homeTeam} badGuys={g.badGuys} game={g.game} />}
      <button
        type="button"
        className="gameListDelete"
        onClick={() => { if (window.confirm("Delete this saved game?")) onDelete(g.id); }}
      >
        delete
      </button>
    </div>
  );
}

export default function GameList({ onClose }: GameListProps) {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    listGames().then(setGames);
  }, []);

  async function handleDelete(id: string) {
    await deleteGame(id);
    setGames(prev => prev.filter(g => g.id !== id));
  }

  async function handleUpdate(id: string, patch: Partial<Pick<SavedGame, "homeTeam" | "badGuys">>) {
    await updateGame(id, patch);
    setGames(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
  }

  return (
    <div className="gameList">
      <div className="gameListHeader">
        <h2>Saved Games</h2>
        <button type="button" className="footerButtons" onClick={onClose}>close</button>
      </div>
      {games.length === 0 && <div className="gameListEmpty">No saved games yet.</div>}
      <div className="gameListItems">
        {[...games].reverse().map(g => (
          <GameItem
            key={g.id}
            g={g}
            expanded={expandedId === g.id}
            onToggle={() => setExpandedId(prev => prev === g.id ? null : g.id)}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
}
