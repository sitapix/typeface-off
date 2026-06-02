import confetti from 'canvas-confetti';
import type { Font } from './fonts';

export interface Matchup {
  players: Font[];
  winner: Font | null;
}
export type Round = Matchup[];

/**
 * What startGame()/setWinner() hand back: an active matchup to decide, or the
 * final champion ({ winner }), or undefined when there's nothing to do. Both
 * fields are optional so callers can read `.players?.length` / `.winner`
 * without narrowing.
 */
export interface MatchupResult {
  players?: Font[];
  winner?: Font | null;
}

export interface Tournament {
  rounds: Round[];
  currentRound: number;
  finalRound: number | null;
  startGame(): MatchupResult | undefined;
  setWinner(selectedPlayer: Font): MatchupResult | undefined;
  createNextRound(): void;
  getNextMatchup(): Matchup | undefined;
}

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

export function createGame(
  initialPlayers: Font[],
  options: { shuffle?: boolean } = {}
): Tournament {
  function shuffleArray(array: Font[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Default: shuffle for random first-round pairings. Pass { shuffle: false }
  // to keep a pre-seeded order (see seedBracket) for comparable, fair brackets.
  if (options.shuffle ?? true) shuffleArray(initialPlayers);

  const tournament: Tournament = {
    rounds: [],
    currentRound: -1,
    finalRound: null,

    startGame() {
      const nextMatchup = this.getNextMatchup();
      if (!nextMatchup) {
        this.createNextRound();
        return this.getNextMatchup();
      }
      return nextMatchup;
    },

    setWinner(selectedPlayer: Font) {
      const matchup = this.getNextMatchup();
      const chosen = matchup?.players.find(
        (player) => player.family === selectedPlayer.family
      );
      if (!matchup || !chosen) {
        console.error('Invalid winner or no available matchup.');
        return;
      }

      matchup.winner = chosen;

      const nextMatchup = this.startGame();
      if (nextMatchup) {
        return nextMatchup;
      }

      this.finalRound = this.currentRound;
      return { winner: chosen };
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
          this.rounds[this.currentRound].push({ players, winner: players[0] });
        } else {
          this.rounds[this.currentRound].push({ players, winner: null });
        }
      }
    },

    getNextMatchup() {
      const currentRoundMatches = this.rounds[this.currentRound];
      return (
        currentRoundMatches &&
        currentRoundMatches.find((match) => !match.winner)
      );
    }
  };

  return tournament;
}

/**
 * Reorder a ranked list (index 0 = top seed) into standard single-elimination
 * bracket order, so that pairing the result sequentially (0v1, 2v3, …) yields
 * seed 1 vs last, with seeds 1 and 2 kept in opposite halves — favorites only
 * meet in later rounds. Requires a power-of-two length; otherwise returns a
 * copy unchanged. Pure — unit tested.
 */
export function seedBracket<T>(seeds: T[]): T[] {
  const n = seeds.length;
  if (n < 2 || (n & (n - 1)) !== 0) return seeds.slice();
  let order = [0];
  for (let size = 1; size < n; size *= 2) {
    const total = size * 2 - 1;
    const next: number[] = [];
    for (const p of order) {
      next.push(p);
      next.push(total - p);
    }
    order = next;
  }
  return order.map((i) => seeds[i]);
}

export interface PlacementTier {
  /** 1-based finishing place; tied fonts share it (e.g. two 3rd-place semis). */
  place: number;
  /** 'Champion', 'Finalist', 'Semi-finalist', 'Quarter-finalist', 'Round of N'. */
  label: string;
  fonts: Font[];
}

function tierLabel(roundsFromFinal: number): string {
  if (roundsFromFinal === 0) return 'Finalist';
  if (roundsFromFinal === 1) return 'Semi-finalist';
  if (roundsFromFinal === 2) return 'Quarter-finalist';
  return `Round of ${2 ** (roundsFromFinal + 1)}`;
}

/**
 * Derive bracket placement tiers from a finished tournament. Fonts are grouped
 * by the round they were knocked out in — co-tier fonts never faced each other,
 * so they genuinely tie and share a place. Champion first, then whole tiers
 * downward until adding the next would exceed `limit` (tiers are never split).
 * Pure — unit tested.
 */
export function placeFonts(
  rounds: Round[],
  finalRound: number | null,
  limit = 10
): PlacementTier[] {
  if (finalRound == null) return [];
  const champion = rounds[finalRound]?.[0]?.winner;
  if (!champion) return [];

  // The engine appends a champion-only bye round at `finalRound`; the actual
  // final (where the finalist lost) is the round before it.
  const realFinal = finalRound - 1;

  const tiers: PlacementTier[] = [
    { place: 0, label: 'Champion', fonts: [champion] }
  ];

  for (let r = realFinal; r >= 0; r--) {
    const losers: Font[] = [];
    for (const m of rounds[r] ?? []) {
      if (m.players.length === 2 && m.winner) {
        const loser = m.players.find((p) => p.family !== m.winner!.family);
        if (loser) losers.push(loser);
      }
    }
    if (losers.length)
      tiers.push({ place: 0, label: tierLabel(realFinal - r), fonts: losers });
  }

  // Assign places (champion = 1; each subsequent tier ties at the next slot).
  let running = 0;
  for (const tier of tiers) {
    tier.place = running + 1;
    running += tier.fonts.length;
  }

  // Cap to whole tiers within `limit` (always keep the champion tier).
  const out: PlacementTier[] = [];
  let count = 0;
  for (const tier of tiers) {
    if (out.length && count + tier.fonts.length > limit) break;
    out.push(tier);
    count += tier.fonts.length;
  }
  return out;
}
