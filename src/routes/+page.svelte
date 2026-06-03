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
import { quickRoster, fullRoster } from '$lib/roster';
import {
  downloadElement,
  shareElement,
  renderElementToImage,
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
// The results card is shown as its rendered image (what you save/share), with
// the live card kept behind it as the capture source + a11y fallback. null
// until the first render completes for the current results.
let cardImage = $state<string | null>(null);
let cardRenderToken = 0;
let canShare = $state(false);
let sharing = $state(false);
let showBracket = $state(false);

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

// Alt text for the rendered card image, so screen readers still get the
// ranking the image now carries instead of live text.
const cardAlt = $derived.by(() => {
  if (!tiers.length) return '';
  const [winner, ...rest] = tiers.flatMap((t) => t.fonts).map((f) => f.family);
  return rest.length
    ? `Type-specimen card. Winner: ${winner}. Runners-up: ${rest.join(', ')}.`
    : `Type-specimen card. Winner: ${winner}.`;
});

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

// Two deterministic play modes (see roster.ts): Quick draws the most popular
// Google fonts straight from the catalog; Full adds every self-hosted font plus
// the FEATURED catalog promotions on top. FEATURED only needs Fontsource picks;
// populars and self-hosted fonts join automatically. Browse shows everything.
let quizMode = $state<'quick' | 'full'>('quick');

// Mode sizes for the toggle labels; the toggle hides when Full adds nothing.
const quickSize = $derived(quickRoster(data.fonts, selectedCategory).length);
const fullRosterSize = $derived(
  fullRoster(data.fonts, selectedCategory, FEATURED[selectedCategory]).length
);

// Collection label for the share card, tagged with which bracket was played so
// a Top-24 result isn't mistaken for a Full one.
const resultsLabel = $derived(
  `${quizMode === 'quick' ? 'Top' : 'Full'} ${poolSize}: ${categoryLabel(selectedCategory)}`
);

function startGame() {
  const roster =
    quizMode === 'quick'
      ? quickRoster(data.fonts, selectedCategory)
      : fullRoster(data.fonts, selectedCategory, FEATURED[selectedCategory]);
  // poolSize counts real contestants (roster − 1 = taps); seedBracket may pad
  // with null byes for a non-power-of-two roster, so measure before seeding.
  poolSize = roster.length;
  // Seed it (1vN/2v(N-1)…, top seeds get byes) so brackets are comparable and
  // favorites meet only late.
  const players = seedBracket(roster);
  game = createGame(players, { shuffle: false });
  currentBracket = game.startGame();
}

function setMode(mode: 'quick' | 'full') {
  if (quizMode === mode) return;
  quizMode = mode;
  startGame();
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

// Render the live card to the image shown on the page. Fired by the card's
// onmeasured once its metric-based sizes have landed, so the capture is of the
// final layout. The token guards against an earlier render finishing last.
async function renderCardImage() {
  if (!resultsCardEl) return;
  const token = ++cardRenderToken;
  try {
    const url = await renderElementToImage(resultsCardEl);
    if (token === cardRenderToken) cardImage = url;
  } catch {
    // Leave the live card showing as the fallback if the capture fails.
  }
}

// Drop a stale image the instant results clear, so starting a new game never
// flashes the previous winner.
$effect(() => {
  if (!tiers.length) {
    cardImage = null;
    cardRenderToken++;
  }
});
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Bracket-size toggle, shared by the desktop sidebar and the mobile filter
     bar. Caller guards on fullRosterSize > quickSize (hidden when Quick = Full). -->
{#snippet modeToggle()}
  <div
    class="btn-group preset-outlined-surface-500 flex w-full [&>*+*]:border-surface-400-600"
    role="group"
    aria-label="Bracket size">
    <button
      class="btn btn-sm flex-1 {quizMode === 'quick'
        ? 'preset-filled-primary-500'
        : ''}"
      aria-pressed={quizMode === 'quick'}
      onclick={() => setMode('quick')}>Top {quickSize}</button>
    <button
      class="btn btn-sm flex-1 {quizMode === 'full'
        ? 'preset-filled-primary-500'
        : ''}"
      aria-pressed={quizMode === 'full'}
      onclick={() => setMode('full')}>Full {fullRosterSize}</button>
  </div>
{/snippet}

<!-- The bracket tree, shared by the desktop sidebar and the mobile overlay. -->
{#snippet bracketTree()}
  <div class="font-brackets">
    {#each game?.rounds ?? [] as round, index (index)}
      {#if game?.finalRound === index}
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
            <div class="font-bracket" class:active={bracket === currentBracket}>
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
{/snippet}

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
      {#if fullRosterSize > quickSize}
        <div class="flex flex-col gap-2">
          <span class="text-sm opacity-70">Bracket size</span>
          {@render modeToggle()}
        </div>
      {/if}
      <button class="btn preset-filled-primary-500" onclick={startGame}
        >Restart Game</button>
      {#if game?.rounds.length}
        <!-- Bracket needs horizontal room; a static sidebar column on lg+. On
             mobile it's reached via the toolbar's bracket button (overlay). -->
        <div class="table-wrap hidden rounded-none p-2 lg:block">
          {@render bracketTree()}
        </div>
      {/if}
    </Sidebar>
  {/snippet}

  {#snippet pageHeader()}
    <Controls />
  {/snippet}

  <div class="h-full overflow-hidden bg-surface-50-950">
    <h1 class="sr-only">TypefaceOff — pick your favorite font</h1>
    {#if duel}
      <!-- MOBILE / TABLET: tap-to-pick duel — both fonts on screen, no scroll -->
      <div class="flex h-full flex-col p-3 pt-2 lg:hidden">
        <!-- collapsible: category filter + bracket size. Each on its own row,
             wrapping (no horizontal scroll). Sits above the toolbar so the
             toolbar's collapse control keeps a fixed spot. -->
        {#if !topCollapsed.value}
          <div class="flex shrink-0 flex-col gap-2 pb-2">
            <CategoryFilter
              categories={CATEGORIES}
              selected={selectedCategory}
              onselect={selectCategory} />
            {#if fullRosterSize > quickSize}
              {@render modeToggle()}
            {/if}
          </div>
        {/if}

        <!-- Always-visible toolbar (progress · bracket · restart · collapse). It
             sits directly above the duel in both states, so the collapse control
             doesn't jump to the middle when the chrome above is shown. The
             chevron points up to reveal that chrome, down to hide it. -->
        <div class="flex shrink-0 items-center gap-3 pb-2">
          <button
            class="btn btn-sm preset-tonal-surface shrink-0"
            onclick={() => (topCollapsed.value = !topCollapsed.value)}
            aria-label={topCollapsed.value ? 'Show controls' : 'Hide controls'}>
            <span
              class="inline-flex transition-transform duration-200"
              style="transform: rotate({topCollapsed.value ? 180 : 0}deg);">
              <Icon name="chevron" size={16} />
            </span>
            <span>{topCollapsed.value ? 'Show' : 'Hide'}</span>
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
          {#if game?.rounds.length}
            <button
              class="btn-icon preset-tonal-surface shrink-0"
              onclick={() => (showBracket = true)}
              aria-label="View bracket">
              <Icon name="bracket" size={18} />
            </button>
          {/if}
          <button
            class="btn btn-sm preset-filled-primary-500 shrink-0"
            onclick={startGame}>Restart</button>
        </div>

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
            class="relative mx-auto flex max-w-5xl flex-col gap-8 p-4 md:p-10">
            <div
              class="flex flex-col gap-2 border-t-2 border-surface-700-300 pt-8">
              <h2 class="h2 text-balance">Certificate of Distinction</h2>
              <h3 class="h4">Hereby crowned champion</h3>
            </div>
            <div class="flex flex-col items-center gap-4">
              <div
                class="text-4xl md:text-6xl"
                style="font-family: '{champion.family}'">
                {champion.family}
              </div>
              <!-- Labelled font actions: bare icons here read as "download the
                   image" next to the share card, so always show the text. Stack
                   on mobile — the family-name labels overflow a single row on a
                   phone. -->
              <FontLinks
                font={champion}
                size={20}
                showLabels
                labelClass=""
                detailLabel="Details"
                groupClass="preset-tonal-surface text-sm w-full max-w-xs flex-col sm:w-auto sm:max-w-none sm:flex-row" />
            </div>

            <!-- Shareable Top-10 placement card. The Save/Share actions are the
                 finish-and-share spine, so they sit above the (tall) poster
                 where they're reachable without scrolling past it. -->
            {#if tiers.length}
              <div class="flex flex-col items-center gap-4">
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
                <!-- The card is shown as its rendered image (exactly what Save
                     and Share produce). The live card stays mounted underneath
                     as the capture source and as the text fallback if the image
                     hasn't rendered yet or snapdom fails. -->
                <div class="relative mx-auto w-[85%] max-w-[490px]">
                  <!-- `isolate` keeps the card's inner z-10 layers in their own
                       stacking context so the overlaid image covers them fully
                       (without it, the text paints over the image). -->
                  <div
                    bind:this={resultsCardEl}
                    class="@container isolate"
                    aria-hidden={cardImage ? 'true' : undefined}>
                    <ResultsCard
                      tiers={tiers}
                      categoryLabel={resultsLabel}
                      onmeasured={renderCardImage} />
                  </div>
                  {#if cardImage}
                    <img
                      src={cardImage}
                      alt={cardAlt}
                      class="absolute inset-0 block h-full w-full" />
                  {/if}
                </div>
              </div>
            {/if}

            <h4 class="h4 text-pretty">
              For mastering the art of bézier curve pageantry, where serifs and
              counters stand heroic and triumphant in the tumultuous tournament
              of type.
            </h4>
            <div class="mt-10 hidden justify-between md:flex">
              <div>
                <p class="mb-2">__________________________</p>
                <p class="text-center">Head of Kerning</p>
              </div>
              <div>
                <p class="mb-2">__________________________</p>
                <p class="text-center">Master of Ceremonies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</AppFrame>

{#if showBracket}
  <!-- MOBILE: the full bracket as a scrollable overlay (desktop has the sidebar). -->
  <div class="fixed inset-0 z-40 flex flex-col bg-surface-50-950 lg:hidden">
    <div
      class="flex shrink-0 items-center justify-between border-b border-surface-200-800 bg-surface-100-900 p-4">
      <span class="font-semibold">Bracket</span>
      <button
        class="btn-icon preset-tonal-surface"
        onclick={() => (showBracket = false)}
        aria-label="Close bracket">
        <Icon name="x" size={22} />
      </button>
    </div>
    <div class="min-h-0 flex-1 overflow-auto p-4">
      {@render bracketTree()}
    </div>
  </div>
{/if}
