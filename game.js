const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Layout constants scaled for 1280x720 canvas
const BOARD_START_X = 120;
const BOARD_END_X = 860;
const TRACK_Y = 440;
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
  "The Fool": { upright: { destiny: 7, sanity: 2, momentum: 1 }, reversed: { destiny: 11, sanity: -3, momentum: 2 } },
  "The Magician": { upright: { destiny: 9, sanity: 0, momentum: 2 }, reversed: { destiny: 13, sanity: -4, momentum: 3 } },
  "The High Priestess": { upright: { destiny: 6, sanity: 5, momentum: 1 }, reversed: { destiny: 10, sanity: 1, momentum: 2 } },
  "The Empress": { upright: { destiny: 8, sanity: 6, momentum: 1 }, reversed: { destiny: 12, sanity: 2, momentum: 2 } },
  "The Emperor": { upright: { destiny: 10, sanity: -1, momentum: 1 }, reversed: { destiny: 14, sanity: -5, momentum: 2 } },
  "The Hierophant": { upright: { destiny: 7, sanity: 4, momentum: 1 }, reversed: { destiny: 11, sanity: -2, momentum: 2 } },
  "The Lovers": { upright: { destiny: 9, sanity: 3, momentum: 1 }, reversed: { destiny: 13, sanity: -4, momentum: 2 } },
  "The Chariot": { upright: { destiny: 11, sanity: -2, momentum: 2 }, reversed: { destiny: 15, sanity: -6, momentum: 3 } },
  Strength: { upright: { destiny: 8, sanity: 4, momentum: 2 }, reversed: { destiny: 12, sanity: -3, momentum: 3 } },
  "The Hermit": { upright: { destiny: 6, sanity: 6, momentum: 0 }, reversed: { destiny: 10, sanity: -1, momentum: 1 } },
  Justice: { upright: { destiny: 9, sanity: 0, momentum: 1 }, reversed: { destiny: 13, sanity: -5, momentum: 2 } },
  "The Hanged Man": { upright: { destiny: 5, sanity: 7, momentum: 0 }, reversed: { destiny: 9, sanity: -2, momentum: 1 } },
  Death: { upright: { destiny: 10, sanity: -3, momentum: 1 }, reversed: { destiny: 15, sanity: -8, momentum: 2 } },
  Temperance: { upright: { destiny: 7, sanity: 6, momentum: 1 }, reversed: { destiny: 11, sanity: -1, momentum: 2 } },
  "The Devil": { upright: { destiny: 12, sanity: -7, momentum: 2 }, reversed: { destiny: 18, sanity: -12, momentum: 3 } },
  "The Tower": { upright: { destiny: 8, sanity: -10, momentum: 0 }, reversed: { destiny: 18, sanity: -18, momentum: 0 } },
  "The Star": { upright: { destiny: 4, sanity: 10, momentum: 0 }, reversed: { destiny: 8, sanity: 16, momentum: 0 } },
  "The Moon": { upright: { destiny: 7, sanity: -4, momentum: 1 }, reversed: { destiny: 12, sanity: -9, momentum: 2 } },
  "The Sun": { upright: { destiny: 11, sanity: 5, momentum: 1 }, reversed: { destiny: 16, sanity: -1, momentum: 2 } },
  Judgement: { upright: { destiny: 10, sanity: 2, momentum: 1 }, reversed: { destiny: 14, sanity: -4, momentum: 2 } },
  "The World": { upright: { destiny: 12, sanity: 4, momentum: 2 }, reversed: { destiny: 17, sanity: -2, momentum: 3 } }
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
  floatingTexts: [],
  uiAnimTime: 0
};

let lastTs = performance.now();

// Interactive hitboxes for mouse selection
const hitboxes = {
  upright: { x: 920, y: 525, w: 320, h: 52 },
  reversed: { x: 920, y: 590, w: 320, h: 52 }
};
let mousePos = { x: 0, y: 0 };

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mousePos.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  mousePos.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
});

canvas.addEventListener("click", () => {
  if (state.mode === "playing" && state.phase === "await_choice") {
    if (isInside(mousePos, hitboxes.upright)) resolveChoice("upright");
    else if (isInside(mousePos, hitboxes.reversed)) resolveChoice("reversed");
  } else if (state.mode === "playing" && state.phase === "await_draw") {
    // Left-click anywhere on canvas to draw if ready
    drawCard();
  } else if (state.mode === "menu") {
    startRun();
  } else if (state.mode === "win" || state.mode === "lose") {
    resetToMenu();
  }
});

