const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const BOARD_START_X = 90;
const BOARD_END_X = 870;
const TRACK_Y = 330;
const MAX_TURNS = 18;
const DESTINY_TARGET = 100;
const START_SANITY = 60;

const majorDeck = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

const minorSuits = ["coins", "swords", "cups", "wands"];
const ORIENTATION_LABEL = { upright: "Upright", reversed: "Reversed" };

const MINOR_EFFECTS = {
  coins: {
    upright: { destiny: 6, sanity: 0, momentum: 0 },
    reversed: { destiny: 12, sanity: -3, momentum: 0 }
  },
  swords: {
    upright: { destiny: 4, sanity: -6, momentum: 0 },
    reversed: { destiny: 10, sanity: -12, momentum: 0 }
  },
  cups: {
    upright: { destiny: 2, sanity: 8, momentum: 0 },
    reversed: { destiny: 6, sanity: 12, momentum: 0 }
  },
  wands: {
    upright: { destiny: 5, sanity: -1, momentum: 2 },
    reversed: { destiny: 9, sanity: -3, momentum: 4 }
  }
};

const MAJOR_EFFECTS = {
  "The Fool": {
    upright: { destiny: 7, sanity: 2, momentum: 1 },
    reversed: { destiny: 11, sanity: -3, momentum: 2 }
  },
  "The Magician": {
    upright: { destiny: 9, sanity: 0, momentum: 2 },
    reversed: { destiny: 13, sanity: -4, momentum: 3 }
  },
  "The High Priestess": {
    upright: { destiny: 6, sanity: 5, momentum: 1 },
    reversed: { destiny: 10, sanity: 1, momentum: 2 }
  },
  "The Empress": {
    upright: { destiny: 8, sanity: 6, momentum: 1 },
    reversed: { destiny: 12, sanity: 2, momentum: 2 }
  },
  "The Emperor": {
    upright: { destiny: 10, sanity: -1, momentum: 1 },
    reversed: { destiny: 14, sanity: -5, momentum: 2 }
  },
  "The Hierophant": {
    upright: { destiny: 7, sanity: 4, momentum: 1 },
    reversed: { destiny: 11, sanity: -2, momentum: 2 }
  },
  "The Lovers": {
    upright: { destiny: 9, sanity: 3, momentum: 1 },
    reversed: { destiny: 13, sanity: -4, momentum: 2 }
  },
  "The Chariot": {
    upright: { destiny: 11, sanity: -2, momentum: 2 },
    reversed: { destiny: 15, sanity: -6, momentum: 3 }
  },
  Strength: {
    upright: { destiny: 8, sanity: 4, momentum: 2 },
    reversed: { destiny: 12, sanity: -3, momentum: 3 }
  },
  "The Hermit": {
    upright: { destiny: 6, sanity: 6, momentum: 0 },
    reversed: { destiny: 10, sanity: -1, momentum: 1 }
  },
  Justice: {
    upright: { destiny: 9, sanity: 0, momentum: 1 },
    reversed: { destiny: 13, sanity: -5, momentum: 2 }
  },
  "The Hanged Man": {
    upright: { destiny: 5, sanity: 7, momentum: 0 },
    reversed: { destiny: 9, sanity: -2, momentum: 1 }
  },
  Death: {
    upright: { destiny: 10, sanity: -3, momentum: 1 },
    reversed: { destiny: 15, sanity: -8, momentum: 2 }
  },
  Temperance: {
    upright: { destiny: 7, sanity: 6, momentum: 1 },
    reversed: { destiny: 11, sanity: -1, momentum: 2 }
  },
  "The Devil": {
    upright: { destiny: 12, sanity: -7, momentum: 2 },
    reversed: { destiny: 18, sanity: -12, momentum: 3 }
  },
  "The Tower": {
    upright: { destiny: 8, sanity: -10, momentum: 0 },
    reversed: { destiny: 18, sanity: -18, momentum: 0 }
  },
  "The Star": {
    upright: { destiny: 4, sanity: 10, momentum: 0 },
    reversed: { destiny: 8, sanity: 16, momentum: 0 }
  },
  "The Moon": {
    upright: { destiny: 7, sanity: -4, momentum: 1 },
    reversed: { destiny: 12, sanity: -9, momentum: 2 }
  },
  "The Sun": {
    upright: { destiny: 11, sanity: 5, momentum: 1 },
    reversed: { destiny: 16, sanity: -1, momentum: 2 }
  },
  Judgement: {
    upright: { destiny: 10, sanity: 2, momentum: 1 },
    reversed: { destiny: 14, sanity: -4, momentum: 2 }
  },
  "The World": {
    upright: { destiny: 12, sanity: 4, momentum: 2 },
    reversed: { destiny: 17, sanity: -2, momentum: 3 }
  }
};

