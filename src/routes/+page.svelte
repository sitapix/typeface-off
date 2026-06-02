<script lang="ts">
import { onMount, tick } from 'svelte';
import {
  Icon,
  Header,
  Sidebar,
  FontHeader,
  FontLinks,
  CategoryFilter,
  Controls,
  AppFrame,
  FontPreview,
  FontDuel,
  PlayerBadge,
  WinnerBadge,
  ResultsCard,
  createGame,
  createConfetti,
  placeFonts,
  seedBracket
} from '$lib';
import type { Tournament, MatchupResult, Matchup } from '$lib/game';
import type { Font, FontCategory } from '$lib/fonts';
import { base } from '$app/paths';
import { lazyFont } from '$lib/lazyFont';
import { CATEGORIES, categoryLabel } from '$lib/categories';
import { FEATURED } from '$lib/featured';
import {
  downloadElement,
  shareElement,
  canShareFiles
} from '$lib/captureImage';
import {
  menuOpen,
  showName,
  fontSize,
  ligatures,
  topCollapsed
} from '$lib/store.svelte';

let { data } = $props();

let selectedCategory = $state<FontCategory>('sans');
let game = $state<Tournament | null>(null);
let currentBracket = $state<MatchupResult | undefined>(undefined);
let leftButton = $state<HTMLButtonElement>();
let rightButton = $state<HTMLButtonElement>();
let poolSize = $state(0);
let resultsCardEl = $state<HTMLDivElement>();
let canShare = $state(false);
let sharing = $state(false);

// Active two-player matchup vs. the crowned champion — derived views over the
// raw bracket so the template stays null-safe.
const duel = $derived(
  currentBracket?.players?.length ? (currentBracket as Matchup) : null
);
const champion = $derived(
  !duel && currentBracket?.winner ? currentBracket.winner : null
);

// Progress toward a champion. In single-elimination, deciding a winner takes
// exactly poolSize − 1 real (2-player) matchups; byes don't need a tap. We count
// decided 2-player matchups across all rounds to fill the bar as you pick.
const totalPicks = $derived(Math.max(0, poolSize - 1));
const picksMade = $derived.by(() => {
  if (!game?.rounds) return 0;
  let n = 0;
  for (const round of game.rounds)
    for (const m of round) if (m.winner && m.players.length === 2) n++;
  return n;
});
const progress = $derived(totalPicks ? Math.min(1, picksMade / totalPicks) : 0);

// Bracket-placement tiers for the shareable results card (champion → quarters).
const tiers = $derived(
  game && champion ? placeFonts(game.rounds, game.finalRound, 10) : []
);

onMount(() => {
  // The game has no mobile drawer (filters are inline + the header omits the
  // menu toggle), so make sure a drawer left open on Browse/detail doesn't
  // carry over here as an un-closeable full-screen overlay.
  menuOpen.value = false;
  canShare = canShareFiles();
  startGame();
});

function handleKeydown(event: KeyboardEvent) {
  if (!duel) return;
  if (event.key === 'ArrowLeft') chooseWinner(duel.players[0], leftButton);
  else if (event.key === 'ArrowRight')
    chooseWinner(duel.players[1], rightButton);
}

// The quiz roster per category: a hand-curated FEATURED list when one exists
// (see featured.ts), else the top-N most popular as a fallback. Kept short so
// the quiz is a quick 4-round / 15-pick bracket; the full catalog still powers
// Browse. Bump to lengthen the fallback.
const BRACKET_SIZE = 24;

function startGame() {
  const pool = data.fonts.filter((font) => font.category === selectedCategory);
  const featured = FEATURED[selectedCategory];
  // Curated roster (resolved from the catalog, in listed order) or top-N.
  const roster = featured
    ? (featured
        .map((name) => pool.find((f) => f.family === name))
        .filter(Boolean) as Font[])
    : pool.slice(0, BRACKET_SIZE);
  // poolSize counts real contestants (roster − 1 = taps); seedBracket may pad
  // with null byes for a non-power-of-two roster, so measure before seeding.
  poolSize = roster.length;
  // Seed it (1vN/2v(N-1)…, top seeds get byes) so brackets are comparable and
  // favorites meet only late.
  const players = seedBracket(roster);
  game = createGame(players, { shuffle: false });
  currentBracket = game.startGame();
}

function selectCategory(id: FontCategory) {
  selectedCategory = id;
  showName.value = false;
  startGame();
}