function isInside(pos, rect) {
  return pos.x >= rect.x && pos.x <= rect.x + rect.w && pos.y >= rect.y && pos.y <= rect.y + rect.h;
}

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  const isSpace = e.code === "Space" || e.key === " ";

  if (key === "f") toggleFullscreen();
  if (state.mode === "menu" && key === "enter") startRun();
  
  if (state.mode === "playing") {
    if (state.phase === "await_draw" && isSpace) {
      e.preventDefault();
      drawCard();
    }
    if (state.phase === "await_choice" && (key === "u" || key === "r")) {
      resolveChoice(key === "u" ? "upright" : "reversed");
    }
  }

  if ((state.mode === "win" || state.mode === "lose") && key === "enter") {
    resetToMenu();
  }
});

function toggleFullscreen() {
  if (!document.fullscreenElement) canvas.requestFullscreen?.();
  else document.exitFullscreen?.();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addFloat(text, color = "#dfba6b") {
  state.floatingTexts.push({
    text,
    color,
    x: state.seekerX,
    y: TRACK_Y - 40,
    ttl: 1.5
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
  state.eventText = "Click anywhere or press SPACE to draw your next Arcanum.";
  state.finalReading = "";
  state.messageTimer = 4;
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
  const isMajor = Math.random() < 0.35;
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
  state.eventText = "Align your focus. Choose Upright for calculated structure, or Reversed for high-yield volatile outcomes.";
  state.messageTimer = 5;
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
  state.messageTimer = 5;

  if (outcome.destiny !== 0) addFloat(`${outcome.destiny > 0 ? "+" : ""}${outcome.destiny} Destiny`, "#a1db93");
  if (outcome.sanity !== 0) addFloat(`${outcome.sanity > 0 ? "+" : ""}${outcome.sanity} Sanity`, outcome.sanity > 0 ? "#8ecae6" : "#ff8585");

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
    text: `${suitLabel} (${ORIENTATION_LABEL[orientation]}): Shifted destiny by ${formatDelta(effect.destiny, "")} and sanity by ${formatDelta(effect.sanity, "")}.`
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
      text: `The Wheel spins ${ORIENTATION_LABEL[orientation]}! Destiny fluctuates (${formatDelta(destiny, "")}), Sanity warps (${formatDelta(sanity, "")}).`
    };
  }
  const effect = MAJOR_EFFECTS[name][orientation];
  return {
    destiny: effect.destiny,
    sanity: effect.sanity,
    momentum: effect.momentum,
    text: `${name} [${ORIENTATION_LABEL[orientation]}]: Configured fate changes: ${formatDelta(effect.destiny, "Destiny")}, ${formatDelta(effect.sanity, "Sanity")}.`
  };
}

function formatDelta(value, label) {
  return `${value >= 0 ? "+" : ""}${value}${label ? " " + label : ""}`;
}

function buildEndingReading() {
  if (state.mode === "win") {
    if (state.sanity >= 45) return "READING // THE SUN CROWNS YOUR PATH. You completed alignment with immaculate control. Your trajectory points to absolute execution, flawless systems design, and continuous upward scale.";
    if (state.sanity >= 20) return "READING // JUDGEMENT SERVES THE BALANCE. Destiny absolute is realized. However, the path fractured structural reserves. Consolidate your core architecture before taking your next leap.";
    return "READING // THE WORLD ACCEPTS THE SACRIFICE. Victory was drawn from high-risk chaos. Your metrics are achieved but your mental telemetry requires critical downtime. Re-engineer gently next time.";
  }
  if (state.sanity <= 0) {
    if (state.destiny >= 70) return "READING // SYSTEM TOWER CRASH. Your momentum approached the peak, but processing limits breached. Over-allocation of risk vectors ended in a total telemetry wipe.";
    return "READING // ECLIPSED BY THE MOON. Chaos vectors overwhelmed operational clarity. Disengage, restore base parameters, and restructure your risk management thresholds.";
  }
  if (state.destiny >= 90) return "READING // THE CHARIOT MISSED ENGAGEMENT. You stalled meters from the gate. One calculated high-yield reversal would have finished alignment.";
  return "READING // HERMIT ISOLATION ROUTINE. Insufficient momentum output. Re-assess card parameters and stabilize variance patterns to scale the terminal stack successfully.";
}

function checkEndConditions() {
  if (state.sanity <= 0) {
    state.mode = "lose";
    state.finalReading = buildEndingReading();
    state.eventText = "Mental processing threshold breached. Press ENTER or click to recycle workflow.";
    return;
  }
  if (state.destiny >= DESTINY_TARGET) {
    state.mode = "win";
    state.finalReading = buildEndingReading();
    state.eventText = "Destiny target integrated successfully. Press ENTER to seek path variations.";
    return;
  }
  if (state.turnsLeft <= 0) {
    state.mode = "lose";
    state.finalReading = buildEndingReading();
    state.eventText = "Operational clock ran out. Press ENTER to restart simulation.";
  }
}

function update(dt) {
  state.uiAnimTime += dt;
  if (state.messageTimer > 0) state.messageTimer -= dt;

  if (state.mode === "playing") {
    const trackProgress = Math.min(1, state.destiny / DESTINY_TARGET);
    const targetX = BOARD_START_X + (BOARD_END_X - BOARD_START_X) * trackProgress;
    state.seekerX += (targetX - state.seekerX) * (1 - Math.pow(0.001, dt));

    for (const item of state.floatingTexts) {
      item.y -= 45 * dt;
      item.ttl -= dt;
    }
    state.floatingTexts = state.floatingTexts.filter((f) => f.ttl > 0);
  }
}

function drawBoard() {
  // Deep clean background fill
  ctx.fillStyle = "#0c0808";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Modern abstract geometric line highlights (Cyber-Grunge Grid lines)
  ctx.strokeStyle = "rgba(223, 186, 107, 0.04)";
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 80) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
  }

  // Draw Main Horizontal Destiny Rail Block
  const railH = 10;
  ctx.fillStyle = "#1e1515";
  ctx.fillRect(BOARD_START_X - 10, TRACK_Y - railH/2, BOARD_END_X - BOARD_START_X + 20, railH);
  
  // Outer Glowing boundary rail line
  ctx.strokeStyle = "rgba(223, 186, 107, 0.15)";
  ctx.lineWidth = 2;
  ctx.strokeRect(BOARD_START_X - 10, TRACK_Y - railH/2, BOARD_END_X - BOARD_START_X + 20, railH);

  // Structural division ticks on progress rail
  for (let i = 0; i <= 10; i += 1) {
    const x = BOARD_START_X + ((BOARD_END_X - BOARD_START_X) / 10) * i;
    ctx.fillStyle = i === 10 ? "#dfba6b" : "rgba(223, 186, 107, 0.4)";
    ctx.fillRect(x - 1, TRACK_Y - 12, 2, 24);
    
    // Tiny numeric label ticks
    ctx.fillStyle = "rgba(223, 186, 107, 0.3)";
    ctx.font = "10px Syncopate, sans-serif";
    ctx.fillText(`${i*10}`, x - 8, TRACK_Y + 28);
  }

  // Draw current live progress fill inside the rail
  const fillW = Math.max(0, state.seekerX - BOARD_START_X);
  if (fillW > 0) {
    ctx.fillStyle = "linear-gradient";
    const fillGrad = ctx.createLinearGradient(BOARD_START_X, 0, state.seekerX, 0);
    fillGrad.addColorStop(0, "#4a1212");
    fillGrad.addColorStop(1, "#dfba6b");
    ctx.fillStyle = fillGrad;
    ctx.fillRect(BOARD_START_X, TRACK_Y - railH/2 + 1, fillW, railH - 2);
  }

  // Render Seeker Core Node (The Moving Avatar Orb)
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#dfba6b";
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(state.seekerX, TRACK_Y, 9, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#dfba6b";
  ctx.beginPath();
  ctx.arc(state.seekerX, TRACK_Y, 15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0; // reset shadow

  // Axis edge descriptions
  ctx.fillStyle = "#8a7b75";
  ctx.font = "11px Syncopate, sans-serif";
  ctx.fillText("00 // INITIATION_POINT", BOARD_START_X - 10, TRACK_Y - 24);
  ctx.fillStyle = "#dfba6b";
  ctx.fillText("100 // TERMINAL_GATE", BOARD_END_X - 100, TRACK_Y - 24);
}

function drawUi() {
  // --- LEFT HUD STATUS PANEL ---
  const hudX = 60;
  const hudY = 50;

  ctx.fillStyle = "rgba(20, 14, 14, 0.75)";
  ctx.fillRect(hudX, hudY, 800, 110);
  ctx.strokeStyle = "rgba(223, 186, 107, 0.2)";
  ctx.lineWidth = 1;
  ctx.strokeRect(hudX, hudY, 800, 110);

  // Stat Block 1: Destiny
  drawStatItem(hudX + 30, hudY + 30, "DESTINY POOL", `${state.destiny} / ${DESTINY_TARGET}`, state.destiny / DESTINY_TARGET, "#dfba6b");
  // Stat Block 2: Sanity 
  drawStatItem(hudX + 230, hudY + 30, "MENTAL RESERVES", `${state.sanity} %`, state.sanity / 100, "#ff7575");
  // Stat Block 3: Momentum
  drawStatItem(hudX + 430, hudY + 30, "DRIVE MOMENTUM", `${state.momentum} unit`, state.momentum / 20, "#8ecae6");
  // Stat Block 4: Clock
  drawStatItem(hudX + 630, hudY + 30, "CLOCK CYCLES", `${state.turnsLeft} left`, state.turnsLeft / MAX_TURNS, "#ffffff");

  // --- RIGHT INTERACTIVE CARD PREVIEW BLOCKS ---
  const cardPanelX = 920;
  ctx.fillStyle = "rgba(18, 13, 13, 0.9)";
  ctx.fillRect(cardPanelX, hudY, 320, 620);
  ctx.strokeStyle = "rgba(223, 186, 107, 0.25);";
  ctx.strokeRect(cardPanelX, hudY, 320, 620);

  // Top header label inside panel
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.fillRect(cardPanelX, hudY, 320, 36);
  ctx.fillStyle = "#c5a880";
  ctx.font = "11px Syncopate, sans-serif";
  ctx.fillText("DECISION STACK MONITOR", cardPanelX + 20, hudY + 22);

  if (state.currentCard) {
    // Elegant Card frame body
    const cX = cardPanelX + 45;
    const cY = hudY + 65;
    const cW = 230;
    const cH = 320;

    // Subdued card shadow texture backing
    ctx.fillStyle = "#161110";
    ctx.fillRect(cX, cY, cW, cH);
    ctx.strokeStyle = "#dfba6b";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cX, cY, cW, cH);

    // Inner wireframe label border
    ctx.strokeStyle = "rgba(223, 186, 107, 0.2)";
    ctx.strokeRect(cX + 8, cY + 8, cW - 16, cH - 16);

    const isMajor = state.currentCard.type === "major";
    const rawTitle = isMajor ? state.currentCard.name : `${state.currentCard.suit} ${state.currentCard.rank}`;
    const cardTitle = rawTitle.toUpperCase();

    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Cinzel, serif";
    ctx.textAlign = "center";
    ctx.fillText(cardTitle, cX + cW/2, cY + 32);
    ctx.textAlign = "left";

    // Center Illustration Box
    drawTarotArt(state.currentCard, cX + 25, cY + 55, cW - 50, 150);

    // Dynamic Options configuration labels
    const upText = getCardOutcomePreview(state.currentCard, "upright");
    const revText = getCardOutcomePreview(state.currentCard, "reversed");

    // Action Input Selector Blocks 
    drawActionButton(hitboxes.upright, "U // KEY UPRIGHT (STABLE)", upText, isInside(mousePos, hitboxes.upright));
    drawActionButton(hitboxes.reversed, "R // KEY REVERSED (VOLATILE)", revText, isInside(mousePos, hitboxes.reversed));
  } else {
    // Empty deck state UI message placeholders
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(cardPanelX + 30, hudY + 120, 260, 200);
    ctx.fillStyle = "#5c4f4a";
    ctx.font = "12px Syncopate, sans-serif";
    ctx.fillText("AWAITING INTEL DRAW", cardPanelX + 68, hudY + 220);
    
    // Dynamic scan block pulse indicator
    let pulseOpacity = 0.1 + 0.1 * Math.sin(state.uiAnimTime * 4);
    ctx.fillStyle = `rgba(223, 186, 107, ${pulseOpacity})`;
    ctx.fillRect(cardPanelX + 30, hudY + 340, 260, 44);
    ctx.fillStyle = "#dfba6b";
    ctx.font = "11px DM Sans, sans-serif";
    if (state.phase === "await_draw" && state.mode === "playing") {
       ctx.fillText("CLICK SCREEN TO PULL ARCANUM", cardPanelX + 56, hudY + 366);
    }
  }

  // --- LOWER RUNTIME LOG PANEL ---
  const terminalY = 550;
  ctx.fillStyle = "rgba(14, 10, 10, 0.95)";
  ctx.fillRect(hudX, terminalY, 840, 120);
  ctx.strokeStyle = "rgba(223, 186, 107, 0.15)";
  ctx.strokeRect(hudX, terminalY, 840, 120);

  // Terminal label tag header
  ctx.fillStyle = "rgba(223, 186, 107, 0.08)";
  ctx.fillRect(hudX, terminalY, 150, 24);
  ctx.fillStyle = "#dfba6b";
  ctx.font = "10px Syncopate, sans-serif";
  ctx.fillText("SYSTEM EVENT FEED", hudX + 14, terminalY + 16);

  ctx.fillStyle = "#ebdcd5";
  ctx.font = "14px DM Sans, sans-serif";
  const displayMsg = state.mode === "menu" 
    ? "SYSTEM INITIALIZED // Press ENTER or Click anywhere on the dashboard interface grid to begin execution path."
    : state.eventText;
  wrapText(displayMsg, hudX + 24, terminalY + 54, 790, 24);

  // --- RENDER REALTIME FLOATING TEXT FLUIDITY ---
  for (const item of state.floatingTexts) {
    ctx.globalAlpha = Math.max(0, item.ttl / 1.5);
    ctx.fillStyle = item.color;
    ctx.font = "bold 14px Syncopate, sans-serif";
    ctx.fillText(item.text, item.x - 20, item.y);
    ctx.globalAlpha = 1;
  }

  // --- FULL SCREEN MODAL SCREEN FOR TERMINATIONS ---
  if (state.mode === "menu" || state.mode === "win" || state.mode === "lose") {
    ctx.fillStyle = "rgba(8, 6, 6, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const frameCenterX = canvas.width / 2;
    
    ctx.fillStyle = "rgba(24, 18, 18, 0.95)";
    ctx.fillRect(frameCenterX - 400, 160, 800, 400);
    ctx.strokeStyle = "#dfba6b";
    ctx.lineWidth = 2;
    ctx.strokeRect(frameCenterX - 400, 160, 800, 400);

    ctx.textAlign = "center";
    if (state.mode === "menu") {
      ctx.fillStyle = "#ffffff";
      ctx.font = "32px Syncopate, sans-serif";
      ctx.fillText("TAROT WIZARD", frameCenterX, 240);
      ctx.font = "14px Cinzel, serif";
      ctx.fillStyle = "#dfba6b";
      ctx.fillText("INTEGRATED ARCANAL SYSTEM SIMULATION", frameCenterX, 275);
      
      ctx.fillStyle = "#b5a39c";
      ctx.font = "14px DM Sans, sans-serif";
      ctx.fillText("• Balance operational sanity matrix while chasing total fate configuration target (100).", frameCenterX, 340);
      ctx.fillText("• Spacebar or Direct Click pulls structural components from random decks.", frameCenterX, 370);
      ctx.fillText("• Keyboard binds [U] and [R] decode system vectors instantly.", frameCenterX, 400);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px Syncopate, sans-serif";
      ctx.fillText("CLICK HERE OR PRESS ENTER TO INITIALIZE SEQUENCER RUN", frameCenterX, 480);
    } else {
      ctx.fillStyle = state.mode === "win" ? "#a1db93" : "#ff7575";
      ctx.font = "28px Syncopate, sans-serif";
      ctx.fillText(state.mode === "win" ? "FATE FULFILLED // EXECUTION SUCCESS" : "FATE FRACTURED // SEQUENCE TERMINATED", frameCenterX, 230);
      
      ctx.fillStyle = "#ebdcd5";
      ctx.font = "15px DM Sans, sans-serif";
      ctx.textAlign = "left";
      wrapText(state.finalReading || "", frameCenterX - 340, 280, 680, 26);
      
      ctx.textAlign = "center";
      ctx.fillStyle = "#dfba6b";
      ctx.font = "12px Syncopate, sans-serif";
      ctx.fillText("CLICK DISK TO REBOOT OPERATIONAL PIPELINE", frameCenterX, 510);
    }
    ctx.textAlign = "left"; // Restoring default alignment baseline
  }
}

