"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const requestFrame = window.requestAnimationFrame
  ? window.requestAnimationFrame.bind(window)
  : (callback) => window.setTimeout(() => callback(performance.now()), 1000 / 60);

const ui = {
  menu: document.getElementById("menuScreen"),
  game: document.getElementById("gameScreen"),
  result: document.getElementById("resultScreen"),
  teamGrid: document.getElementById("teamGrid"),
  driverGrid: document.getElementById("driverGrid"),
  garageTeamName: document.getElementById("garageTeamName"),
  garageStats: document.getElementById("garageStats"),
  liveryPreview: document.getElementById("liveryPreview"),
  lapSelect: document.getElementById("lapSelect"),
  paceSelect: document.getElementById("paceSelect"),
  startButton: document.getElementById("startButton"),
  pauseButton: document.getElementById("pauseButton"),
  pauseBanner: document.getElementById("pauseBanner"),
  garageButton: document.getElementById("garageButton"),
  resultTitle: document.getElementById("resultTitle"),
  standingsList: document.getElementById("standingsList"),
  restartButton: document.getElementById("restartButton"),
  backButton: document.getElementById("backButton")
};

const TEAMS = [
  {
    id: "lerari",
    name: "Lerari",
    tag: "Rosso ama hizli",
    colors: ["#d92f26", "#ffd247"],
    accent: "#ffd247",
    stats: { top: 0.92, accel: 0.86, grip: 0.74, drs: 0.82 },
    drivers: [
      { name: "Luca Rosso", tag: "son fren", skill: 0.87 },
      { name: "Mira Veloce", tag: "temiz apex", skill: 0.84 }
    ]
  },
  {
    id: "red-gull",
    name: "Red Gull",
    tag: "kanat var, marti yok",
    colors: ["#243b8f", "#f04b37"],
    accent: "#f2c14e",
    stats: { top: 0.89, accel: 0.94, grip: 0.9, drs: 0.78 },
    drivers: [
      { name: "Max Gale", tag: "gec fren", skill: 0.94 },
      { name: "Rio Pepper", tag: "savunma", skill: 0.83 }
    ]
  },
  {
    id: "mclemon",
    name: "McLemon",
    tag: "papaya tadinda",
    colors: ["#f28b20", "#2bc4b6"],
    accent: "#2bc4b6",
    stats: { top: 0.85, accel: 0.9, grip: 0.88, drs: 0.86 },
    drivers: [
      { name: "Oscar Peel", tag: "sessiz hiz", skill: 0.88 },
      { name: "Lando Zest", tag: "atak tur", skill: 0.89 }
    ]
  },
  {
    id: "mercdash",
    name: "Mercdash",
    tag: "gri ok, mavi isik",
    colors: ["#c8d2d8", "#35d0c4"],
    accent: "#35d0c4",
    stats: { top: 0.88, accel: 0.8, grip: 0.86, drs: 0.9 },
    drivers: [
      { name: "Lewis Hallow", tag: "lastik felsefesi", skill: 0.91 },
      { name: "George Flash", tag: "tek tur", skill: 0.86 }
    ]
  },
  {
    id: "axton",
    name: "Axton Martian",
    tag: "yesil gezegen",
    colors: ["#0f6d4d", "#b7ff5a"],
    accent: "#b7ff5a",
    stats: { top: 0.79, accel: 0.76, grip: 0.92, drs: 0.76 },
    drivers: [
      { name: "Nando Orbit", tag: "usta savasci", skill: 0.9 },
      { name: "Lance Comet", tag: "cesur ic cizgi", skill: 0.76 }
    ]
  },
  {
    id: "alpina",
    name: "Alpina Baguette",
    tag: "mavi pembe tempo",
    colors: ["#2776d2", "#ff5aa5"],
    accent: "#ff5aa5",
    stats: { top: 0.78, accel: 0.82, grip: 0.8, drs: 0.82 },
    drivers: [
      { name: "Pierre Crumb", tag: "ritim", skill: 0.81 },
      { name: "Esti Beacon", tag: "uzun stint", skill: 0.8 }
    ]
  },
  {
    id: "wheelsiams",
    name: "Wheelsiams",
    tag: "klasik garaj",
    colors: ["#1f5fd0", "#f5f6fb"],
    accent: "#6fa7ff",
    stats: { top: 0.83, accel: 0.72, grip: 0.73, drs: 0.88 },
    drivers: [
      { name: "Alex Shore", tag: "duzluk ustasi", skill: 0.82 },
      { name: "Logan Lane", tag: "cesaret", skill: 0.74 }
    ]
  },
  {
    id: "hoss",
    name: "Hoss Factory",
    tag: "kirmizi siyah atak",
    colors: ["#f1f1e6", "#d13d35"],
    accent: "#d13d35",
    stats: { top: 0.74, accel: 0.8, grip: 0.77, drs: 0.74 },
    drivers: [
      { name: "Nico Hammer", tag: "sert fren", skill: 0.79 },
      { name: "Kevin Sparks", tag: "dar kapi", skill: 0.78 }
    ]
  }
];

const PACE = {
  rookie: 1.01,
  club: 1.08,
  pro: 1.17
};

const CONTROL_KEYS = [
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ShiftLeft",
  "ShiftRight",
  "Space"
];
function bindTouch(buttonId, key) {
  const btn = document.getElementById(buttonId);

  const press = (e) => {
    e.preventDefault();
    keys.add(key);
  };

  const release = (e) => {
    e.preventDefault();
    keys.delete(key);
  };

  btn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  press(e);
}, { passive: false });
  btn.addEventListener("mousedown", press);

  btn.addEventListener("touchend", (e) => {
  e.preventDefault();
  release(e);
}, { passive: false });
  btn.addEventListener("mouseup", release);

  btn.addEventListener("touchcancel", release);
}
const CAMERA = {
  horizon: 54,
  nearDepth: 22,
  depthScale: 155,
  farDepth: 2600
};

const TRACK_TURNS = [
  { start: 880, end: 1640, strength: 0.86, label: "SAG VIRAJ" },
  { start: 2580, end: 3360, strength: -1.02, label: "SOL VIRAJ" },
  { start: 4380, end: 4980, strength: 0.62, label: "HIZLI SAG" },
  { start: 5820, end: 6520, strength: -0.94, label: "FINAL SOL" }
];

