<script lang="ts">
import { onMount, tick } from 'svelte';
import {
  Icon,
  Header,
  Sidebar,
  FontHeader,
  Controls,
  AppFrame,
  FontPreview,
  FontDuel,
  PlayerBadge,
  WinnerBadge,
  createGame,
  createConfetti
} from '$lib';
import { showName, fontSize, ligatures, topCollapsed } from '$lib/store.svelte';

let { data } = $props();

// No "All" here: a tournament only makes sense within a category — pitting a
// script face against a coding mono isn't a real preference. ("All" stays on
// Browse, where it's just a table filter.)
const categories = [
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'script', label: 'Script' },
  { id: 'mono', label: 'Mono' }
] as const;
type Category = (typeof categories)[number]['id'];

let selectedCategory = $state<Category>('sans');
let game = $state<any>(null);
let currentBracket = $state<any>(null);
let leftButton = $state<HTMLButtonElement>();
let rightButton = $state<HTMLButtonElement>();
let poolSize = $state(0);

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

onMount(() => {
  startGame();
});

function handleKeydown(event: KeyboardEvent) {
  if (currentBracket?.players?.length) {
    if (event.key === 'ArrowLeft') {
      chooseWinner(currentBracket.players[0], leftButton);
    } else if (event.key === 'ArrowRight') {
      chooseWinner(currentBracket.players[1], rightButton);
    }
  }
}

function startGame() {
  const pool = data.fonts.filter((font) => font.category === selectedCategory);
  poolSize = pool.length;
  // copy the pool so createGame's in-place shuffle doesn't mutate shared data
  game = createGame([...pool]);
  currentBracket = game.startGame();
}

function selectCategory(id: Category) {
  selectedCategory = id;
  showName.value = false;
  startGame();
}

function getFontByFamilyName(familyName: string) {
  return data.fonts.find((font) => font.family === familyName);
}