function drawStatItem(x, y, label, valString, pct, accentColor) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "9px Syncopate, sans-serif";
  ctx.fillText(label, x, y);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px DM Sans, sans-serif";
  ctx.fillText(valString, x, y + 24);

  // Tiny minimalist bar meter directly underneath metric readings
  const barW = 140;
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(x, y + 36, barW, 4);
  
  ctx.fillStyle = accentColor;
  ctx.fillRect(x, y + 36, barW * Math.max(0, Math.min(1, pct)), 4);
}

function drawActionButton(rect, label, subtext, isHovered) {
  ctx.fillStyle = isHovered ? "rgba(223, 186, 107, 0.15)" : "rgba(255, 255, 255, 0.02)";
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = isHovered ? "#dfba6b" : "rgba(223, 186, 107, 0.2)";
  ctx.lineWidth = 1;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

  ctx.fillStyle = isHovered ? "#ffffff" : "#c5a880";
  ctx.font = "bold 10px Syncopate, sans-serif";
  ctx.fillText(label, rect.x + 14, rect.y + 22);

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "11px DM Sans, sans-serif";
  ctx.fillText(subtext, rect.x + 14, rect.y + 40);
}

function drawTarotArt(card, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#100c0c";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(223, 186, 107, 0.3)";
  ctx.strokeRect(x, y, w, h);

  const cx = x + w / 2;
  const cy = y + h / 2;

  if (card.type === "minor") {
    drawMinorSymbol(card.suit, cx, cy, Math.min(w, h) * 0.32);
  } else {
    drawMajorSymbol(card.name, cx, cy, Math.min(w, h) * 0.3);
  }
  ctx.restore();
}

