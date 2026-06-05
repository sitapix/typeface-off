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
  ControlsSheet,
  AppFrame,
  FontPreview,
  FontDuel,
  SpecimenEditor,
  PlayerBadge,
  WinnerBadge,
  ResultsCard,
  createGame,
  createConfetti,
  placeFonts,
  seedBracket,
  getFontByFamily
} from '$lib';
import {
  SegmentedControl,
  Dialog,
  Portal,
  Popover
} from '@skeletonlabs/skeleton-svelte';
import type { Tournament, MatchupResult, Matchup, Round } from '$lib/game';
import type { Font, FontCategory } from '$lib/fonts';
import { base } from '$app/paths';
import { lazyFont } from '$lib/lazyFont';
import { CATEGORIES, categoryLabel } from '$lib/categories';
import { FEATURED } from '$lib/featured';
import { quickRoster, fullRoster } from '$lib/roster';
import { specimenFor } from '$lib/specimenContent';
import {
  downloadElement,
  shareElement,
  renderElementToImage,
  canShareFiles
} from '$lib/captureImage';
import { toaster } from '$lib/toaster';
import {
  menuOpen,
  showName,
  fontSize,
  ligatures,
  topCollapsed,
  editMode,
  hasPlayed,
  DEFAULT_TEXT
} from '$lib/store.svelte';

let { data } = $props();

let selectedCategory = $state<FontCategory>('sans');
let game = $state<Tournament | null>(null);
let currentBracket = $state<MatchupResult | undefined>(undefined);
let leftButton = $state<HTMLButtonElement>();
let rightButton = $state<HTMLButtonElement>();
let poolSize = $state(0);
// Per-bracket counter, bumped each deal: the duel specimen rotates by this
// (seed) between games, constant within a bracket. See specimenContent.ts.
let dealCount = $state(0);
const specimenSeed = $derived(Math.max(0, dealCount - 1));
// Edit mode collapses the text duel to one editable specimen (SpecimenEditor),
// seeded with the curated passage this round is showing so you edit what's there.
const editorSeed = $derived.by(() => {
  const sp = specimenFor(selectedCategory, specimenSeed);
  return `<h1>${sp.word}</h1>${sp.html}`;
});
const textEditing = $derived(editMode.value && selectedCategory !== 'mono');
let resultsCardEl = $state<HTMLDivElement>();
// The results card is shown as its rendered image (what you save/share), with
// the live card kept behind it as the capture source + a11y fallback. null
// until the first render completes for the current results.
let cardImage = $state<string | null>(null);
let cardRenderToken = 0;
let canShare = $state(false);
let sharing = $state(false);
let showBracket = $state(false);
// Mobile specimen-settings sheet (Show Name / Ligatures / scheme / size). On
// desktop those controls live inline in the sub-header instead.
let controlsOpen = $state(false);

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
  // Resume a saved game (e.g. after tapping a font-detail link, or a refresh);
  // only deal a fresh bracket when there's nothing to restore.
  if (!restoreSavedGame()) startGame();
});

function handleKeydown(event: KeyboardEvent) {
  if (!duel) return;
  // Don't hijack arrows while a form control has focus — on the font-size
  // slider or number input, arrows mean "adjust the value". Firing the game's
  // left/right choice on top of that changes size AND advances the round. (The
  // mono code editor is read-only + non-interactive in the Game, so it never
  // holds focus here — see CodePreview's `.input-layer[readonly]`.)
  const target = event.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable)
  )
    return;
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

// --- progress persistence -------------------------------------------------
// Keep the bracket in sessionStorage so leaving the page (a font-detail link,
// an accidental tap, a refresh) and coming back resumes the game — or the
// finished result — instead of silently resetting it. Scoped to the tab, so a
// fresh tab starts a new game. Stores font families, not whole Font objects,
// and rehydrates from the catalog.
const SAVE_KEY = 'typeface-off:game:v1';

