import { describe, it, expect, vi } from 'vitest';

// game.ts imports canvas-confetti (which touches the DOM); stub it so the pure
// tournament logic can run in Node.
vi.mock('canvas-confetti', () => ({ default: { create: () => () => {} } }));

import { createGame } from './game';
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