async function chooseWinner(player: Font, button?: HTMLElement) {
  currentBracket = game?.setWinner(player);
  if (currentBracket?.winner) {
    createConfetti();
    showName.value = true;
  } else if (button) {
    const { x, y, width, height } = button.getBoundingClientRect();
    createConfetti('small', {
      x: (x + width / 2) / window.innerWidth,
      y: (y + height / 2) / window.innerHeight
    });
  }
  await tick();
  scrollToBracket();
}

function scrollToBracket() {
  document
    .querySelector('.winner-candidate')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  document
    .querySelector('.font-bracket.active')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resultsFilename() {
  return `typeface-off-top-${selectedCategory}.jpg`;
}

async function saveImage() {
  if (resultsCardEl) await downloadElement(resultsCardEl, resultsFilename());
}

async function shareImage() {
  if (!resultsCardEl) return;
  sharing = true;
  try {
    await shareElement(resultsCardEl, resultsFilename(), 'My Top Fonts');
  } finally {
    sharing = false;
  }
}
</script>

<svelte:window onkeydown={handleKeydown} />

<AppFrame
  headerClass={topCollapsed.value ? 'hidden lg:block' : ''}
  pageHeaderClass={topCollapsed.value ? 'hidden lg:block' : ''}>
  {#snippet header()}
    <Header showMenu={false} />
  {/snippet}

  {#snippet sidebar()}
    <Sidebar>
      <div class="flex flex-col gap-2">
        <span class="text-sm opacity-70">Filter by type</span>
        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategory}
          onselect={selectCategory} />
      </div>
      <button class="btn preset-filled-primary-500" onclick={startGame}
        >Restart Game</button>
      {#if game?.rounds.length}
        <!-- Bracket needs horizontal room; show it only where the sidebar is
             static (lg+). On smaller screens the inline filters cover control. -->
        <div class="table-wrap hidden rounded-none p-2 lg:block">
          <div class="font-brackets">
            {#each game.rounds as round, index (index)}
              {#if game.finalRound === index}
                <div class="round-winner">
                  <WinnerBadge>
                    <span style="font-family: '{round[0].winner?.family}'">
                      {round[0].winner?.family}
                    </span>
                  </WinnerBadge>
                </div>
              {:else}
                <div class="bracket-round" class:first-round={index === 0}>
                  {#each round as bracket (bracket)}
                    <div
                      class="font-bracket"
                      class:active={bracket === currentBracket}>
                      {#each bracket.players as font (font.family)}
                        <PlayerBadge
                          class={bracket.winner?.family == font.family
                            ? 'preset-tonal-primary'
                            : 'preset-tonal-surface'}>
                          <span use:lazyFont={font.family}>
                            {showName.value ? font.family : 'ABC abc 123'}
                          </span>
                        </PlayerBadge>
                      {/each}
                      <div
                        class="line-bracket {bracket.players.length === 1
                          ? 'bottom-1/2'
                          : ''}">
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    </Sidebar>
  {/snippet}

  {#snippet pageHeader()}
    <Controls />
  {/snippet}

  <div class="h-full overflow-hidden bg-surface-50-950">
    <h1 class="sr-only">Font Face-Off — pick your favorite font</h1>
    {#if duel}
      <!-- MOBILE / TABLET: tap-to-pick duel — both fonts on screen, no scroll -->
      <div class="flex h-full flex-col p-3 pt-2 lg:hidden">
        <!-- always-visible toolbar: collapse chrome · progress · restart -->
        <div class="flex shrink-0 items-center gap-3 pb-2">
          <button
            class="btn-icon preset-tonal-surface shrink-0"
            onclick={() => (topCollapsed.value = !topCollapsed.value)}
            aria-label={topCollapsed.value ? 'Show controls' : 'Hide controls'}>
            <span
              class="inline-flex transition-transform duration-200"
              style="transform: rotate({topCollapsed.value ? 0 : 180}deg);">
              <Icon name="chevron" size={18} />
            </span>
          </button>
          <div
            class="h-2 flex-1 overflow-hidden rounded-full bg-surface-300-700"
            role="progressbar"
            aria-valuenow={picksMade}
            aria-valuemin={0}
            aria-valuemax={totalPicks}>
            <div
              class="h-full rounded-full bg-primary-500 transition-[width] duration-300 ease-out"
              style="width: {Math.round(progress * 100)}%">
            </div>
          </div>
          <span class="shrink-0 text-xs tabular-nums opacity-60"
            >{picksMade}/{totalPicks}</span>
          <button
            class="btn btn-sm preset-filled-primary-500 shrink-0"
            onclick={startGame}>Restart</button>
        </div>

        <!-- collapsible: category filters -->
        {#if !topCollapsed.value}
          <div class="flex shrink-0 items-center gap-2 overflow-x-auto pb-2">
            <CategoryFilter
              variant="group"
              categories={CATEGORIES}
              selected={selectedCategory}
              onselect={selectCategory} />
          </div>
        {/if}

        <FontDuel
          players={duel.players}
          fontSize={fontSize.value}
          ligatures={ligatures.value}
          showName={showName.value}
          onpick={chooseWinner} />
      </div>

      <!-- DESKTOP: side-by-side specimens with the bracket sidebar -->
      <div
        class="hidden h-full gap-4 p-4 lg:grid lg:grid-cols-2 lg:grid-rows-1">
        <div class="relative flex h-full flex-col gap-3">
          <FontHeader font={duel.players[0]} />
          <FontPreview
            class="min-h-0 flex-1 overflow-hidden rounded-lg"
            fontSize={fontSize.value}
            family={duel.players[0].family}
            category={duel.players[0].category}
            ligatures={ligatures.value} />
          <button
            bind:this={leftButton}
            class="btn preset-filled-primary-500 absolute bottom-10 left-1/2 -translate-x-1/2 shadow-xl"
            onclick={() => chooseWinner(duel.players[0], leftButton)}
            >Choose or press <kbd class="kbd">⇽</kbd></button>
        </div>
        <div class="relative flex h-full flex-col gap-3">
          <FontHeader font={duel.players[1]} />
          <FontPreview
            class="min-h-0 flex-1 overflow-hidden rounded-lg"
            fontSize={fontSize.value}
            family={duel.players[1].family}
            category={duel.players[1].category}
            ligatures={ligatures.value} />
          <button
            bind:this={rightButton}
            class="btn preset-filled-primary-500 absolute bottom-10 left-1/2 -translate-x-1/2 shadow-xl"
            onclick={() => chooseWinner(duel.players[1], rightButton)}
            >Choose or press <kbd class="kbd">⇾</kbd></button>
        </div>
      </div>
    {:else if champion}
      <div class="h-full overflow-auto">
        <div
          class="relative min-h-full overflow-hidden border-4 border-surface-950-50 bg-surface-50-950 p-6 text-center lg:p-10">
          <img
            class="absolute right-0 bottom-0 left-0 mx-auto max-w-full opacity-60"
            src="{base}/trophy.png"
            alt="Trophy of Font"
            width="395"
            height="440" />
          <div
            class="relative mx-auto flex max-w-5xl flex-col gap-12 p-4 md:p-10">
            <div
              class="flex flex-col gap-6 border-t-2 border-surface-700-300 pt-10 tracking-widest">
              <h2 class="h2">CERTIFICATE OF ABSOLUTE AWESOMENESS</h2>
              <h3 class="h4">HEREBY UNLEASHED UPON</h3>
            </div>
            <div
              class="my-4 text-4xl md:text-6xl"
              style="font-family: '{champion.family}'">
              {champion.family}
            </div>
            <FontLinks
              font={champion}
              size={24}
              showLabels
              detailLabel="View Font Detail"
              groupClass="preset-tonal-surface self-center" />

            <!-- Shareable Top-10 placement card -->
            {#if tiers.length}
              <div class="flex flex-col items-center gap-3">
                <div bind:this={resultsCardEl} class="mx-auto w-full max-w-xl">
                  <ResultsCard
                    tiers={tiers}
                    categoryLabel={categoryLabel(selectedCategory)} />
                </div>
                <div class="flex flex-wrap justify-center gap-2">
                  <button
                    class="btn preset-filled-primary-500"
                    onclick={saveImage}>
                    <Icon name="download" size={20} />
                    <span>Save as image</span>
                  </button>
                  {#if canShare}
                    <button
                      class="btn preset-tonal-surface"
                      onclick={shareImage}
                      disabled={sharing}>
                      <Icon name="external" size={20} />
                      <span>{sharing ? 'Sharing…' : 'Share'}</span>
                    </button>
                  {/if}
                </div>
              </div>
            {/if}

            <h4 class="h4">
              For mastering the art of bézier curve pageantry, where serifs and
              counters stand heroic — triumphing in the tumultuous tournament of
              type!
            </h4>
            <div class="mt-20 hidden justify-between md:flex">
              <div>
                <p class="mb-2">__________________________</p>
                <p class="text-center">HEAD OF DEPARTMENT</p>
              </div>
              <div>
                <p class="mb-2">__________________________</p>
                <p class="text-center">COORDINATOR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</AppFrame>