const keys = new Set();
let selectedTeam = TEAMS[0];
let selectedDriver = selectedTeam.drivers[0];
let lastTime = performance.now();
let rafId = 0;
let loopStarted = false;

  const game = {
  state: "menu",
  paused: false,
  laps: 3,
  lapLength: 6800,
  totalLength: 20400,
  time: 0,
  countdown: 0,
  player: null,
  opponents: [],
  screenShake: 0,
  message: "",
  messageTime: 0,
  finished: false
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothStep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function curveSegment(distance, start, end, strength) {
  const lapDistance = ((distance % game.lapLength) + game.lapLength) % game.lapLength;
  if (lapDistance < start || lapDistance > end) return 0;
  const t = (lapDistance - start) / (end - start);
  const fadeIn = smoothStep(Math.min(t * 2.2, 1));
  const fadeOut = smoothStep(Math.min((1 - t) * 2.2, 1));
  return strength * Math.min(fadeIn, fadeOut);
}

function lapDistance(distance) {
  return ((distance % game.lapLength) + game.lapLength) % game.lapLength;
}

function distanceToLapPoint(fromDistance, targetLapPoint) {
  const current = lapDistance(fromDistance);
  let delta = targetLapPoint - current;
  if (delta < 0) delta += game.lapLength;
  return delta;
}

function getUpcomingTurn(distance, lookAhead) {
  let best = null;
  TRACK_TURNS.forEach((turn) => {
    const startDelta = distanceToLapPoint(distance, turn.start);
    const endDelta = distanceToLapPoint(distance, turn.end);
    const inside = endDelta < startDelta;
    const delta = inside ? 0 : startDelta;
    if (delta <= lookAhead && (!best || delta < best.delta)) {
      best = { ...turn, delta, inside };
    }
  });
  return best;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const rawSecs = Math.floor(seconds % 60).toString();
  const secs = rawSecs.length < 2 ? `0${rawSecs}` : rawSecs;
  const tenths = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs}.${tenths}`;
}

function showScreen(screen) {
  for (const node of [ui.menu, ui.game, ui.result]) {
    node.classList.toggle("is-active", node === screen);
  }
}

function makeMiniCar(team) {
  return `
    <span class="mini-car" style="--c1:${team.colors[0]};--c2:${team.colors[1]}">
      <span class="mini-shadow"></span>
      <span class="mini-tire-a"></span>
      <span class="mini-tire-b"></span>
      <span class="mini-body"></span>
      <span class="mini-side"></span>
      <span class="mini-nose"></span>
      <span class="mini-cockpit"></span>
    </span>
  `;
}

function renderMenu() {
  ui.teamGrid.innerHTML = "";
  TEAMS.forEach((team) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `team-card${team === selectedTeam ? " is-selected" : ""}`;
    button.innerHTML = `
      <span class="team-name">${team.name}</span>
      <span class="team-tag">${team.tag}</span>
      ${makeMiniCar(team)}
    `;
    button.addEventListener("click", () => {
      selectedTeam = team;
      selectedDriver = team.drivers[0];
      renderMenu();
    });
    ui.teamGrid.appendChild(button);
  });

  ui.garageTeamName.textContent = selectedTeam.name;
  ui.liveryPreview.style.setProperty("--c1", selectedTeam.colors[0]);
  ui.liveryPreview.style.setProperty("--c2", selectedTeam.colors[1]);
  ui.liveryPreview.innerHTML = `
    <span class="preview-road"></span>
    <span class="preview-line"></span>
    <span class="preview-car-shadow"></span>
    <span class="preview-tyre-a"></span>
    <span class="preview-tyre-b"></span>
    <span class="preview-wing"></span>
    <span class="preview-body"></span>
    <span class="preview-nose"></span>
    <span class="preview-cockpit"></span>
  `;

  const statLabels = [
    ["Top", selectedTeam.stats.top],
    ["Accel", selectedTeam.stats.accel],
    ["Grip", selectedTeam.stats.grip],
    ["DRS", selectedTeam.stats.drs]
  ];
  ui.garageStats.innerHTML = statLabels.map(([label, value]) => `
    <div class="team-stat-row" style="--accent:${selectedTeam.accent}">
      <span>${label}</span>
      <span class="stat-bar"><i style="width:${Math.round(value * 100)}%"></i></span>
    </div>
  `).join("");

  ui.driverGrid.innerHTML = "";
  selectedTeam.drivers.forEach((driver) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `driver-card${driver === selectedDriver ? " is-selected" : ""}`;
    button.innerHTML = `
      <span class="driver-name">${driver.name}</span>
      <span class="driver-tag">${driver.tag}</span>
    `;
    button.addEventListener("click", () => {
      selectedDriver = driver;
      renderMenu();
    });
    ui.driverGrid.appendChild(button);
  });
}

function buildOpponents() {
  const pool = [];
  TEAMS.forEach((team) => {
    team.drivers.forEach((driver) => {
      if (team.id !== selectedTeam.id || driver.name !== selectedDriver.name) {
        pool.push({ team, driver });
      }
    });
  });

  pool.sort((a, b) => {
    const aScore = a.driver.skill + a.team.stats.top * 0.22 + a.team.stats.grip * 0.18;
    const bScore = b.driver.skill + b.team.stats.top * 0.22 + b.team.stats.grip * 0.18;
    return bScore - aScore;
  });

  const rivals = pool.slice(0, 9);
  const lanes = [-0.52, 0, 0.52, -0.28, 0.28, -0.74, 0.74, -0.12, 0.12];
  return rivals.map((entry, index) => {
    const front = index < 7;
    return {
      ...entry,
      distance: front ? 85 + index * 54 : -30 - (index - 7) * 42,
      lane: lanes[index % lanes.length],
      targetLane: lanes[index % lanes.length],
      speed: 128 + entry.driver.skill * 38,
      wobble: Math.random() * Math.PI * 2,
      finishTime: null
    };
  });
}

function startRace() {
  game.laps = Number(ui.lapSelect.value);
  game.lapLength = 6800;
  game.totalLength = game.lapLength * game.laps;
  game.time = 0;
  game.countdown = 3.2;
  game.paused = false;
  game.finished = false;
  game.screenShake = 0;
  game.message = "HAZIR";
  game.messageTime = 1.1;
  const stats = selectedTeam.stats;
  game.player = {
    team: selectedTeam,
    driver: selectedDriver,
    lane: 0,
    speed: 70,
    distance: 0,
    gear: 2,
    drs: 100,
    drsActive: false,
    finishTime: null,
    offTrackTimer: 0,
    collisionTimer: 0,
    steering: 0,
    heading: 0,
    turnSlip: 0,
    closeCallTimer: 0
  };
  game.opponents = buildOpponents();
  game.state = "race";
  showScreen(ui.game);
  ui.pauseBanner.classList.remove("is-active");
  lastTime = performance.now();
  if (typeof canvas.focus === "function") {
    try {
      canvas.focus({ preventScroll: true });
    } catch (error) {
      canvas.focus();
    }
  }
  draw();
  ensureLoop();
}

function returnToGarage() {
  game.state = "menu";
  game.paused = false;
  showScreen(ui.menu);
}

function getCurve(distance) {
  const lap = lapDistance(distance);
  let curve = Math.sin(lap / 1200 + 0.45) * 0.025;
  TRACK_TURNS.forEach((turn) => {
    curve += curveSegment(lap, turn.start, turn.end, turn.strength);
  });
  return clamp(curve, -1.16, 1.16);
}

function isDrsZone() {
  if (!game.player) return false;
  const c1 = Math.abs(getCurve(game.player.distance + 110));
  const c2 = Math.abs(getCurve(game.player.distance + 320));
  const lapProgress = lapDistance(game.player.distance);
  const markedZone = (lapProgress > 90 && lapProgress < 720) || (lapProgress > 5120 && lapProgress < 5740);
  return markedZone && c1 < 0.24 && c2 < 0.26 && Math.abs(game.player.lane) < 1.02 && Math.abs(game.player.heading) < 0.34;
}

function updateRace(dt) {
  if (game.paused || game.finished) return;

  if (game.countdown > 0) {
    game.countdown -= dt;
    if (game.countdown <= 0) {
      game.message = "GO";
      game.messageTime = 0.75;
    }
  } else {
    game.time += dt;
  }

  if (game.messageTime > 0) game.messageTime -= dt;
  if (game.screenShake > 0) game.screenShake = Math.max(0, game.screenShake - dt * 14);

  updatePlayer(dt);
  updateOpponents(dt);
  checkCollisions();

  if (game.player.distance >= game.totalLength && game.player.finishTime === null) {
    game.player.finishTime = game.time;
    game.finished = true;
    showResults();
  }
}

function updatePlayer(dt) {
  const player = game.player;
  const stats = selectedTeam.stats;
  const paceGate = game.countdown <= 0;
  const accelKey = true;
  const brakeKey = keys.has("KeyS") || keys.has("ArrowDown");
  const leftKey = keys.has("KeyA") || keys.has("ArrowLeft");
  const rightKey = keys.has("KeyD") || keys.has("ArrowRight");
  const shiftKey = keys.has("ShiftLeft") || keys.has("ShiftRight");
  const drsAvailable = paceGate && isDrsZone() && player.drs > 0 && player.speed > 145;

  player.drsActive = drsAvailable && shiftKey;

  const maxSpeed = 286 + stats.top * 64 + selectedDriver.skill * 16 + (player.drsActive ? 34 + stats.drs * 20 : 0);
  const accel = (56 + stats.accel * 34) * (player.drsActive ? 1.18 : 1);
  const drag = 10 + Math.max(0, player.speed - 245) * 0.034;
  const brake = brakeKey ? 126 : 0;

  if (paceGate && accelKey) {
    player.speed += accel * dt;
  } else if (paceGate) {
    player.speed -= drag * dt;
  }

  if (brakeKey) player.speed -= brake * dt;
  if (!paceGate) player.speed = lerp(player.speed, 66, dt * 1.8);
  player.speed = clamp(player.speed, 0, maxSpeed);

  const steeringInput = (rightKey ? 1 : 0) - (leftKey ? 1 : 0);
  player.steering = lerp(player.steering, steeringInput, Math.min(1, dt * 8));
  const grip = 1.02 + stats.grip * 0.42;
  const speedFactor = clamp(player.speed / 320, 0.18, 1.16);
  const trackTurn = getCurve(player.distance + 120);
  const steeringPower = (1.08 + stats.grip * 0.76) * (0.56 + speedFactor * 0.66);
  const requiredTurn = trackTurn * (0.68 + speedFactor * 0.42);
  player.heading += (player.steering * steeringPower - requiredTurn) * dt;
  player.heading = lerp(player.heading, 0, Math.min(1, dt * (0.42 + stats.grip * 0.2)));
  player.heading = clamp(player.heading, -1.25, 1.25);
  player.lane += player.heading * dt * (0.86 + speedFactor * 1.82);
  player.turnSlip = Math.abs(player.heading - trackTurn * 0.12);

  if (Math.abs(player.lane) > 1) {
    player.offTrackTimer = 0.22;
    player.speed -= (26 + Math.abs(player.lane) * 24) * dt;
    player.heading *= 0.98;
  } else {
    player.offTrackTimer = Math.max(0, player.offTrackTimer - dt);
  }

  if (Math.abs(player.lane) > 1.36) {
    player.lane = Math.sign(player.lane) * 1.36;
    player.speed *= 0.95;
    player.heading *= 0.82;
    game.screenShake = Math.max(game.screenShake, 2.2);
  }

  if (player.turnSlip > 0.78 && player.speed > 170) {
    player.speed -= player.turnSlip * 9 * dt;
  }

  if (player.drsActive) {
    player.drs = Math.max(0, player.drs - dt * (22 - stats.drs * 5));
  } else {
    const regen = isDrsZone() ? 5 : 11;
    player.drs = Math.min(100, player.drs + dt * regen);
  }

  player.distance += (paceGate ? player.speed : 0) * dt;
  player.distance = Math.min(player.distance, game.totalLength);
  player.gear = clamp(Math.floor(player.speed / 47) + 1, 1, 8);
  player.collisionTimer = Math.max(0, player.collisionTimer - dt);
  player.closeCallTimer = Math.max(0, player.closeCallTimer - dt);
}

function updateOpponents(dt) {
  const playerDistance = game.player.distance;
  const aiPace = PACE[ui.paceSelect.value] || 1;
  game.opponents.forEach((ai, index) => {
    if (ai.finishTime !== null) return;
    const curvePenalty = Math.abs(getCurve(ai.distance + 190)) * 15;
    const base = 232 + ai.team.stats.top * 48 + ai.driver.skill * 32;
    const rubber = clamp((playerDistance - ai.distance) / 900, -0.045, 0.075);
    const target = (base - curvePenalty) * aiPace * (1 + rubber);
    ai.speed = lerp(ai.speed, target, dt * 0.72);
    ai.distance += ai.speed * dt;
    ai.wobble += dt * (0.8 + index * 0.04);
    const desired = Math.sin(ai.distance / 720 + index) * 0.38 + Math.sin(ai.wobble) * 0.07;
    ai.targetLane = clamp(desired, -0.82, 0.82);
    ai.lane = lerp(ai.lane, ai.targetLane, dt * 1.8);

    if (ai.distance >= game.totalLength) {
      ai.distance = game.totalLength + 1;
      ai.finishTime = game.time;
    }
  });
}

function checkCollisions() {
  const player = game.player;
  if (game.countdown > 0) return;
  for (const ai of game.opponents) {
    const rel = ai.distance - player.distance;
    const laneGap = Math.abs(ai.lane - player.lane);
    if (rel > 0 && rel < 115 && laneGap < 0.38) {
      player.closeCallTimer = 0.18;
    }
    if (rel > -12 && rel < 34 && laneGap < 0.28 && player.collisionTimer <= 0) {
      player.speed = Math.max(45, Math.min(player.speed, ai.speed * 0.72));
      player.lane -= Math.sign(ai.lane - player.lane || 1) * 0.16;
      player.heading -= Math.sign(ai.lane - player.lane || 1) * 0.16;
      player.collisionTimer = 0.55;
      game.screenShake = 4.5;
      game.message = "TEMAS";
      game.messageTime = 0.55;
      break;
    }
  }
}

function getRaceOrder() {
  const entrants = [
    {
      isPlayer: true,
      team: selectedTeam,
      driver: selectedDriver,
      distance: game.player.distance,
      finishTime: game.player.finishTime,
      speed: game.player.speed
    },
    ...game.opponents.map((ai) => ({
      isPlayer: false,
      team: ai.team,
      driver: ai.driver,
      distance: ai.distance,
      finishTime: ai.finishTime,
      speed: ai.speed
    }))
  ];

  return entrants.sort((a, b) => {
    if (a.finishTime !== null && b.finishTime !== null) return a.finishTime - b.finishTime;
    if (a.finishTime !== null) return -1;
    if (b.finishTime !== null) return 1;
    return b.distance - a.distance;
  });
}

function showResults() {
  const order = getRaceOrder();
  const playerRank = order.findIndex((entry) => entry.isPlayer) + 1;
  ui.resultTitle.textContent = playerRank === 1 ? "Zafer" : `${playerRank}. Sira`;
  ui.standingsList.innerHTML = "";
  order.forEach((entry, index) => {
    const li = document.createElement("li");
    if (entry.isPlayer) li.classList.add("player-row");
    const when = entry.finishTime !== null ? formatTime(entry.finishTime) : `${Math.floor(entry.distance)}m`;
    li.innerHTML = `
      <strong>${index + 1}</strong>
      <span>
        ${entry.driver.name}
        <span class="standing-team">${entry.team.name}</span>
      </span>
      <time>${when}</time>
    `;
    ui.standingsList.appendChild(li);
  });
  game.state = "result";
  showScreen(ui.result);
}

function draw() {
  if (game.state === "race") {
    renderRace();
  } else {
    drawAttract();
  }
}

function drawAttract() {
  ctx.fillStyle = "#11161b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function perspectiveFromDepth(depth) {
  return clamp(1 / (((depth - CAMERA.nearDepth) / CAMERA.depthScale) + 1), 0.055, 1);
}

function depthFromPerspective(p) {
  return CAMERA.nearDepth + (1 / Math.max(0.055, p) - 1) * CAMERA.depthScale;
}

function roadWidthFromPerspective(p) {
  return 12 + Math.pow(p, 1.55) * 268;
}

function roadCenterForDepth(depth, roadW, p, W) {
  const player = game.player;
  let heading = -player.heading * 0.72;
  let offset = 0;
  const steps = Math.max(4, Math.ceil(depth / 86));
  const step = depth / steps;

  for (let i = 1; i <= steps; i += 1) {
    const ahead = i * step;
    heading += getCurve(player.distance + ahead) * step * 0.00185;
    offset += heading * step * (0.145 + p * 0.035);
  }

  const cameraSwing = -player.heading * W * (0.16 + (1 - p) * 0.15);
  const laneShift = -player.lane * roadW * 0.44;
  return W / 2 + offset + cameraSwing + laneShift;
}

function roadProjection(depth, W, H, horizon) {
  const p = perspectiveFromDepth(depth);
  const y = horizon + p * (H - horizon);
  const roadW = roadWidthFromPerspective(p);
  const center = roadCenterForDepth(depth, roadW, p, W);
  return { center, depth, p, roadW, y };
}

function renderRace() {
  if (!game.player) {
    drawAttract();
    return;
  }
  const W = canvas.width;
  const H = canvas.height;
  const speedShake = Math.max(0, (game.player.speed - 245) / 82);
  const totalShake = game.screenShake + speedShake;
  const shakeX = Math.round((Math.random() - 0.5) * totalShake);
  const shakeY = Math.round((Math.random() - 0.5) * totalShake);

  ctx.save();
  try {
    ctx.translate(shakeX, shakeY);
    drawWorld(W, H);
    drawOpponents(W, H);
    drawCockpit(W, H);
    drawHud(W, H);
  } finally {
    ctx.restore();
  }
}

function drawWorld(W, H) {
  const horizon = CAMERA.horizon;
  const player = game.player;
  const distance = player.distance;
  const curve = getCurve(distance + 320);
  const speedT = clamp(player.speed / 360, 0, 1);
  const skyTop = player.drsActive ? "#173044" : "#253b58";
  const skyBottom = player.drsActive ? "#2d5b62" : "#5c87a1";

  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, skyTop);
  sky.addColorStop(1, skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, horizon);

  drawPixelSun(W - 42 - curve * 12, 20);
  drawMountains(W, horizon, curve, distance);
  drawDistantCity(W, horizon, distance, curve);

  for (let y = horizon; y < H; y += 1) {
    const p = clamp((y - horizon) / (H - horizon), 0.055, 1);
    const depth = depthFromPerspective(p);
    const roadW = roadWidthFromPerspective(p);
    const center = roadCenterForDepth(depth, roadW, p, W);
    const rumbleW = Math.max(3, roadW * 0.07);
    const shoulderW = Math.max(4, roadW * 0.12);
    const left = Math.round(center - roadW / 2);
    const right = Math.round(center + roadW / 2);
    const stripe = (Math.floor((distance + depth * (1 + speedT * 0.22)) / 48) % 2) === 0;
    const asphaltShade = (Math.floor((distance + depth) / 86) % 2) === 0;
    const laneW = roadW / 3;

    ctx.fillStyle = stripe ? "#365e3b" : "#294d32";
    ctx.fillRect(0, y, W, 1);

    ctx.fillStyle = "#253536";
    ctx.fillRect(left - shoulderW, y, shoulderW, 1);
    ctx.fillRect(right, y, shoulderW, 1);

    ctx.fillStyle = stripe ? "#e8e0c5" : "#be3134";
    ctx.fillRect(left - rumbleW, y, rumbleW, 1);
    ctx.fillRect(right, y, rumbleW, 1);

    ctx.fillStyle = asphaltShade ? "#343941" : "#2c3138";
    ctx.fillRect(left, y, right - left, 1);

    if (p > 0.14 && (Math.floor((distance + depth) / 76) % 2) === 0) {
      ctx.fillStyle = "#ece4c8";
      const lineW = Math.max(1, Math.round(2 * p));
      ctx.fillRect(Math.round(center - laneW / 2) - 1, y, lineW, 1);
      ctx.fillRect(Math.round(center + laneW / 2) - 1, y, lineW, 1);
    }

    if (p > 0.22) {
      ctx.fillStyle = "#d7d2c0";
      ctx.fillRect(left + Math.max(1, Math.round(roadW * 0.018)), y, Math.max(1, Math.round(2 * p)), 1);
      ctx.fillRect(right - Math.max(2, Math.round(roadW * 0.022)), y, Math.max(1, Math.round(2 * p)), 1);
    }

    if (player.drsActive && p > 0.55 && y % 3 === 0) {
      ctx.fillStyle = "#55d6c2";
      ctx.fillRect(left + 5, y, 3, 1);
      ctx.fillRect(right - 8, y, 3, 1);
    }
  }

  drawRiver(W, H, horizon, distance);
  drawScenery(W, H, horizon, distance);
  drawTrackSideObjects(W, H, horizon, curve, distance);
  drawTurnEntryGates(W, H, horizon, distance);
  drawSpeedLines(W, H, speedT);
}

function drawPixelSun(x, y) {
  ctx.fillStyle = "#f2c14e";
  ctx.fillRect(Math.round(x), Math.round(y), 14, 14);
  ctx.fillStyle = "#ffe08a";
  ctx.fillRect(Math.round(x + 3), Math.round(y + 3), 8, 8);
}

function drawMountains(W, horizon, curve, distance) {
  const offset = (distance * 0.015 + curve * 30) % 64;
  ctx.fillStyle = "#253142";
  for (let i = -1; i < 7; i++) {
    const x = i * 64 - offset;
    ctx.beginPath();
    ctx.moveTo(x, horizon);
    ctx.lineTo(x + 22, horizon - 24 - (i % 2) * 8);
    ctx.lineTo(x + 52, horizon);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "#1d2735";
  ctx.fillRect(0, horizon - 7, W, 7);
}

function drawDistantCity(W, horizon, distance, curve) {
  const offset = (distance * 0.028 + curve * 18) % 96;
  ctx.fillStyle = "#202b38";
  for (let i = -1; i < 7; i += 1) {
    const x = Math.round(i * 64 - offset);
    const h = 10 + ((i * 7) % 17);
    ctx.fillRect(x, horizon - h - 7, 18, h);
    ctx.fillRect(x + 22, horizon - h - 3, 12, h - 4);
    ctx.fillRect(x + 40, horizon - h - 12, 20, h + 5);
  }
  ctx.fillStyle = "#f2c14e";
  for (let i = -1; i < 9; i += 1) {
    const x = Math.round(i * 48 - offset * 0.6);
    ctx.fillRect(x + 7, horizon - 15, 2, 2);
    ctx.fillRect(x + 27, horizon - 21, 2, 2);
  }
}

function drawTrackSideObjects(W, H, horizon, curve, distance) {
  for (let depth = 150; depth < CAMERA.farDepth; depth += 150) {
    const projection = roadProjection(depth, W, H, horizon);
    const turn = getCurve(distance + depth + 220);
    const boardSide = Math.abs(turn) > 0.38 ? Math.sign(turn) : (Math.floor((distance + depth) / 300) % 2 === 0 ? -1 : 1);
    const x = projection.center + boardSide * (projection.roadW * 0.68 + 20 * projection.p);
    const y = projection.y;
    const size = Math.max(3, Math.round(18 * projection.p));

    if (Math.abs(turn) > 0.38) {
      drawChevronSign(x, y, size, Math.sign(turn));
    } else if (depth < 1300) {
      drawBrakeMarker(x, y, size, depth);
    }

    if (projection.p > 0.18) {
      const railY = Math.round(y + Math.max(2, 7 * projection.p));
      ctx.fillStyle = "#c8d2d8";
      ctx.fillRect(Math.round(projection.center - projection.roadW * 0.67), railY, Math.max(2, Math.round(28 * projection.p)), Math.max(1, Math.round(2 * projection.p)));
      ctx.fillRect(Math.round(projection.center + projection.roadW * 0.55), railY, Math.max(2, Math.round(28 * projection.p)), Math.max(1, Math.round(2 * projection.p)));
    }
  }
}

function drawScenery(W, H, horizon, distance) {
  for (let depth = 190; depth < CAMERA.farDepth; depth += 175) {
    const projection = roadProjection(depth, W, H, horizon);
    const slot = Math.floor((distance + depth) / 175);
    const p = projection.p;

    [-1, 1].forEach((side) => {
      const type = Math.abs((slot + side * 3) % 7);
      const sway = Math.sin(slot * 1.7 + side) * projection.roadW * 0.08;
      const x = projection.center + side * (projection.roadW * (0.86 + (type % 3) * 0.13) + 20 * p) + sway;
      const y = projection.y + 10 * p;

      if (type === 0 || type === 4) {
        drawTree(x, y, p, type === 4);
      } else if (type === 1) {
        drawGrandstand(x, y, p, side);
      } else if (type === 2) {
        drawBuilding(x, y, p);
      } else if (type === 3) {
        drawBillboard(x, y, p, side);
      } else {
        drawBushLine(x, y, p);
      }
    });
  }
}

function drawTree(x, y, p, tall) {
  const trunkH = Math.max(3, Math.round((tall ? 18 : 12) * p));
  const crown = Math.max(4, Math.round((tall ? 18 : 13) * p));
  const px = Math.round(x);
  const py = Math.round(y);
  ctx.fillStyle = "#4a3424";
  ctx.fillRect(px - Math.max(1, Math.round(2 * p)), py - trunkH, Math.max(2, Math.round(4 * p)), trunkH);
  ctx.fillStyle = tall ? "#1d6b3a" : "#2d8a45";
  ctx.fillRect(px - Math.round(crown / 2), py - trunkH - crown, crown, crown);
  ctx.fillStyle = "#69b85d";
  ctx.fillRect(px - Math.round(crown / 4), py - trunkH - crown + Math.max(1, Math.round(3 * p)), Math.max(2, Math.round(crown / 2)), Math.max(2, Math.round(crown / 4)));
}

function drawGrandstand(x, y, p, side) {
  const w = Math.max(7, Math.round(54 * p));
  const h = Math.max(5, Math.round(24 * p));
  const px = Math.round(x - w / 2);
  const py = Math.round(y - h);
  ctx.fillStyle = "#151a20";
  ctx.fillRect(px, py, w, h);
  ctx.fillStyle = "#c8d2d8";
  ctx.fillRect(px, py, w, Math.max(2, Math.round(4 * p)));
  ctx.fillStyle = "#f24d3d";
  ctx.fillRect(px + Math.round(4 * p), py + Math.round(7 * p), Math.max(2, Math.round(w * 0.18)), Math.max(1, Math.round(3 * p)));
  ctx.fillStyle = "#f2c14e";
  ctx.fillRect(px + Math.round(w * 0.36), py + Math.round(8 * p), Math.max(2, Math.round(w * 0.16)), Math.max(1, Math.round(3 * p)));
  ctx.fillStyle = "#55d6c2";
  ctx.fillRect(px + Math.round(w * 0.62), py + Math.round(7 * p), Math.max(2, Math.round(w * 0.18)), Math.max(1, Math.round(3 * p)));
  ctx.fillStyle = "#29323b";
  ctx.fillRect(px - side * Math.round(5 * p), py + h - Math.max(2, Math.round(4 * p)), w, Math.max(1, Math.round(3 * p)));
}

function drawBuilding(x, y, p) {
  const w = Math.max(5, Math.round(32 * p));
  const h = Math.max(7, Math.round(42 * p));
  const px = Math.round(x - w / 2);
  const py = Math.round(y - h);
  ctx.fillStyle = "#283545";
  ctx.fillRect(px, py, w, h);
  ctx.fillStyle = "#101216";
  ctx.fillRect(px + Math.max(1, Math.round(4 * p)), py + Math.max(1, Math.round(6 * p)), Math.max(2, Math.round(5 * p)), Math.max(2, Math.round(5 * p)));
  ctx.fillRect(px + Math.round(w * 0.58), py + Math.max(1, Math.round(12 * p)), Math.max(2, Math.round(5 * p)), Math.max(2, Math.round(5 * p)));
  ctx.fillStyle = "#f2c14e";
  ctx.fillRect(px + Math.round(w * 0.35), py + Math.round(h * 0.62), Math.max(2, Math.round(4 * p)), Math.max(2, Math.round(5 * p)));
}

function drawBillboard(x, y, p, side) {
  const w = Math.max(6, Math.round(42 * p));
  const h = Math.max(4, Math.round(16 * p));
  const px = Math.round(x - w / 2);
  const py = Math.round(y - h);
  ctx.fillStyle = "#11161b";
  ctx.fillRect(px - 1, py - 1, w + 2, h + 2);
  ctx.fillStyle = side > 0 ? "#f2c14e" : "#55d6c2";
  ctx.fillRect(px, py, w, h);
  ctx.fillStyle = "#11161b";
  ctx.font = `${Math.max(5, Math.round(7 * p))}px Courier New`;
  ctx.textAlign = "center";
  ctx.fillText("PIT", px + w / 2, py + h - Math.max(1, Math.round(4 * p)));
  ctx.fillStyle = "#171b20";
  ctx.fillRect(Math.round(x - 1), Math.round(y), 2, Math.max(3, Math.round(16 * p)));
}

function drawBushLine(x, y, p) {
  const w = Math.max(8, Math.round(34 * p));
  const h = Math.max(3, Math.round(9 * p));
  ctx.fillStyle = "#236438";
  ctx.fillRect(Math.round(x - w / 2), Math.round(y - h), w, h);
  ctx.fillStyle = "#59c36a";
  ctx.fillRect(Math.round(x - w / 3), Math.round(y - h - Math.max(1, Math.round(2 * p))), Math.max(3, Math.round(w / 2)), Math.max(1, Math.round(3 * p)));
}

function drawRiver(W, H, horizon, distance) {
  const start = 1680;
  const end = 2210;
  const lap = lapDistance(distance);
  const visible = lap < end + 900 && lap > start - 1500;
  if (!visible) return;

  for (let depth = 150; depth < 1200; depth += 50) {
    const world = lapDistance(distance + depth);
    const inRiver = world > start && world < end;
    if (!inRiver) continue;
    const projection = roadProjection(depth, W, H, horizon);
    const side = -1;
    const width = Math.max(4, Math.round(62 * projection.p));
    const x = Math.round(projection.center + side * (projection.roadW * 0.9 + width * 0.7));
    const y = Math.round(projection.y);
    ctx.fillStyle = "#2d8ea8";
    ctx.fillRect(x - width, y, width * 2, Math.max(2, Math.round(10 * projection.p)));
    ctx.fillStyle = "#9be7f1";
    ctx.fillRect(x - Math.round(width * 0.7), y + Math.max(1, Math.round(3 * projection.p)), Math.max(2, Math.round(width * 0.55)), Math.max(1, Math.round(2 * projection.p)));
  }
}

function drawTurnEntryGates(W, H, horizon, distance) {
  const turn = getUpcomingTurn(distance, 1600);
  if (!turn || turn.delta < 60 || turn.delta > CAMERA.farDepth) return;
  const projection = roadProjection(turn.delta + 60, W, H, horizon);
  const direction = Math.sign(turn.strength);
  const p = projection.p;
  const y = Math.round(projection.y - Math.max(3, 18 * p));
  const left = Math.round(projection.center - projection.roadW * 0.5);
  const right = Math.round(projection.center + projection.roadW * 0.5);
  const postH = Math.max(5, Math.round(34 * p));
  const chevrons = Math.max(2, Math.round(4 * p));

  ctx.fillStyle = "#11161b";
  ctx.fillRect(left - 3, y - postH, Math.max(2, Math.round(4 * p)), postH);
  ctx.fillRect(right, y - postH, Math.max(2, Math.round(4 * p)), postH);
  ctx.fillStyle = Math.abs(turn.strength) > 0.84 ? "#f24d3d" : "#f2c14e";
  for (let i = 0; i < chevrons; i += 1) {
    const x = lerp(left + 10 * p, right - 10 * p, (i + 0.5) / chevrons);
    ctx.font = `${Math.max(6, Math.round(14 * p))}px Courier New`;
    ctx.textAlign = "center";
    ctx.fillText(direction > 0 ? ">" : "<", x, y - postH + Math.max(6, Math.round(15 * p)));
  }
}

function drawSpeedLines(W, H, speedT) {
  if (speedT < 0.42) return;
  const count = Math.round(6 + speedT * 12);
  const alpha = 0.12 + speedT * 0.2;
  ctx.fillStyle = `rgba(244,240,220,${alpha})`;
  for (let i = 0; i < count; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const rawX = side < 0 ? 4 + (i * 17) % 64 : W - 6 - (i * 19) % 64;
    const y = CAMERA.horizon + 14 + ((game.player.distance * (0.32 + speedT * 0.7) + i * 37) % (H - CAMERA.horizon - 54));
    const len = Math.max(5, Math.round(12 * speedT));
    const width = Math.max(2, Math.round(8 * speedT));
    const x = side < 0 ? rawX : rawX - width;
    ctx.fillRect(Math.round(x), Math.round(y), width, len);
  }
}

function drawChevronSign(x, y, size, direction) {
  const px = Math.round(x - size / 2);
  const py = Math.round(y - size);
  ctx.fillStyle = "#11161b";
  ctx.fillRect(px - 1, py - 1, size + 2, size + 2);
  ctx.fillStyle = "#f2c14e";
  ctx.fillRect(px, py, size, size);
  ctx.fillStyle = "#11161b";
  ctx.font = `${Math.max(6, Math.round(size * 0.85))}px Courier New`;
  ctx.textAlign = "center";
  ctx.fillText(direction > 0 ? ">" : "<", px + size / 2, py + size - 2);
  ctx.fillStyle = "#171b20";
  ctx.fillRect(Math.round(x - 1), Math.round(y), 2, Math.max(3, Math.round(size * 0.9)));
}

function drawBrakeMarker(x, y, size, depth) {
  const marker = Math.max(1, 4 - Math.floor(depth / 280));
  ctx.fillStyle = "#e7eadf";
  ctx.fillRect(Math.round(x - size / 2), Math.round(y - size), size, size);
  ctx.fillStyle = "#171b20";
  ctx.font = `${Math.max(5, Math.round(size * 0.58))}px Courier New`;
  ctx.textAlign = "center";
  ctx.fillText(String(marker), Math.round(x), Math.round(y - size * 0.25));
  ctx.fillRect(Math.round(x - 1), Math.round(y), 2, Math.max(3, Math.round(size * 0.8)));
}

function projectCar(ai, W, H) {
  const rel = ai.distance - game.player.distance;
  if (rel < -26 || rel > 1600) return null;
  const projection = roadProjection(rel + 34, W, H, CAMERA.horizon);
  const laneGap = Math.abs(ai.lane - game.player.lane);
  const x = projection.center + ai.lane * projection.roadW * 0.38;
  const danger = rel > -8 && rel < 125 && laneGap < 0.42;
  return {
    x,
    y: projection.y + Math.max(1, 9 * projection.p),
    p: clamp(projection.p * 1.32, 0.11, 1.22),
    rel,
    danger,
    laneGap
  };
}

function drawOpponents(W, H) {
  const projected = game.opponents
    .map((ai) => ({ ai, projection: projectCar(ai, W, H) }))
    .filter((item) => item.projection)
    .sort((a, b) => b.projection.rel - a.projection.rel);

  projected.forEach(({ ai, projection }) => {
    drawPixelCar(projection.x, projection.y, projection.p, ai.team.colors, ai.team.accent, projection.danger, projection.rel);
  });
}

function drawPixelCar(x, y, scale, colors, accent, danger, rel) {
  const s = clamp(scale, 0.13, 1.18);
  const w = Math.round(36 * s);
  const h = Math.round(22 * s);
  const px = Math.round(x - w / 2);
  const py = Math.round(y - h);
  const tireW = Math.max(2, Math.round(5 * s));
  const tireH = Math.max(2, Math.round(8 * s));

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(px + Math.round(4 * s), py + h - 1, w - Math.round(8 * s), Math.max(2, Math.round(3 * s)));

  if (danger) {
    ctx.fillStyle = rel < 48 ? "rgba(242,77,61,0.34)" : "rgba(242,193,78,0.22)";
    ctx.fillRect(px - Math.round(5 * s), py - Math.round(5 * s), w + Math.round(10 * s), h + Math.round(9 * s));
    ctx.fillStyle = rel < 48 ? "#f24d3d" : "#f2c14e";
    const bracket = Math.max(3, Math.round(8 * s));
    ctx.fillRect(px - bracket, py - bracket, bracket, Math.max(2, Math.round(2 * s)));
    ctx.fillRect(px - bracket, py - bracket, Math.max(2, Math.round(2 * s)), bracket);
    ctx.fillRect(px + w, py - bracket, bracket, Math.max(2, Math.round(2 * s)));
    ctx.fillRect(px + w + bracket - Math.max(2, Math.round(2 * s)), py - bracket, Math.max(2, Math.round(2 * s)), bracket);
  }

  ctx.fillStyle = "#06080a";
  ctx.fillRect(px + Math.round(3 * s), py + Math.round(10 * s), tireW, tireH);
  ctx.fillRect(px + w - tireW - Math.round(3 * s), py + Math.round(10 * s), tireW, tireH);

  ctx.fillStyle = colors[0];
  ctx.fillRect(px + Math.round(8 * s), py + Math.round(8 * s), w - Math.round(16 * s), Math.max(4, Math.round(9 * s)));
  ctx.fillStyle = colors[1];
  ctx.fillRect(px + Math.round(13 * s), py + Math.round(3 * s), w - Math.round(26 * s), Math.max(4, Math.round(8 * s)));
  ctx.fillRect(px + Math.round(5 * s), py + Math.round(14 * s), w - Math.round(10 * s), Math.max(3, Math.round(4 * s)));
  ctx.fillStyle = "#071018";
  ctx.fillRect(px + Math.round(16 * s), py + Math.round(6 * s), Math.max(2, Math.round(5 * s)), Math.max(2, Math.round(5 * s)));
  ctx.fillStyle = accent;
  ctx.fillRect(px + Math.round(11 * s), py + Math.round(17 * s), w - Math.round(22 * s), Math.max(1, Math.round(2 * s)));

  if (danger && rel < 70) {
    ctx.fillStyle = "#ff8a75";
    ctx.fillRect(px + Math.round(8 * s), py + h - Math.round(5 * s), Math.max(2, Math.round(5 * s)), Math.max(1, Math.round(2 * s)));
    ctx.fillRect(px + w - Math.round(13 * s), py + h - Math.round(5 * s), Math.max(2, Math.round(5 * s)), Math.max(1, Math.round(2 * s)));
  }
}

function drawCockpit(W, H) {
  const player = game.player;
  const c1 = selectedTeam.colors[0];
  const c2 = selectedTeam.colors[1];
  const y = H - 54;

  ctx.fillStyle = "#07090b";
  ctx.fillRect(0, H - 38, W, 38);
  ctx.fillStyle = "#11161b";
  ctx.fillRect(0, H - 31, W, 31);

  ctx.fillStyle = c1;
  ctx.fillRect(W / 2 - 54, y + 16, 108, 17);
  ctx.fillStyle = c2;
  ctx.fillRect(W / 2 - 15, y - 3, 30, 45);
  ctx.fillStyle = "#050607";
  ctx.fillRect(W / 2 - 72, y + 24, 30, 23);
  ctx.fillRect(W / 2 + 42, y + 24, 30, 23);
  ctx.fillStyle = c2;
  ctx.fillRect(W / 2 - 86, y + 31, 172, 9);

  ctx.fillStyle = "#0d1218";
  ctx.fillRect(W / 2 - 37, H - 31, 74, 27);
  ctx.fillStyle = "#202832";
  ctx.fillRect(W / 2 - 31, H - 25, 62, 17);
  ctx.fillStyle = player.drsActive ? "#55d6c2" : "#f2c14e";
  ctx.font = "8px Courier New";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(player.speed)} KMH`, W / 2, H - 14);
  ctx.fillText(`G${player.gear}`, W / 2, H - 5);

  const wheelX = W / 2 + player.steering * 8;
  ctx.fillStyle = "#050607";
  ctx.fillRect(Math.round(wheelX - 38), H - 19, 76, 6);
  ctx.fillRect(Math.round(wheelX - 31), H - 29, 12, 19);
  ctx.fillRect(Math.round(wheelX + 19), H - 29, 12, 19);
  ctx.fillStyle = "#2b333c";
  ctx.fillRect(Math.round(wheelX - 18), H - 27, 36, 15);
  ctx.fillStyle = c2;
  ctx.fillRect(Math.round(wheelX - 8), H - 22, 16, 4);
}

