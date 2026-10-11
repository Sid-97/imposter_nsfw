const WORDS = [...new Set(globalThis.IMPOSTER_WORDS)];

if (WORDS.length === 0) {
  throw new Error("The word list must contain at least one word.");
}

const state = {
  playerCount: 4,
  currentPlayer: 0,
  imposterIndex: 0,
  word: "",
  startingPlayer: 0,
  usedWords: new Set()
};
const screens = [...document.querySelectorAll(".screen")];

const $ = (selector) => document.querySelector(selector);
const playerCount = $("#player-count");
const decreasePlayers = $("#decrease-players");
const increasePlayers = $("#increase-players");

function randomIndex(length) {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] % length;
  }
  return Math.floor(Math.random() * length);
}

function showScreen(id) {
  screens.forEach((screen) => {
    const isTarget = screen.id === id;
    screen.hidden = !isTarget;
    screen.classList.toggle("active", isTarget);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updatePlayerPicker() {
  playerCount.value = state.playerCount;
  playerCount.textContent = state.playerCount;
  decreasePlayers.disabled = state.playerCount <= 3;
  increasePlayers.disabled = state.playerCount >= 10;
}

function prepareRound() {
  const availableWords = WORDS.filter((word) => !state.usedWords.has(word));

  if (availableWords.length === 0) {
    window.alert("You have used every word in this session. Go Back to Home to reset the word pool.");
    return;
  }

  state.currentPlayer = 0;
  state.imposterIndex = randomIndex(state.playerCount);
  state.word = availableWords[randomIndex(availableWords.length)];
  state.usedWords.add(state.word);
  state.startingPlayer = randomIndex(state.playerCount);
  showPassScreen();
}

function goHome() {
  state.usedWords.clear();
  state.word = "";
  showScreen("home-screen");
}

function showPassScreen() {
  const playerNumber = state.currentPlayer + 1;
  $("#player-label").textContent = `Player ${playerNumber} of ${state.playerCount}`;
  $("#pass-player").textContent = `Player ${playerNumber}`;
  $("#reveal-button").innerHTML = `I’m Player ${playerNumber} — Reveal <span>👀</span>`;
  showScreen("pass-screen");
}

function revealRole() {
  const isImposter = state.currentPlayer === state.imposterIndex;
  const card = $("#role-card");
  card.classList.toggle("is-imposter", isImposter);
  $("#role-kicker").textContent = isImposter ? "Your secret role is" : "Your secret word is";
  $("#role-icon").textContent = isImposter ? "!" : "★";
  $("#role-heading").textContent = isImposter ? "You’re the Imposter!" : state.word;
  $("#role-hint").textContent = isImposter
    ? "Blend in, listen carefully, and try to figure out the secret word."
    : "Remember it, then give a clever one-word clue when it’s your turn.";
  showScreen("reveal-screen");
}

function confirmRole() {
  state.currentPlayer += 1;
  if (state.currentPlayer < state.playerCount) {
    showPassScreen();
    return;
  }
  $("#starting-player").textContent = `Player ${state.startingPlayer + 1}`;
  showScreen("ready-screen");
}

$("#start-button").addEventListener("click", () => showScreen("setup-screen"));
decreasePlayers.addEventListener("click", () => { state.playerCount = Math.max(3, state.playerCount - 1); updatePlayerPicker(); });
increasePlayers.addEventListener("click", () => { state.playerCount = Math.min(10, state.playerCount + 1); updatePlayerPicker(); });
$("#begin-round-button").addEventListener("click", prepareRound);
$("#reveal-button").addEventListener("click", revealRole);
$("#confirm-button").addEventListener("click", confirmRole);
$("#new-round-button").addEventListener("click", prepareRound);
document.querySelectorAll('[data-action="home"]').forEach((button) => button.addEventListener("click", goHome));

updatePlayerPicker();