function saveGame() {
  if (typeof sessionStorage === 'undefined' || !game) return;
  try {
    sessionStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        v: 1,
        category: selectedCategory,
        mode: quizMode,
        poolSize,
        currentRound: game.currentRound,
        finalRound: game.finalRound,
        rounds: game.rounds.map((round) =>
          round.map((m) => ({
            players: m.players.map((p) => p.family),
            winner: m.winner?.family ?? null
          }))
        )
      })
    );
  } catch {
    // Storage full or unavailable — the in-memory game still works.
  }
}

function restoreSavedGame(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  let snap: {
    v?: number;
    category?: FontCategory;
    mode?: 'quick' | 'full';
    poolSize?: number;
    currentRound?: number;
    finalRound?: number | null;
    rounds?: { players: string[]; winner: string | null }[][];
  };
  try {
    const raw = sessionStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    snap = JSON.parse(raw);
  } catch {
    return false;
  }
  if (snap.v !== 1 || !Array.isArray(snap.rounds) || !snap.rounds.length)
    return false;

  // Rehydrate every font from the catalog. If a saved name is gone (the roster
  // changed between builds), abandon the restore and start fresh rather than
  // render a broken bracket.
  const rounds: Round[] = [];
  for (const round of snap.rounds) {
    const rebuilt: Matchup[] = [];
    for (const m of round) {
      const players = m.players
        .map((f) => getFontByFamily(f))
        .filter(Boolean) as Font[];
      if (players.length !== m.players.length) return false;
      const winner = m.winner ? (getFontByFamily(m.winner) ?? null) : null;
      if (m.winner && !winner) return false;
      rebuilt.push({ players, winner });
    }
    rounds.push(rebuilt);
  }

  const restored = createGame([], { shuffle: false });
  restored.rounds = rounds;
  restored.currentRound = snap.currentRound ?? rounds.length - 1;
  restored.finalRound = snap.finalRound ?? null;

  if (snap.category) selectedCategory = snap.category;
  if (snap.mode) quizMode = snap.mode;
  if (typeof snap.poolSize === 'number') poolSize = snap.poolSize;
  game = restored;

  // Drive the engine through the reactive `game` proxy (as startGame does), not
  // the raw object, so resumed play stays tracked.
  if (game.finalRound != null) {
    const champ = game.rounds[game.finalRound]?.[0]?.winner ?? null;
    currentBracket = champ ? { winner: champ } : game.startGame();
    if (champ) showName.value = true;
  } else {
    currentBracket = game.startGame();
  }
  return true;
}

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
  dealCount += 1;
  saveGame();
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

// The logo / Game link clicked while already on the game route. On a finished
// result it's the obvious "start over" escape; mid-game we leave the in-progress
// bracket alone (you aren't stuck there — the duel and its toolbar are present).
function goHome() {
  if (champion) startGame();
}

async function chooseWinner(player: Font, button?: HTMLElement) {
  // The first pick ever dismisses the one-time how-to-play prompt, for good.
  if (!hasPlayed.value) hasPlayed.value = true;
  currentBracket = game?.setWinner(player);
  saveGame();
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
  return `typeface-off-top-${selectedCategory}.webp`;
}

async function saveImage() {
  if (!resultsCardEl) return;
  try {
    await downloadElement(resultsCardEl, resultsFilename());
    toaster.success({
      title: 'Image saved',
      description: 'Your Top Fonts card is in your downloads.'
    });
  } catch {
    toaster.error({
      title: "Couldn't save image",
      description: "The image didn't generate. Please try again."
    });
  }
}