function drawHud(W, H) {
  const player = game.player;
  const order = getRaceOrder();
  const pos = order.findIndex((entry) => entry.isPlayer) + 1;
  const lap = clamp(Math.floor(player.distance / game.lapLength) + 1, 1, game.laps);
  const drsZone = isDrsZone();

  drawTurnCue(W, H);

  ctx.font = "8px Courier New";
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(0,0,0,0.68)";
  ctx.fillRect(5, 5, 94, 32);
  ctx.fillStyle = "#f4f0dc";
  ctx.fillText(`SIRA ${pos}/${order.length}`, 10, 15);
  ctx.fillText(`TUR ${lap}/${game.laps}`, 10, 25);
  ctx.fillStyle = "#a9b2b8";
  ctx.fillText(formatTime(game.time), 10, 35);

  ctx.fillStyle = "rgba(0,0,0,0.68)";
  ctx.fillRect(W - 104, 5, 99, 32);
  ctx.fillStyle = drsZone ? "#55d6c2" : "#a9b2b8";
  ctx.fillText(player.drsActive ? "DRS ACIK" : "DRS", W - 99, 15);
  ctx.strokeStyle = "#39424e";
  ctx.strokeRect(W - 99, 20, 88, 8);
  ctx.fillStyle = player.drsActive ? "#55d6c2" : "#f2c14e";
  ctx.fillRect(W - 98, 21, Math.round(86 * player.drs / 100), 6);

  if (player.offTrackTimer > 0) {
    ctx.fillStyle = "#f2c14e";
    ctx.textAlign = "center";
    ctx.fillText("PIST DISI", W / 2, 52);
  }

  if (player.closeCallTimer > 0) {
    ctx.fillStyle = "#f24d3d";
    ctx.textAlign = "center";
    ctx.font = "9px Courier New";
    ctx.fillText("YAKIN", W / 2, H - 45);
  }

  if (game.messageTime > 0 && game.message) {
    ctx.fillStyle = game.message === "GO" ? "#59c36a" : "#f2c14e";
    ctx.font = "18px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(game.message, W / 2, 83);
  }

  if (game.countdown > 0) {
    const number = Math.ceil(game.countdown);
    ctx.fillStyle = "#f2c14e";
    ctx.font = "26px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(String(number), W / 2, 82);
  }
}

