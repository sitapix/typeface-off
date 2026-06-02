<script lang="ts">
import { onMount, tick } from 'svelte';
import {
  Icon,
  Header,
  Sidebar,
  FontHeader,
  Controls,
  AppFrame,
  NotePreview,
  PlayerBadge,
  WinnerBadge,
  createGame,
  createConfetti
} from '$lib';
import { showName, fontSize } from '$lib/store.svelte';

let { data } = $props();

const categories = [
  { id: 'all', label: 'All' },
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' }
] as const;
type Category = (typeof categories)[number]['id'];

let selectedCategory = $state<Category>('all');
let game = $state<any>(null);
let currentBracket = $state<any>(null);
let leftButton = $state<HTMLButtonElement>();
let rightButton = $state<HTMLButtonElement>();

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
  const pool =
    selectedCategory === 'all'
      ? data.fonts
      : data.fonts.filter((font) => font.category === selectedCategory);
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

async function chooseWinner(player: any, button: HTMLButtonElement | undefined) {
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

<AppFrame>
  {#snippet header()}
    <Header />
  {/snippet}

  {#snippet sidebar()}
    <Sidebar>
      <div class="flex flex-col gap-2">
        <span class="text-sm opacity-70">Filter by type</span>
        <div
          class="btn-group preset-outlined-surface-500 w-full [&>*+*]:border-surface-400-500">
          {#each categories as category (category.id)}
            <button
              class="btn btn-sm {selectedCategory === category.id
                ? 'preset-filled-primary-500'
                : ''}"
              onclick={() => selectCategory(category.id)}>{category.label}</button>
          {/each}
        </div>
      </div>
      <button class="btn preset-filled-primary-500" onclick={startGame}
        >Restart Game</button>
      {#if game?.rounds.length}
        <div class="table-wrap rounded-none p-2">
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
                <div class={`round-${index + 1}`}>
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

  <div
    class="grid h-full grid-cols-1 grid-rows-2 gap-4 bg-surface-50-950 p-4 md:grid-cols-2 md:grid-rows-1">
    {#if currentBracket?.players?.length}
      <div class="relative flex flex-col gap-4">
        <FontHeader
          font={getFontByFamilyName(currentBracket.players[0].family)} />
        <NotePreview
          class="overflow-hidden rounded-lg"
          fontSize={fontSize.value}
          fontFamily={currentBracket.players[0].family} />
        <button
          bind:this={leftButton}
          class="btn preset-filled-primary-500 absolute bottom-10 block self-center shadow-xl"
          onclick={() => chooseWinner(currentBracket.players[0], leftButton)}
          >Choose or press <kbd class="kbd">⇽</kbd></button>
      </div>
      <div class="relative flex flex-col gap-4">
        <FontHeader
          font={getFontByFamilyName(currentBracket.players[1].family)} />
        <NotePreview
          class="overflow-hidden rounded-lg"
          fontSize={fontSize.value}
          fontFamily={currentBracket.players[1].family} />
        <button
          bind:this={rightButton}
          class="btn preset-filled-primary-500 absolute bottom-10 block self-center shadow-xl"
          onclick={() => chooseWinner(currentBracket.players[1], rightButton)}
          >Choose or press <kbd class="kbd">⇾</kbd></button>
      </div>
    {:else if currentBracket?.winner}
      <div
        class="relative col-span-1 row-span-2 border-4 border-surface-900-50 bg-surface-50-950 p-6 text-center md:col-span-2 md:row-span-1 md:p-10">
        <img
          class="absolute bottom-0 left-0 right-0 mx-auto opacity-60"
          src="/trophy.png"
          alt="Trophy of Font"
          width="400" />
        <div class="relative mx-auto flex max-w-5xl flex-col gap-12 p-4 md:p-10">
          <div
            class="flex flex-col gap-6 border-t-2 border-surface-700-200 pt-10 tracking-widest">
            <h2 class="h2">CERTIFICATE OF ABSOLUTE AWESOMENESS</h2>
            <h4 class="h4">HEREBY UNLEASHED UPON</h4>
          </div>
          <div
            class="my-4 text-4xl md:text-6xl"
            style="font-family: '{currentBracket?.winner.family}'">
            {currentBracket?.winner.family}
          </div>
          <div class="btn-group preset-tonal-surface self-center">
            <a class="btn" href={currentBracket?.winner.siteUrl} target="_blank">
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
    {/if}
  </div>
</AppFrame>
