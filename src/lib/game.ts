import confetti from 'canvas-confetti';
import type { Font } from './fonts';

export interface Matchup {
  players: Font[];
  winner: Font | null;
}
type Round = Matchup[];

export function createConfetti(
  size: 'big' | 'small' = 'big',
  position = { x: 0.5, y: 0.5 }
) {
  const options: confetti.Options = {
    particleCount: 400,
    spread: 200,
    origin: { x: position.x, y: position.y }
  };

  if (size === 'small') {
    options.particleCount = 30;
    options.spread = 200;
    options.startVelocity = 20;
  }

  const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  confetti.create(canvas, { resize: true, useWorker: true })(options);
}

export function createGame(initialPlayers: Font[]) {
  function shuffleArray(array: Font[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  shuffleArray(initialPlayers);

  const tournament = {
    rounds: [] as Round[],
    currentRound: -1,
    finalRound: null as number | null,

    startGame(): Matchup | { winner: Font } | undefined {
      const nextMatchup = this.getNextMatchup();
      if (!nextMatchup) {
        this.createNextRound();
        return this.getNextMatchup();
      }
      return nextMatchup;
    },

    setWinner(selectedPlayer: Font): Matchup | { winner: Font } | undefined {
      const matchup = this.getNextMatchup();
      if (
        matchup &&
        matchup.players.find((player) => player.family === selectedPlayer.family)
      ) {
        matchup.winner = selectedPlayer;

        const nextMatchup = this.startGame();
        if (nextMatchup) {
          return nextMatchup;
        }

        this.finalRound = this.currentRound;
        return {
          winner: matchup.players.find(
            (player) => player.family === selectedPlayer.family
          ) as Font
        };
      } else {
        console.error('Invalid winner or no available matchup.');
      }
    },

    createNextRound() {
      this.currentRound++;
      const winners: Font[] =
        this.rounds.length > 0
          ? this.rounds[this.currentRound - 1]
              .filter((matchup) => matchup.winner)
              .map((matchup) => matchup.winner as Font)
          : initialPlayers;

      for (let i = 0; i < winners.length; i += 2) {
        this.rounds[this.currentRound] = this.rounds[this.currentRound] || [];
        const players = winners.slice(i, i + 2);
        if (players.length === 1) {
          this.rounds[this.currentRound].push({
            players,
            winner: players[0]
          });
        } else {
          this.rounds[this.currentRound].push({
            players,
            winner: null
          });
        }
      }
    },

    getNextMatchup(): Matchup | undefined {
      const currentRoundMatches = this.rounds[this.currentRound];
      return (
        currentRoundMatches &&
        currentRoundMatches.find((match) => !match.winner)
      );
    }
  };

  return tournament;
}