function drawTurnCue(W, H) {
  const upcoming = getUpcomingTurn(game.player.distance, 1300);
  const near = getCurve(game.player.distance + 190);
  const far = getCurve(game.player.distance + 660);
  const curve = upcoming && !upcoming.inside ? upcoming.strength : near * 0.62 + far * 0.38;
  const strength = Math.abs(curve);
  if (strength < 0.22 && !upcoming) return;

  const direction = curve > 0 ? 1 : -1;
  const boxW = 92;
  const x = W / 2 - boxW / 2;
  const y = 7;
  ctx.fillStyle = "rgba(0,0,0,0.62)";
  ctx.fillRect(x, y, boxW, 21);
  ctx.fillStyle = strength > 0.78 ? "#f24d3d" : "#f2c14e";
  ctx.font = "8px Courier New";
  ctx.textAlign = "center";
  const label = upcoming ? upcoming.label : (direction > 0 ? "SAG VIRAJ" : "SOL VIRAJ");
  const distanceLabel = upcoming && !upcoming.inside ? ` ${Math.round(upcoming.delta)}M` : "";
  ctx.fillText(`${label}${distanceLabel}`, W / 2, y + 8);

  const arrows = strength > 0.95 ? 3 : strength > 0.55 ? 2 : 1;
  for (let i = 0; i < arrows; i += 1) {
    ctx.fillText(direction > 0 ? ">" : "<", W / 2 + (i - 1) * 9, y + 18);
  }
}