async function chooseWinner(player: any, button: HTMLElement | undefined) {
  currentBracket = game.setWinner(player);
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
        <div class="flex flex-wrap gap-1">
          {#each categories as category (category.id)}
            <button
              class="btn btn-sm {selectedCategory === category.id
                ? 'preset-filled-primary-500'
                : 'preset-outlined-surface-500'}"
              aria-pressed={selectedCategory === category.id}
              onclick={() => selectCategory(category.id)}
              >{category.label}</button>
          {/each}
        </div>
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
                    <span style="font-family: '{round[0].winner.family}'">
                      {round[0].winner.family}
                    </span>
                  </WinnerBadge>
                </div>
              {:else}
                <div class="bracket-round" class:first-round={index === 0}>
                  {#each round as bracket (bracket)}
                    <div
                      class="font-bracket"
                      class:active={bracket === currentBracket}>
                      {#each bracket?.players as font (font.family)}
                        <PlayerBadge
                          class={bracket?.winner?.family == font.family
                            ? 'preset-tonal-primary'
                            : 'preset-tonal-surface'}>
                          <span style="font-family: '{font.family}'">
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
    {#if currentBracket?.players?.length}
      <!-- MOBILE / TABLET: tap-to-pick duel — both fonts on screen, no scroll -->
      <div class="flex h-full flex-col p-3 pt-2 lg:hidden">
        <!-- always-visible toolbar: collapse chrome · progress · restart -->
        <div class="flex shrink-0 items-center gap-3 pb-2">
          <button
            class="btn-icon preset-tonal-surface shrink-0"
            onclick={() => (topCollapsed.value = !topCollapsed.value)}
            aria-label={topCollapsed.value ? 'Show controls' : 'Hide controls'}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              style="transition: transform 0.2s; transform: rotate({topCollapsed.value
                ? 180
                : 0}deg);"><path d="m18 15-6-6-6 6" /></svg>
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
            <div
              class="btn-group preset-outlined-surface-500 shrink-0 [&>*+*]:border-surface-400-500">
              {#each categories as category (category.id)}
                <button
                  class="btn btn-sm {selectedCategory === category.id
                    ? 'preset-filled-primary-500'
                    : ''}"
                  aria-pressed={selectedCategory === category.id}
                  onclick={() => selectCategory(category.id)}
                  >{category.label}</button>
              {/each}
            </div>
          </div>
        {/if}

        <FontDuel
          players={currentBracket.players}
          fontSize={fontSize.value}
          ligatures={ligatures.value}
          showName={showName.value}
          onpick={chooseWinner} />
      </div>

      <!-- DESKTOP: side-by-side specimens with the bracket sidebar -->
      <div
        class="hidden h-full gap-4 p-4 lg:grid lg:grid-cols-2 lg:grid-rows-1">
        <div class="relative flex h-full flex-col gap-3">
          <FontHeader
            font={getFontByFamilyName(currentBracket.players[0].family)} />
          <FontPreview
            class="min-h-0 flex-1 overflow-hidden rounded-lg"
            fontSize={fontSize.value}
            family={currentBracket.players[0].family}
            category={currentBracket.players[0].category}
            ligatures={ligatures.value} />
          <button
            bind:this={leftButton}
            class="btn preset-filled-primary-500 absolute bottom-10 left-1/2 -translate-x-1/2 shadow-xl"
            onclick={() => chooseWinner(currentBracket.players[0], leftButton)}
            >Choose or press <kbd class="kbd">⇽</kbd></button>
        </div>
        <div class="relative flex h-full flex-col gap-3">
          <FontHeader
            font={getFontByFamilyName(currentBracket.players[1].family)} />
          <FontPreview
            class="min-h-0 flex-1 overflow-hidden rounded-lg"
            fontSize={fontSize.value}
            family={currentBracket.players[1].family}
            category={currentBracket.players[1].category}
            ligatures={ligatures.value} />
          <button
            bind:this={rightButton}
            class="btn preset-filled-primary-500 absolute bottom-10 left-1/2 -translate-x-1/2 shadow-xl"
            onclick={() => chooseWinner(currentBracket.players[1], rightButton)}
            >Choose or press <kbd class="kbd">⇾</kbd></button>
        </div>
      </div>
    {:else if currentBracket?.winner}
      <div class="h-full overflow-auto">
        <div
          class="relative min-h-full overflow-hidden border-4 border-surface-900-50 bg-surface-50-950 p-6 text-center lg:p-10">
          <img
            class="absolute bottom-0 left-0 right-0 mx-auto max-w-full opacity-60"
            src="/trophy.png"
            alt="Trophy of Font"
            width="395"
            height="440" />
          <div
            class="relative mx-auto flex max-w-5xl flex-col gap-12 p-4 md:p-10">
            <div
              class="flex flex-col gap-6 border-t-2 border-surface-700-200 pt-10 tracking-widest">
              <h2 class="h2">CERTIFICATE OF ABSOLUTE AWESOMENESS</h2>
              <h3 class="h4">HEREBY UNLEASHED UPON</h3>
            </div>
            <div
              class="my-4 text-4xl md:text-6xl"
              style="font-family: '{currentBracket?.winner.family}'">
              {currentBracket?.winner.family}
            </div>
            <div class="btn-group preset-tonal-surface self-center">
              <a
                class="btn"
                href={currentBracket?.winner.siteUrl}
                target="_blank">
                <Icon name="external" size={24} />
                <span class="hidden 2xl:block"
                  >Visit {currentBracket?.winner.family}</span>
              </a>
              <a class="btn" href={currentBracket?.winner.downloadUrl}>
                <Icon name="download" size={24} />
                <span class="hidden 2xl:block"
                  >Download {currentBracket?.winner.family}</span>
              </a>
              <a
                class="btn"
                href="/{encodeURIComponent(
                  currentBracket?.winner.family.replace(/\s+/g, '')
                )}">
                <Icon name="maximize" size={24} />
                <span class="hidden 2xl:block">View Font Detail</span>
              </a>
            </div>
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