async function shareImage() {
  if (!resultsCardEl) return;
  sharing = true;
  try {
    await shareElement(resultsCardEl, resultsFilename(), 'My Top Fonts');
  } catch (err) {
    // Dismissing the native share sheet rejects with AbortError — that's a user
    // cancel, not a failure, so stay quiet. Anything else is a real error.
    if (!(err instanceof DOMException && err.name === 'AbortError')) {
      toaster.error({
        title: "Couldn't share image",
        description: "The image didn't generate. Please try again."
      });
    }
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

// Desktop sidebar bracket: the full tree (rounds laid out as side-by-side
// columns) is far wider than the sidebar, which used to force a horizontal
// scrollbar. Scale the whole tree down to fit the available width — a glanceable
// minimap, never a scroll. Re-fits on width changes (ResizeObserver) and when
// the bracket changes shape (a pick advances a round, or names toggle).
// Attachment on the `.bracket-fit` host: syncing layout to an external observer
// is exactly the case {@attach} is for, so it owns its ResizeObserver and
// teardown instead of an $effect + bind:this. Re-runs when the deps read below
// change (the tree grows, a pick advances a round, or names toggle).
function fitBracket(host: HTMLDivElement) {
  // Reactive deps: refit when the tree grows or the badge labels change width.
  void game?.rounds.length;
  void picksMade;
  void showName.value;

  const fit = () => {
    const inner = host.querySelector('.font-brackets');
    if (!(inner instanceof HTMLElement)) return;
    // scrollWidth/Height are layout-based, so they report the natural (untransformed)
    // size even while a scale() is applied — safe to measure without resetting.
    const avail = host.clientWidth;
    const natural = inner.scrollWidth;
    const scale = natural > avail && avail > 0 ? avail / natural : 1;
    inner.style.transformOrigin = 'top left';
    inner.style.transform = scale < 1 ? `scale(${scale})` : '';
    // transform is visual only, so collapse the leftover box to the scaled height.
    host.style.height = `${inner.scrollHeight * scale}px`;
  };

  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => ro.disconnect();
}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Bracket-size toggle, shared by the desktop sidebar and the mobile filter
     bar. Caller guards on fullRosterSize > quickSize (hidden when Quick = Full). -->
{#snippet modeToggle()}
  <SegmentedControl
    value={quizMode}
    onValueChange={(d) => setMode(d.value as 'quick' | 'full')}
    aria-label="Bracket size"
    class="btn-group preset-outlined-surface-500 flex w-full">
    <SegmentedControl.Item
      value="quick"
      class="btn btn-sm flex-1 cursor-pointer data-[state=checked]:preset-filled-primary-500">
      <SegmentedControl.ItemText>Top {quickSize}</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
    <SegmentedControl.Item
      value="full"
      class="btn btn-sm flex-1 cursor-pointer data-[state=checked]:preset-filled-primary-500">
      <SegmentedControl.ItemText
        >Full {fullRosterSize}</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
  </SegmentedControl>
{/snippet}

<!-- The bracket tree, shared by the desktop sidebar and the mobile overlay. -->
{#snippet bracketTree()}
  <div class="font-brackets" aria-hidden="true">
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
                  <span {@attach lazyFont(font.family)}>
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

<!-- One-time how-to-play prompt by the duel: frames the single decision (which
     font do you prefer?) and the arc (a champion gets crowned). Gated on the
     persisted `hasPlayed` flag, so a returning player never sees it again. Used
     in both the mobile and desktop duel blocks. -->
{#snippet duelPrompt()}
  {#if !hasPlayed.value && !editMode.value}
    <div class="shrink-0 pb-3 text-center">
      <p class="text-sm font-semibold lg:text-base">
        Which {categoryLabel(selectedCategory)} font do you prefer?
      </p>
      <p class="mt-0.5 text-xs text-surface-800-200">
        Pick a winner each round until one font is crowned.
      </p>
    </div>
  {/if}
{/snippet}

<AppFrame
  headerClass={!champion && topCollapsed.value ? 'hidden lg:block' : ''}
  pageHeaderClass={champion ? 'hidden' : 'hidden lg:block'}
  onhome={goHome}>
  {#snippet header()}
    <Header showMenu={false} onhome={goHome} />
  {/snippet}

  {#snippet sidebar()}
    <Sidebar drawer={false}>
      <div class="flex flex-col gap-2">
        <span class="eyebrow text-surface-800-200">Filter by type</span>
        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategory}
          onselect={selectCategory} />
      </div>
      {#if fullRosterSize > quickSize}
        <div class="flex flex-col gap-2">
          <span class="eyebrow text-surface-800-200">Bracket size</span>
          {@render modeToggle()}
        </div>
      {/if}
      <button class="btn preset-filled-primary-500" onclick={startGame}
        >Restart game</button>
      {#if game?.rounds.length}
        <!-- Full bracket as a glanceable minimap: the tree is wider than the
             sidebar, so bracket-fit scales it down to the column width (no
             horizontal scroll). On mobile it's the toolbar's bracket overlay. -->
        <div class="hidden p-2 lg:block">
          <div class="bracket-fit" {@attach fitBracket}>
            {@render bracketTree()}
          </div>
        </div>
      {/if}
    </Sidebar>
  {/snippet}

  {#snippet pageHeader()}
    <!-- Desktop specimen-display settings tucked behind one quiet Popover, so the
         duel (the single decision) owns first contact instead of an always-on bar
         of refinements. Same Controls as the mobile sheet, just disclosed. -->
    <div
      class="flex items-center justify-end border-b border-surface-200-800 bg-surface-100-900 px-4 py-2">
      <Popover positioning={{ placement: 'bottom-end' }}>
        <Popover.Trigger class="btn btn-sm preset-tonal-surface gap-1.5">
          <Icon name="settings" size={16} />
          <span>Display</span>
          <Icon name="chevron" size={14} />
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content
              class="card z-50 w-80 border border-surface-200-800 bg-surface-100-900 shadow-xl">
              <Controls inSheet category={selectedCategory} />
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover>
    </div>
  {/snippet}

  <div class="h-full overflow-hidden bg-surface-50-950">
    <h1 class="sr-only">TypefaceOff: pick your favorite font</h1>
    {#if duel}
      {#if textEditing}
        <!-- Edit mode (text categories): the duel collapses to ONE editable
             specimen — the SSOT. What you type here shows in every font, both
             halves, and every later round. Mono keeps its in-place code editing. -->
        <div class="flex h-full flex-col p-3 pt-2 lg:p-4">
          <p class="mb-2 shrink-0 text-center text-sm opacity-70">
            Editing your sample. It shows in every font, every round.
          </p>
          <SpecimenEditor class="min-h-0 flex-1" seedHtml={editorSeed} />
        </div>
      {:else}
        <!-- MOBILE / TABLET: tap-to-pick duel — both fonts on screen, no scroll -->
        <div class="flex h-full flex-col p-3 pt-2 lg:hidden">
          {#if editMode.value}
            <!-- Friendly heads-up: tapping types now, not picks. One tap out. -->
            <div
              class="mb-2 flex shrink-0 items-center gap-2 rounded-lg preset-tonal-primary px-3 py-2 text-sm">
              <Icon name="edit" size={16} />
              <span class="flex-1 leading-snug"
                >Edit mode: type your sample, and it shows in every matchup.</span>
              <button
                class="btn btn-sm preset-filled-primary-500 shrink-0"
                onclick={() => (editMode.value = false)}>Done editing</button>
            </div>
          {/if}
          <!-- collapsible: category filter + bracket size. Each on its own row,
             wrapping (no horizontal scroll). Sits above the toolbar so the
             toolbar's collapse control keeps a fixed spot. -->
          {#if !topCollapsed.value}
            <div class="landscape-hide flex shrink-0 flex-col gap-2 pb-2">
              <CategoryFilter
                categories={CATEGORIES}
                selected={selectedCategory}
                onselect={selectCategory} />
              {#if fullRosterSize > quickSize}
                {@render modeToggle()}
              {/if}
              <!-- Mobile entry into edit mode. It was only reachable via the
                   Settings sheet (behind a size-looking pill), so nobody found
                   it; here it sits with the other pre-play setup, labelled. For
                   text it swaps the duel for the editor; for mono it makes the
                   code typeable. The editor's Done button / the mono banner turn
                   it back off, so this doubles as the toggle. -->
              <button
                type="button"
                class="btn btn-sm w-full gap-1.5 {editMode.value
                  ? 'preset-filled-primary-500'
                  : 'preset-tonal-surface'}"
                aria-pressed={editMode.value}
                onclick={() => (editMode.value = !editMode.value)}>
                <Icon name="edit" size={16} />
                <span
                  >{editMode.value
                    ? 'Editing your sample'
                    : 'Type your own sample'}</span>
              </button>
            </div>
          {/if}

          <!-- Always-visible toolbar (progress · bracket · restart · collapse). It
             sits directly above the duel in both states, so the collapse control
             doesn't jump to the middle when the chrome above is shown. The
             chevron points up to reveal that chrome, down to hide it. -->
          <div class="flex shrink-0 items-center gap-3 pb-2">
            <button
              class="btn btn-sm preset-tonal-surface landscape-hide shrink-0"
              onclick={() => (topCollapsed.value = !topCollapsed.value)}
              aria-label={topCollapsed.value ? 'Show filters' : 'Hide filters'}>
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
              aria-label="Tournament progress"
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
            <!-- Specimen-settings trigger, foregrounding font size (the most-fiddled
               control): a clearly-bordered pill with the sliders icon + current
               size, so it reads as a tappable control, not a status readout. -->
            <button
              class="btn btn-sm preset-outlined-surface-500 shrink-0 gap-1.5"
              onclick={() => (controlsOpen = true)}
              aria-haspopup="dialog"
              aria-expanded={controlsOpen}
              aria-label="Specimen settings, text size {fontSize.value}">
              <Icon name="sliders" size={15} />
              <span class="font-semibold leading-none" aria-hidden="true"
                ><span class="text-[1.05em]">A</span><span class="text-[0.8em]"
                  >a</span
                ></span>
              <span class="text-xs tabular-nums opacity-80"
                >{fontSize.value}px</span>
            </button>
            {#if game?.rounds.length}
              <button
                class="btn-icon preset-tonal-surface shrink-0"
                onclick={() => (showBracket = true)}
                aria-label="View bracket">
                <Icon name="bracket" size={18} />
              </button>
            {/if}
          </div>

          {@render duelPrompt()}

          <FontDuel
            players={duel.players}
            fontSize={fontSize.value}
            ligatures={ligatures.value}
            showName={showName.value}
            seed={specimenSeed}
            onpick={chooseWinner} />
        </div>

        <!-- DESKTOP: prompt above, side-by-side specimens, bracket in the sidebar -->
        <div class="hidden h-full flex-col p-4 lg:flex">
          {@render duelPrompt()}
          <div class="grid min-h-0 flex-1 grid-cols-2 grid-rows-1 gap-4">
            <div class="relative flex h-full flex-col gap-3">
              <FontHeader font={duel.players[0]} />
              <FontPreview
                class="min-h-0 flex-1 overflow-hidden rounded-lg"
                fontSize={fontSize.value}
                family={duel.players[0].family}
                category={duel.players[0].category}
                ligatures={ligatures.value}
                variant="specimen"
                seed={specimenSeed} />
              <button
                bind:this={leftButton}
                class="btn preset-filled-primary-500 absolute bottom-10 left-1/2 -translate-x-1/2 shadow-xl"
                aria-label="Choose left font"
                onclick={() => chooseWinner(duel.players[0], leftButton)}
                >Choose or press <kbd class="kbd" aria-hidden="true">⇽</kbd
                ></button>
            </div>
            <div class="relative flex h-full flex-col gap-3">
              <FontHeader font={duel.players[1]} />
              <FontPreview
                class="min-h-0 flex-1 overflow-hidden rounded-lg"
                fontSize={fontSize.value}
                family={duel.players[1].family}
                category={duel.players[1].category}
                ligatures={ligatures.value}
                variant="specimen"
                seed={specimenSeed} />
              <button
                bind:this={rightButton}
                class="btn preset-filled-primary-500 absolute bottom-10 left-1/2 -translate-x-1/2 shadow-xl"
                aria-label="Choose right font"
                onclick={() => chooseWinner(duel.players[1], rightButton)}
                >Choose or press <kbd class="kbd" aria-hidden="true">⇾</kbd
                ></button>
            </div>
          </div>
        </div>
      {/if}
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
                   image" next to the share card, so always show the text. Short
                   labels (no family name) keep all three on one compact row
                   instead of a tall stack; the aria-labels stay descriptive. -->
              <FontLinks
                font={champion}
                size={20}
                showLabels
                shortLabels
                labelClass=""
                detailLabel="Details"
                groupClass="preset-tonal-surface text-sm" />
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

            <!-- Mobile post-game controls. The desktop sidebar carries restart,
                 the category filter, and the bracket the whole game; the mobile
                 results screen has no toolbar, so without this there's no way to
                 start over, pick a different matchup, or review the bracket.
                 Sits on a solid surface so the outlined controls keep their
                 contrast over the decorative trophy behind them (WCAG AA). -->
            <div
              class="relative flex flex-col gap-3 rounded-lg border border-surface-200-800 bg-surface-50-950 p-4 lg:hidden">
              <div class="flex flex-wrap justify-center gap-2">
                <button
                  class="btn preset-filled-primary-500"
                  onclick={startGame}>Play again</button>
                {#if game?.rounds.length}
                  <button
                    class="btn preset-tonal-surface"
                    onclick={() => (showBracket = true)}>
                    <Icon name="bracket" size={18} />
                    <span>View full bracket</span>
                  </button>
                {/if}
              </div>
              <!-- Start a different game: another type, or a bigger bracket. -->
              <CategoryFilter
                categories={CATEGORIES}
                selected={selectedCategory}
                onselect={selectCategory} />
              {#if fullRosterSize > quickSize}
                {@render modeToggle()}
              {/if}
            </div>

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

<!-- MOBILE: the full bracket as a Dialog sheet (desktop has the sidebar rail).
     Skeleton's Dialog (Zag) gives the modal treatment the old hand-rolled overlay
     lacked — focus trap, scroll lock, Escape, click-outside, and an inert
     background — matching ControlsSheet. Parts are lg:hidden so it never shows on
     desktop even if `showBracket` were somehow set there. -->
<Dialog open={showBracket} onOpenChange={(d) => (showBracket = d.open)}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/40 lg:hidden" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex lg:hidden">
      <Dialog.Content
        class="flex h-full w-full flex-col bg-surface-50-950 outline-none">
        <div
          class="flex shrink-0 items-center justify-between border-b border-surface-200-800 bg-surface-100-900 p-4">
          <Dialog.Title class="font-semibold">Bracket</Dialog.Title>
          <Dialog.CloseTrigger
            class="btn-icon preset-tonal-surface"
            aria-label="Close bracket">
            <Icon name="x" size={22} />
          </Dialog.CloseTrigger>
        </div>
        <div class="min-h-0 flex-1 overflow-auto p-4">
          {@render bracketTree()}
        </div>
        <!-- Restart lives here (the game overview), not in the always-on toolbar:
             it's a full reset, rare mid-round, and a loud primary button there
             invited mis-taps. Reachable in both orientations via the toolbar's
             bracket button. Restarting returns you straight to the fresh duel. -->
        <div
          class="shrink-0 border-t border-surface-200-800 bg-surface-100-900 p-4">
          <button
            class="btn w-full preset-filled-primary-500"
            onclick={() => {
              startGame();
              showBracket = false;
            }}>Restart game</button>
        </div>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

<!-- Mobile specimen-settings sheet (desktop shows these controls inline). -->
<ControlsSheet bind:open={controlsOpen} category={selectedCategory} />