function loop(now) {
  const dt = clamp((now - lastTime) / 1000, 0, 0.05);
  lastTime = now;
  try {
    updateRace(dt);
    draw();
  } catch (error) {
    console.error(error);
    drawErrorScreen(error);
  }
  rafId = requestFrame(loop);
}

function ensureLoop() {
  if (loopStarted) return;
  loopStarted = true;
  rafId = requestFrame(loop);
}

function drawErrorScreen(error) {
  ctx.fillStyle = "#11161b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f2c14e";
  ctx.font = "12px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("YARIS YENIDEN HAZIRLANIYOR", canvas.width / 2, 80);
  ctx.fillStyle = "#a9b2b8";
  ctx.font = "8px Courier New";
  ctx.fillText(String(error && error.message ? error.message : error).slice(0, 36), canvas.width / 2, 96);
  game.state = "menu";
  window.setTimeout(() => {
    showScreen(ui.menu);
  }, 900);
}

window.addEventListener("keydown", (event) => {
  if (CONTROL_KEYS.indexOf(event.code) !== -1) {
    event.preventDefault();
  }
  keys.add(event.code);
  if (event.code === "Space" && game.state === "race") {
    game.paused = !game.paused;
    ui.pauseBanner.classList.toggle("is-active", game.paused);
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

ui.startButton.addEventListener("click", startRace);
ui.restartButton.addEventListener("click", startRace);
ui.backButton.addEventListener("click", returnToGarage);
ui.garageButton.addEventListener("click", returnToGarage);
ui.pauseButton.addEventListener("click", () => {
  if (game.state !== "race") return;
  game.paused = !game.paused;
  ui.pauseBanner.classList.toggle("is-active", game.paused);
});

renderMenu();
drawAttract();
ensureLoop();