function drawMinorSymbol(suit, cx, cy, s) {
  ctx.fillStyle = "#dfba6b";
  ctx.strokeStyle = "#dfba6b";
  ctx.lineWidth = 1.5;

  if (suit === "coins") {
    ctx.beginPath();
    ctx.arc(cx, cy, s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  if (suit === "swords") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.lineTo(cx + 4, cy + s * 0.4);
    ctx.lineTo(cx - 4, cy + s * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - 12, cy + s * 0.2, 24, 3);
    return;
  }
  if (suit === "cups") {
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - s * 0.4);
    ctx.quadraticCurveTo(cx, cy + s * 0.6, cx + 12, cy - s * 0.4);
    ctx.lineTo(cx + 8, cy - s * 0.8);
    ctx.lineTo(cx - 8, cy - s * 0.8);
    ctx.closePath();
    ctx.stroke();
    // base stem line
    ctx.fillRect(cx - 1, cy - s * 0.1, 2, s * 0.7);
    ctx.fillRect(cx - 8, cy + s * 0.6, 16, 2);
    return;
  }
  // Wands configuration wireframe design
  ctx.beginPath();
  ctx.moveTo(cx - 2, cy + s);
  ctx.lineTo(cx + 2, cy - s);
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawMajorSymbol(name, cx, cy, s) {
  ctx.strokeStyle = "#dfba6b";
  ctx.fillStyle = "#dfba6b";
  ctx.lineWidth = 1.5;

  if (name === "The Tower") {
    ctx.strokeRect(cx - 10, cy - s * 0.7, 20, s * 1.4);
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - s * 0.7);
    ctx.lineTo(cx + 14, cy - s * 0.7);
    ctx.lineTo(cx, cy - s * 1.1);
    ctx.closePath();
    ctx.fill();
    return;
  }
  if (name === "The Star") {
    drawStar(cx, cy, s, s * 0.4, 5);
    return;
  }
  if (name === "Wheel of Fortune") {
    ctx.beginPath();
    ctx.arc(cx, cy, s, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(a)*s, cy - Math.sin(a)*s);
      ctx.lineTo(cx + Math.cos(a)*s, cy + Math.sin(a)*s);
      ctx.stroke();
    }
    return;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, s, 0, Math.PI * 2);
  ctx.stroke();
  drawStar(cx, cy, s * 0.5, s * 0.2, 4);
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
    return `Destiny: ${formatDelta(effect.destiny, "")} // Sanity: ${formatDelta(effect.sanity, "")}`;
  }
  if (card.name === "Wheel of Fortune") {
    return orientation === "upright" ? "Destiny: -10..+14 // Sanity: -6..+6" : "Destiny: -16..+20 // Sanity: -10..+8";
  }
  const effect = MAJOR_EFFECTS[card.name][orientation];
  return `Destiny: ${formatDelta(effect.destiny, "")} // Sanity: ${formatDelta(effect.sanity, "")}`;
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
  for (let i = 0; i < steps; i += 1) update(1 / 60);
  render();
};

window.render_game_to_text = () => {
  const payload = {
    coordinateSystem: "origin top-left, +x right, +y down",
    mode: state.mode,
    phase: state.phase,
    seeker: { x: Number(state.seekerX.toFixed(2)), y: TRACK_Y },
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