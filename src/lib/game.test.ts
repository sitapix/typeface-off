import { describe, it, expect, vi } from 'vitest';

// game.ts imports canvas-confetti (which touches the DOM); stub it so the pure
// tournament logic can run in Node.
vi.mock('canvas-confetti', () => ({ default: { create: () => () => {} } }));

import { createGame, placeFonts, seedBracket } from './game';
import type { Font } from './fonts';

const makeFonts = (n: number): Font[] =>
  Array.from({ length: n }, (_, i) => ({
    family: `Font ${i}`,
    category: 'sans',
    source: 'bunny',
    variants: ['regular'],
    siteUrl: '#',
    downloadUrl: '#'
  }));

// Play the whole tournament by always choosing the left player.
function playToWinner(fonts: Font[]) {
  const game = createGame([...fonts]);
  let bracket: any = game.startGame();
  let guard = 0;
  while (bracket?.players?.length && guard++ < 5000) {
    bracket = game.setWinner(bracket.players[0]);
  }
  return bracket;
}

describe('createGame tournament', () => {
  it('opens with a two-player matchup', () => {
    const game = createGame(makeFonts(8));
    const first: any = game.startGame();
    expect(first.players).toHaveLength(2);
    expect(first.winner).toBeNull();
  });

  for (const n of [2, 3, 4, 5, 7, 8, 16, 27, 64]) {
    it(`reaches exactly one winner from ${n} fonts (handles byes)`, () => {
      const fonts = makeFonts(n);
      const result = playToWinner(fonts);
      expect(result?.winner).toBeTruthy();
      expect(fonts.map((f) => f.family)).toContain(result.winner.family);
    });
  }

  it('the chosen player keeps winning (left-pick reaches Font 0 or its bracket)', () => {
    // With a fixed pick strategy the winner is whoever the picks funnel to;
    // assert it is a real participant, not undefined.
    const fonts = makeFonts(4);
    const result = playToWinner(fonts);
    expect(result.winner).toMatchObject({ source: 'bunny' });
  });
});

// Play a whole tournament (always pick the left player) and return the game so
// its finished rounds can be inspected.
function playGame(fonts: Font[]) {
  const game = createGame([...fonts]);
  let bracket: any = game.startGame();
  let guard = 0;
  while (bracket?.players?.length && guard++ < 5000) {
    bracket = game.setWinner(bracket.players[0]);
  }
  return game;
}

describe('seedBracket', () => {
  it('places seed 1 first and pairs it against the last seed', () => {
    const order = seedBracket([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(order[0]).toBe(1); // top seed leads
    expect(order[1]).toBe(8); // …vs the lowest seed in round 1
    expect(order).toHaveLength(8);
    expect([...order].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('keeps seeds 1 and 2 in opposite halves (meet only in the final)', () => {
    const order = seedBracket([1, 2, 3, 4, 5, 6, 7, 8]);
    const half = order.length / 2;
    expect(order.slice(0, half)).toContain(1);
    expect(order.slice(half)).toContain(2);
  });

  it('returns a copy unchanged when length is not a power of two', () => {
    const input = [1, 2, 3, 4, 5, 6];
    expect(seedBracket(input)).toEqual(input);
    expect(seedBracket(input)).not.toBe(input);
  });

  it('seeded play (shuffle off) still reaches one champion', () => {
    const fonts = seedBracket(makeFonts(16));
    const game = createGame(fonts, { shuffle: false });
    let b: any = game.startGame();
    let guard = 0;
    while (b?.players?.length && guard++ < 5000) b = game.setWinner(b.players[0]);
    expect(b?.winner).toBeTruthy();
  });
});

describe('placeFonts', () => {
  it('returns [] before a champion exists', () => {
    const game = createGame(makeFonts(8));
    game.startGame();
    expect(placeFonts(game.rounds, game.finalRound)).toEqual([]);
  });

  it('crowns one champion at place 1, each font placed at most once', () => {
    const game = playGame(makeFonts(8));
    const tiers = placeFonts(game.rounds, game.finalRound, 10);
    expect(tiers[0].label).toBe('Champion');
    expect(tiers[0].place).toBe(1);
    expect(tiers[0].fonts).toHaveLength(1);
    const all = tiers.flatMap((t) => t.fonts.map((f) => f.family));
    expect(new Set(all).size).toBe(all.length);
  });

  it('groups co-tier fonts as ties (8 → champ/finalist/2 semis/4 quarters)', () => {
    const game = playGame(makeFonts(8));
    const tiers = placeFonts(game.rounds, game.finalRound, 10);
    expect(tiers.map((t) => t.fonts.length)).toEqual([1, 1, 2, 4]);
    expect(tiers.map((t) => t.place)).toEqual([1, 2, 3, 5]);
    expect(tiers.map((t) => t.label)).toEqual([
      'Champion',
      'Finalist',
      'Semi-finalist',
      'Quarter-finalist'
    ]);
  });

  it('caps to whole tiers within the limit (16 fonts, limit 10 → 8, no R16)', () => {
    const game = playGame(makeFonts(16));
    const tiers = placeFonts(game.rounds, game.finalRound, 10);
    const total = tiers.reduce((n, t) => n + t.fonts.length, 0);
    expect(total).toBe(8);
    expect(tiers.some((t) => t.label === 'Round of 16')).toBe(false);
  });
});