const state = {
  mode: "menu",
  turnsLeft: MAX_TURNS,
  destiny: 0,
  sanity: START_SANITY,
  momentum: 0,
  phase: "await_draw",
  currentCard: null,
  cardIndex: 0,
  eventText: "",
  finalReading: "",
  messageTimer: 0,
  seekerX: BOARD_START_X,
  floatingTexts: []
};

let lastTs = performance.now();

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  const isSpace = e.code === "Space" || e.key === " ";

  if (key === "f") {
    toggleFullscreen();
  }

  if (state.mode === "menu" && key === "enter") {
    startRun();
    return;
  }

  if (state.mode === "playing") {
    if (state.phase === "await_draw" && isSpace) {
      e.preventDefault();
      drawCard();
      return;
    }
    if (state.phase === "await_choice" && (key === "u" || key === "r")) {
      resolveChoice(key === "u" ? "upright" : "reversed");
      return;
    }
  }

  if (state.mode === "win" || state.mode === "lose") {
    if (key === "enter") {
      resetToMenu();
    }
  }
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

document.addEventListener("fullscreenchange", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function resizeCanvas() {
  if (document.fullscreenElement === canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else {
    canvas.width = 960;
    canvas.height = 540;
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addFloat(text, color = "#2b241f") {
  state.floatingTexts.push({
    text,
    color,
    x: state.seekerX,
    y: TRACK_Y - 50,
    ttl: 1.3
  });
}

function startRun() {
  state.mode = "playing";
  state.turnsLeft = MAX_TURNS;
  state.destiny = 0;
  state.sanity = START_SANITY;
  state.momentum = 0;
  state.phase = "await_draw";
  state.currentCard = null;
  state.cardIndex = 0;
  state.eventText = "Press SPACE to draw your first card.";
  state.finalReading = "";
  state.messageTimer = 3;
  state.seekerX = BOARD_START_X;
  state.floatingTexts = [];
}

function resetToMenu() {
  state.mode = "menu";
  state.eventText = "";
  state.finalReading = "";
  state.currentCard = null;
  state.phase = "await_draw";
}

function drawCard() {
  const isMajor = Math.random() < 0.3;
  if (isMajor) {
    state.currentCard = {
      type: "major",
      name: majorDeck[randomInt(0, majorDeck.length - 1)]
    };
  } else {
    state.currentCard = {
      type: "minor",
      suit: minorSuits[randomInt(0, minorSuits.length - 1)],
      rank: randomInt(1, 14)
    };
  }
  state.phase = "await_choice";
  state.eventText = "Choose: U for Upright (safer) or R for Reversed (riskier).";
  state.messageTimer = 4;
}

function resolveChoice(orientation) {
  if (!state.currentCard) return;

  let outcome = { destiny: 0, sanity: 0, momentum: 0, text: "" };

  if (state.currentCard.type === "major") {
    outcome = applyMajorArcana(state.currentCard.name, orientation);
  } else {
    outcome = applyMinorArcana(state.currentCard.suit, state.currentCard.rank, orientation);
  }

  state.destiny += outcome.destiny;
  state.sanity += outcome.sanity;
  state.momentum += outcome.momentum;
  state.sanity = Math.max(0, Math.min(100, state.sanity));
  state.momentum = Math.max(0, Math.min(20, state.momentum));

  state.turnsLeft -= 1;
  state.cardIndex += 1;
  state.eventText = outcome.text;
  state.messageTimer = 4;

  if (outcome.destiny !== 0) addFloat(`${outcome.destiny > 0 ? "+" : ""}${outcome.destiny} destiny`, "#2f4d22");
  if (outcome.sanity !== 0) addFloat(`${outcome.sanity > 0 ? "+" : ""}${outcome.sanity} sanity`, "#6d2f2f");

  checkEndConditions();
  if (state.mode === "playing") {
    state.phase = "await_draw";
    state.currentCard = null;
  }
}

function applyMinorArcana(suit, rank, orientation) {
  const effect = MINOR_EFFECTS[suit][orientation];
  const suitLabel = suit[0].toUpperCase() + suit.slice(1);
  return {
    destiny: effect.destiny,
    sanity: effect.sanity,
    momentum: effect.momentum,
    text: `${suitLabel} ${ORIENTATION_LABEL[orientation]}: ${formatDelta(effect.destiny, "destiny")}, ${formatDelta(effect.sanity, "sanity")}, ${formatDelta(effect.momentum, "momentum")}.`
  };
}

function applyMajorArcana(name, orientation) {
  if (name === "Wheel of Fortune") {
    const destiny = orientation === "upright" ? randomInt(-10, 14) : randomInt(-16, 20);
    const sanity = orientation === "upright" ? randomInt(-6, 6) : randomInt(-10, 8);
    return {
      destiny,
      sanity,
      momentum: 0,
      text: `Wheel of Fortune ${ORIENTATION_LABEL[orientation]}: ${formatDelta(destiny, "destiny")}, ${formatDelta(sanity, "sanity")}.`
    };
  }

  const effect = MAJOR_EFFECTS[name][orientation];
  return {
    destiny: effect.destiny,
    sanity: effect.sanity,
    momentum: effect.momentum,
    text: `${name} ${ORIENTATION_LABEL[orientation]}: ${formatDelta(effect.destiny, "destiny")}, ${formatDelta(effect.sanity, "sanity")}, ${formatDelta(effect.momentum, "momentum")}.`
  };
}

function formatDelta(value, label) {
  return `${value >= 0 ? "+" : ""}${value} ${label}`;
}

function buildEndingReading() {
  if (state.mode === "win") {
    if (state.sanity >= 45) {
      return "Reading: The Sun crowns your path. You reached destiny with a clear mind; the next chapter is growth, leadership, and steady fortune.";
    }
    if (state.sanity >= 20) {
      return "Reading: Judgement answers your call. You fulfilled destiny, but the cards ask for recovery before your next leap.";
    }
    return "Reading: The World opens, but at a cost. You won through sacrifice; rest, repair, and choose gentler roads.";
  }

  if (state.sanity <= 0) {
    if (state.destiny >= 70) {
      return "Reading: The Tower struck near the summit. Your ambition was powerful, but your spirit burned too fast.";
    }
    return "Reading: The Moon clouds your compass. Slow down, heal, and rebuild your path before seeking this fate again.";
  }

  if (state.destiny >= 90) {
    return "Reading: The Chariot halted at the final gate. You were close; one cleaner risk would have sealed your fate.";
  }
  return "Reading: The Hermit advises preparation. You need stronger momentum and cleaner card choices to complete this journey.";
}

function checkEndConditions() {
  if (state.sanity <= 0) {
    state.mode = "lose";
    state.finalReading = buildEndingReading();
    state.eventText = "Your mind fractures in the veil. Press ENTER to return.";
    return;
  }

  if (state.destiny >= DESTINY_TARGET) {
    state.mode = "win";
    state.finalReading = buildEndingReading();
    state.eventText = "Destiny fulfilled. Press ENTER to seek again.";
    return;
  }

  if (state.turnsLeft <= 0) {
    state.mode = "lose";
    state.finalReading = buildEndingReading();
    state.eventText = "The final candle burns out. Press ENTER to return.";
  }
}

function update(dt) {
  if (state.messageTimer > 0) {
    state.messageTimer -= dt;
  }

  if (state.mode === "playing") {
    const trackProgress = Math.min(1, state.destiny / DESTINY_TARGET);
    const targetX = BOARD_START_X + (BOARD_END_X - BOARD_START_X) * trackProgress;
    const lerp = 1 - Math.pow(0.001, dt);
    state.seekerX += (targetX - state.seekerX) * lerp;

    for (const item of state.floatingTexts) {
      item.y -= 38 * dt;
      item.ttl -= dt;
    }
    state.floatingTexts = state.floatingTexts.filter((f) => f.ttl > 0);
  }
}

function drawBoard() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#f7efe0");
  grad.addColorStop(1, "#e7d7bb");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#b59b6a";
  ctx.fillRect(BOARD_START_X - 20, TRACK_Y - 8, BOARD_END_X - BOARD_START_X + 40, 16);

  for (let i = 0; i <= 10; i += 1) {
    const x = BOARD_START_X + ((BOARD_END_X - BOARD_START_X) / 10) * i;
    ctx.fillStyle = i % 2 === 0 ? "#7b5c31" : "#8d6a3b";
    ctx.fillRect(x - 2, TRACK_Y - 22, 4, 44);
  }

  ctx.fillStyle = "#503215";
  ctx.beginPath();
  ctx.arc(state.seekerX, TRACK_Y - 18, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f1e6d4";
  ctx.font = "12px Georgia";
  ctx.fillText("START", BOARD_START_X - 30, TRACK_Y + 42);
  ctx.fillText("DESTINY", BOARD_END_X - 26, TRACK_Y + 42);
}

function drawUi() {
  ctx.fillStyle = "#2d2118";
  ctx.font = "18px Georgia";
  ctx.fillText(`Destiny: ${state.destiny}/${DESTINY_TARGET}`, 40, 44);
  ctx.fillText(`Sanity: ${state.sanity}`, 40, 72);
  ctx.fillText(`Turns: ${state.turnsLeft}`, 40, 100);
  ctx.fillText(`Momentum: ${state.momentum}`, 40, 128);

  if (state.currentCard) {
    ctx.fillStyle = "#f8f0df";
    ctx.fillRect(690, 44, 230, 220);
    ctx.strokeStyle = "#6d4d2e";
    ctx.lineWidth = 2;
    ctx.strokeRect(690, 44, 230, 220);
    ctx.fillStyle = "#2a1e14";
    ctx.font = "16px Georgia";
    const cardName = state.currentCard.type === "major"
      ? state.currentCard.name
      : `${state.currentCard.suit.toUpperCase()} ${state.currentCard.rank}`;
    ctx.fillText("Drawn Card", 760, 68);
    wrapText(cardName, 706, 96, 200, 24);
    drawTarotArt(state.currentCard, 706, 112, 198, 80);
    const up = getCardOutcomePreview(state.currentCard, "upright");
    const rev = getCardOutcomePreview(state.currentCard, "reversed");
    ctx.font = "13px Georgia";
    wrapText(`U: ${up}`, 706, 205, 200, 18);
    wrapText(`R: ${rev}`, 706, 238, 200, 18);
  }

  if (state.messageTimer > 0 || state.mode !== "playing") {
    ctx.fillStyle = "rgba(33, 23, 16, 0.83)";
    ctx.fillRect(30, 424, canvas.width - 60, 90);
    ctx.fillStyle = "#f2e8d7";
    ctx.font = "18px Georgia";
    const msg =
      state.mode === "menu"
        ? "Press ENTER to begin. During play: SPACE draws, U = upright, R = reversed, F = fullscreen."
        : state.eventText;
    wrapText(msg, 44, 454, canvas.width - 88, 26);
  }

  for (const item of state.floatingTexts) {
    ctx.globalAlpha = Math.max(0, item.ttl / 1.3);
    ctx.fillStyle = item.color;
    ctx.font = "16px Georgia";
    ctx.fillText(item.text, item.x - 18, item.y);
    ctx.globalAlpha = 1;
  }

  if (state.mode === "win" || state.mode === "lose") {
    ctx.fillStyle = "rgba(22, 15, 11, 0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f7eccc";
    ctx.textAlign = "center";
    ctx.font = "44px Georgia";
    ctx.fillText(state.mode === "win" ? "FATE FULFILLED" : "FATE FRACTURED", canvas.width / 2, 210);
    ctx.font = "18px Georgia";
    ctx.textAlign = "left";
    wrapText(state.finalReading || "", 170, 260, canvas.width - 340, 28);
  }
}

function drawTarotArt(card, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#efe3c7";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#7a5d35";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  const cx = x + w / 2;
  const cy = y + h / 2;

  if (card.type === "minor") {
    drawMinorSymbol(card.suit, cx, cy, Math.min(w, h) * 0.28);
  } else {
    drawMajorSymbol(card.name, cx, cy, Math.min(w, h) * 0.25);
  }
  ctx.restore();
}

function drawMinorSymbol(suit, cx, cy, s) {
  ctx.fillStyle = "#51341e";
  ctx.strokeStyle = "#51341e";
  ctx.lineWidth = 2;

  if (suit === "coins") {
    ctx.beginPath();
    ctx.arc(cx, cy, s, 0, Math.PI * 2);
    ctx.fillStyle = "#b8943d";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.5, cy);
    ctx.lineTo(cx + s * 0.5, cy);
    ctx.moveTo(cx, cy - s * 0.5);
    ctx.lineTo(cx, cy + s * 0.5);
    ctx.stroke();
    return;
  }

  if (suit === "swords") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.lineTo(cx + s * 0.2, cy + s * 0.6);
    ctx.lineTo(cx - s * 0.2, cy + s * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - s * 0.55, cy + s * 0.4, s * 1.1, s * 0.16);
    return;
  }

  if (suit === "cups") {
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.75, cy - s * 0.2);
    ctx.quadraticCurveTo(cx, cy + s * 0.9, cx + s * 0.75, cy - s * 0.2);
    ctx.lineTo(cx + s * 0.5, cy - s * 0.7);
    ctx.lineTo(cx - s * 0.5, cy - s * 0.7);
    ctx.closePath();
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.lineTo(cx + s * 0.45, cy - s * 0.1);
  ctx.lineTo(cx + s * 0.2, cy - s * 0.1);
  ctx.lineTo(cx + s * 0.7, cy + s);
  ctx.lineTo(cx - s * 0.05, cy + s * 0.05);
  ctx.lineTo(cx - s * 0.7, cy + s);
  ctx.lineTo(cx - s * 0.2, cy - s * 0.1);
  ctx.lineTo(cx - s * 0.45, cy - s * 0.1);
  ctx.closePath();
  ctx.fill();
}

function drawMajorSymbol(name, cx, cy, s) {
  ctx.strokeStyle = "#50341f";
  ctx.fillStyle = "#50341f";
  ctx.lineWidth = 2;

  if (name === "The Tower") {
    ctx.fillRect(cx - s * 0.45, cy - s * 0.8, s * 0.9, s * 1.5);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.6, cy - s * 0.8);
    ctx.lineTo(cx + s * 0.6, cy - s * 0.8);
    ctx.lineTo(cx, cy - s * 1.25);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (name === "The Star") {
    drawStar(cx, cy, s, s * 0.45, 5);
    return;
  }

  if (name === "Wheel of Fortune") {
    ctx.beginPath();
    ctx.arc(cx, cy, s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s);
      ctx.stroke();
    }
    return;
  }

  ctx.beginPath();
  ctx.arc(cx, cy, s, 0, Math.PI * 2);
  ctx.stroke();
  drawStar(cx, cy, s * 0.65, s * 0.28, 6);
}

function drawStar(cx, cy, outer, inner, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function getCardOutcomePreview(card, orientation) {
  if (card.type === "minor") {
    const effect = MINOR_EFFECTS[card.suit][orientation];
    return `${formatDelta(effect.destiny, "D")}, ${formatDelta(effect.sanity, "S")}, ${formatDelta(effect.momentum, "M")}`;
  }

  if (card.name === "Wheel of Fortune") {
    if (orientation === "upright") {
      return "D -10..+14, S -6..+6, M +0";
    }
    return "D -16..+20, S -10..+8, M +0";
  }

  const effect = MAJOR_EFFECTS[card.name][orientation];
  return `${formatDelta(effect.destiny, "D")}, ${formatDelta(effect.sanity, "S")}, ${formatDelta(effect.momentum, "M")}`;
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;

  for (let i = 0; i < words.length; i += 1) {
    const test = line + words[i] + " ";
    const metrics = ctx.measureText(test);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, lineY);
      line = `${words[i]} `;
      lineY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, lineY);
}

function render() {
  drawBoard();
  drawUi();
}

function frame(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000);
  lastTs = ts;
  update(dt);
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.advanceTime = (ms) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i += 1) {
    update(1 / 60);
  }
  render();
};

window.render_game_to_text = () => {
  const payload = {
    coordinateSystem: "origin top-left, +x right, +y down",
    mode: state.mode,
    phase: state.phase,
    seeker: { x: Number(state.seekerX.toFixed(2)), y: TRACK_Y - 18 },
    stats: {
      destiny: state.destiny,
      destinyTarget: DESTINY_TARGET,
      sanity: state.sanity,
      momentum: state.momentum,
      turnsLeft: state.turnsLeft
    },
    currentCard: state.currentCard,
    finalReading: state.finalReading,
    objective: "Reach destiny target before sanity reaches 0 or turns run out"
  };
  return JSON.stringify(payload);
};
