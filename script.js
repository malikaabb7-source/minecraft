const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const fpsElement = document.getElementById("fps");
const playerPositionElement = document.getElementById("player-position");
const actionMessageElement = document.getElementById("action-message");
const hotbarElement = document.getElementById("hotbar");
const resetButton = document.getElementById("resetButton");
const inventoryToggle = document.getElementById("inventoryToggle");
const inventoryPanel = document.getElementById("inventoryPanel");
const closeInventory = document.getElementById("closeInventory");
const inventoryGrid = document.getElementById("inventoryGrid");
const emptyInventorySlots = document.getElementById("emptyInventorySlots");
const startScreen = document.getElementById("startScreen");
const startGameButton = document.getElementById("startGameButton");
const gamePage = document.getElementById("gamePage");
let gameStarted = false;

const TILE_SIZE = 48;
const WORLD_COLS = 56;
const WORLD_ROWS = 16;

const keys = {
  left: false,
  right: false,
  jump: false,
};

// g=grass, d=dirt, s=stone, t=wood, l=leaves, b=cobble, f=furnace,
// c=coal ore, i=iron ore, o=gold ore, n=diamond ore. No emerald.
const solidTiles = new Set(["g", "d", "s", "t", "l", "c", "i", "o", "n", "f", "b", "w"]);

const images = {
  grassTexture: loadImage("assets/grass-texture.png"),
  grassBlock: loadImage("assets/grass-block.png"),
  dirt: loadImage("assets/soil.jpg"),
  stone: loadImage("assets/rock.png"),
  wood: loadImage("assets/wood.png"),
  leaves: loadImage("assets/leaves.png"),
  cloud: loadImage("assets/cloud.png"),

  pickaxe: loadImage("assets/pickaxe.png"),
  shovel: loadImage("assets/shovel.png"),
  axe: loadImage("assets/axe.png"),

  coalOre: loadImage("assets/coal-ore.png"),
  ironOre: loadImage("assets/iron-ore.png"),
  goldOre: loadImage("assets/gold-ore.png"),
  diamondOre: loadImage("assets/diamond-ore.png"),

  coalItem: loadImage("assets/coal-item.png"),
  ironItem: loadImage("assets/iron-item.png"),
  goldItem: loadImage("assets/gold-item.png"),
  diamondItem: loadImage("assets/diamond-item.png"),
};

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function setMessage(text) {
  actionMessageElement.textContent = text;
}

function startGame() {
  gameStarted = true;
  startScreen.classList.add("hidden");
  gamePage.classList.remove("game-hidden");
  document.body.classList.remove("has-start-screen");
  setMessage("Game started. Select a tool and begin mining.");
}

const world = Array.from({ length: WORLD_ROWS }, () => Array(WORLD_COLS).fill("."));

function clearWorldArray() {
  for (let row = 0; row < WORLD_ROWS; row++) {
    for (let col = 0; col < WORLD_COLS; col++) {
      world[row][col] = ".";
    }
  }
}

function setTile(x, y, type) {
  if (x >= 0 && x < WORLD_COLS && y >= 0 && y < WORLD_ROWS) {
    world[y][x] = type;
  }
}

function fillRect(x, y, width, height, type) {
  for (let row = y; row < y + height; row++) {
    for (let col = x; col < x + width; col++) {
      setTile(col, row, type);
    }
  }
}

function clearRect(x, y, width, height) {
  fillRect(x, y, width, height, ".");
}

function createTree(x, baseY, trunkHeight = 4) {
  for (let i = 0; i < trunkHeight; i++) setTile(x, baseY - i, "t");
  const leafY = baseY - trunkHeight;

  for (let row = leafY - 1; row <= leafY + 1; row++) {
    for (let col = x - 2; col <= x + 2; col++) {
      setTile(col, row, "l");
    }
  }
  for (let col = x - 1; col <= x + 1; col++) setTile(col, leafY - 2, "l");
}

function buildWorld() {
  clearWorldArray();

  fillRect(0, 10, WORLD_COLS, 6, "s");

  fillRect(0, 8, 5, 2, "d");
  for (let i = 0; i < 5; i++) setTile(i, 7, "g");

  fillRect(12, 6, 19, 4, "d");
  for (let i = 12; i < 31; i++) setTile(i, 5, "g");

  fillRect(36, 8, 9, 2, "d");
  for (let i = 36; i < 45; i++) setTile(i, 7, "g");

  fillRect(10, 3, 2, 1, "d");
  setTile(11, 2, "g");
  fillRect(18, 1, 1, 1, "d");
  fillRect(45, 2, 2, 1, "d");
  setTile(45, 1, "g");
  setTile(46, 1, "g");

  fillRect(7, 4, 5, 8, "s");
  fillRect(45, 4, 5, 7, "s");

  clearRect(0, 0, WORLD_COLS, 3);
  clearRect(0, 3, 8, 5);
  clearRect(12, 0, 19, 5);
  clearRect(31, 0, 5, 10);
  clearRect(36, 0, 9, 7);
  clearRect(50, 0, 6, 10);

  clearRect(0, 10, 2, 6);
  clearRect(22, 8, 5, 2);
  clearRect(34, 10, 4, 2);
  clearRect(38, 11, 4, 2);
  clearRect(42, 12, 14, 3);

  setTile(20, 9, "b");
  setTile(20, 8, "f");

  // Coal ore
  setTile(8, 11, "c");
  setTile(9, 11, "c");
  setTile(10, 11, "c");
  setTile(8, 15, "c");
  setTile(9, 15, "c");

  // Iron ore
  setTile(16, 11, "i");
  setTile(17, 11, "i");
  setTile(44, 9, "i");

  // Gold ore: exact image style from user assets
  setTile(20, 11, "o");
  setTile(21, 11, "o");
  setTile(36, 12, "o");

  // Diamond ore: exact image style from user assets
  setTile(25, 12, "n");
  setTile(26, 12, "n");
  setTile(32, 10, "n");

  createTree(33, 6, 4);
  setTile(26, 1, "w");
}

const player = {
  x: 23 * TILE_SIZE,
  y: 7 * TILE_SIZE,
  width: 28,
  height: 42,
  vx: 0,
  vy: 0,
  speed: 4.2,
  jumpForce: 13.5,
  gravity: 0.65,
  maxFallSpeed: 14,
  onGround: false,
};

const camera = { x: 0, y: 0 };

function createHotbar() {
  return [
    { name: "Pickaxe", type: "tool", imageKey: "pickaxe", breaks: ["s", "b", "f", "c", "i", "o", "n"] },
    { name: "Shovel", type: "tool", imageKey: "shovel", breaks: ["d", "g"] },
    { name: "Axe", type: "tool", imageKey: "axe", breaks: ["t", "l", "w"] },
    { name: "Apple", type: "consumable", icon: "🍎", count: 1 },
    { name: "Wood Block", type: "block", imageKey: "wood", places: "t", count: 0, hiddenWhenZero: true },
    { name: "Dirt Block", type: "block", imageKey: "dirt", places: "d", count: 0, hiddenWhenZero: true },
    { name: "Leaves Block", type: "block", imageKey: "leaves", places: "l", count: 0, hiddenWhenZero: true },
    { name: "Cobblestone", type: "block", imageKey: "stone", places: "b", count: 7 },
    { name: "Empty", type: "empty", icon: "" },
  ];
}

let hotbar = createHotbar();
let selectedSlot = 0;
let inventoryResources = createInventoryResources();

function createInventoryResources() {
  return {
    coal: 0,
    iron: 0,
    gold: 0,
    diamond: 0,
    wood: 0,
    dirt: 0,
    leaves: 0,
    cobblestone: 0,
  };
}

const oreDrops = {
  c: "coal",
  i: "iron",
  o: "gold",
  n: "diamond",
  t: "wood",
  w: "wood",
  d: "dirt",
  g: "dirt",
  l: "leaves",
  s: "cobblestone",
  b: "cobblestone",
  f: "cobblestone",
};

const inventoryDisplayItems = [
  { key: "coal", label: "Coal", imageKey: "coalItem" },
  { key: "iron", label: "Iron", imageKey: "ironItem" },
  { key: "gold", label: "Gold", imageKey: "goldItem" },
  { key: "diamond", label: "Diamond", imageKey: "diamondItem" },
  { key: "wood", label: "Wood", imageKey: "wood" },
  { key: "dirt", label: "Dirt", imageKey: "dirt" },
  { key: "leaves", label: "Leaves", imageKey: "leaves" },
  { key: "cobblestone", label: "Cobblestone", imageKey: "stone" },
];

function renderHotbar() {
  hotbarElement.innerHTML = "";

  hotbar.forEach((item, index) => {
    const slot = document.createElement("div");
    slot.className = "slot";
    if (index === selectedSlot) slot.classList.add("selected");

    const unusable = item.type === "empty" || ((item.type === "block" || item.type === "consumable") && (item.count || 0) <= 0);
    if (unusable) slot.classList.add("disabled");

    let content = "";
    if (item.imageKey && images[item.imageKey]) {
      if (item.hiddenWhenZero && (item.count || 0) <= 0) {
        content = "";
      } else {
        content = `<img class="slot-img" src="${images[item.imageKey].src}" alt="${item.name}">`;
      }
    } else {
      content = `<span class="slot-icon">${item.icon || ""}</span>`;
    }

    slot.innerHTML = `${content}${item.count && item.count > 0 ? `<small class="slot-count">${item.count}</small>` : ""}`;
    slot.title = `${index + 1}. ${item.name}`;
    slot.addEventListener("click", () => selectHotbarSlot(index));
    hotbarElement.appendChild(slot);
  });
}

function renderInventory() {
  inventoryGrid.innerHTML = "";

  inventoryDisplayItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "inventory-card";
    const src = images[item.imageKey]?.src || "";
    card.innerHTML = `
      <img src="${src}" alt="${item.label}">
      <div class="label">${item.label}</div>
      <div class="count">${inventoryResources[item.key] || 0}</div>
    `;
    inventoryGrid.appendChild(card);
  });

  emptyInventorySlots.innerHTML = "";
  for (let i = 0; i < 27; i++) {
    const slot = document.createElement("div");
    slot.className = "empty-slot";
    emptyInventorySlots.appendChild(slot);
  }
}

function selectHotbarSlot(index) {
  const item = hotbar[index];
  if (!item) return;

  if (item.type === "empty") {
    setMessage("This slot is empty.");
    return;
  }

  if ((item.type === "block" || item.type === "consumable") && (item.count || 0) <= 0) {
    setMessage(`You do not have any ${item.name}.`);
    return;
  }

  selectedSlot = index;
  renderHotbar();
  setMessage(`${item.name} selected.`);
}

function getSelectedItem() {
  return hotbar[selectedSlot];
}

function addItemToHotbar(tileType) {
  const drop = oreDrops[tileType];
  if (drop && inventoryResources[drop] !== undefined) inventoryResources[drop] += 1;

  if (tileType === "t" || tileType === "w") {
    hotbar[4].count += 1;
    return;
  }

  if (tileType === "d" || tileType === "g") {
    hotbar[5].count += 1;
    return;
  }

  if (tileType === "l") {
    hotbar[6].count += 1;
    return;
  }

  // Only normal stone/cobble/furnace becomes placeable cobblestone.
  // Ores add their resource item to inventory, not cobblestone.
  if (["s", "b", "f"].includes(tileType)) hotbar[7].count += 1;
}

function isSolidTileAt(col, row) {
  if (row < 0 || row >= WORLD_ROWS || col < 0 || col >= WORLD_COLS) return true;
  return solidTiles.has(world[row][col]);
}

function resolveHorizontalCollision() {
  const left = Math.floor(player.x / TILE_SIZE);
  const right = Math.floor((player.x + player.width) / TILE_SIZE);
  const top = Math.floor(player.y / TILE_SIZE);
  const bottom = Math.floor((player.y + player.height - 1) / TILE_SIZE);

  if (player.vx > 0) {
    for (let row = top; row <= bottom; row++) {
      if (isSolidTileAt(right, row)) {
        player.x = right * TILE_SIZE - player.width - 0.01;
        player.vx = 0;
        break;
      }
    }
  }

  if (player.vx < 0) {
    for (let row = top; row <= bottom; row++) {
      if (isSolidTileAt(left, row)) {
        player.x = (left + 1) * TILE_SIZE + 0.01;
        player.vx = 0;
        break;
      }
    }
  }
}

function resolveVerticalCollision() {
  const left = Math.floor(player.x / TILE_SIZE);
  const right = Math.floor((player.x + player.width - 1) / TILE_SIZE);
  const top = Math.floor(player.y / TILE_SIZE);
  const bottom = Math.floor((player.y + player.height) / TILE_SIZE);

  player.onGround = false;

  if (player.vy > 0) {
    for (let col = left; col <= right; col++) {
      if (isSolidTileAt(col, bottom)) {
        player.y = bottom * TILE_SIZE - player.height - 0.01;
        player.vy = 0;
        player.onGround = true;
        break;
      }
    }
  }

  if (player.vy < 0) {
    for (let col = left; col <= right; col++) {
      if (isSolidTileAt(col, top)) {
        player.y = (top + 1) * TILE_SIZE + 0.01;
        player.vy = 0;
        break;
      }
    }
  }
}

function updatePlayer() {
  if (keys.left && !keys.right) player.vx = -player.speed;
  else if (keys.right && !keys.left) player.vx = player.speed;
  else player.vx = 0;

  if (keys.jump && player.onGround) {
    player.vy = -player.jumpForce;
    player.onGround = false;
  }

  player.vy += player.gravity;
  if (player.vy > player.maxFallSpeed) player.vy = player.maxFallSpeed;

  player.x += player.vx;
  resolveHorizontalCollision();

  player.y += player.vy;
  resolveVerticalCollision();

  const maxX = WORLD_COLS * TILE_SIZE - player.width;
  const maxY = WORLD_ROWS * TILE_SIZE - player.height;
  if (player.x < 0) player.x = 0;
  if (player.x > maxX) player.x = maxX;
  if (player.y > maxY) {
    player.y = maxY;
    player.vy = 0;
    player.onGround = true;
  }
}

function updateCamera() {
  camera.x = player.x - canvas.width / 2 + player.width / 2;
  const maxCameraX = WORLD_COLS * TILE_SIZE - canvas.width;
  if (camera.x < 0) camera.x = 0;
  if (camera.x > maxCameraX) camera.x = maxCameraX;
}

function drawBackground() {
  ctx.fillStyle = "#9bd7ee";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawCloud(100, 75, 150, 70);
  drawCloud(440, 120, 140, 60);
  drawCloud(760, 75, 150, 70);
  drawCloud(1160, 90, 170, 75);
}

function drawCloud(x, y, width, height) {
  const screenX = x - camera.x * 0.15;
  if (images.cloud.complete && images.cloud.naturalWidth > 0) ctx.drawImage(images.cloud, screenX, y, width, height);
  else {
    ctx.fillStyle = "white";
    ctx.fillRect(screenX, y, width, height / 2);
  }
}

function drawImageTile(image, x, y) {
  if (image && image.complete && image.naturalWidth > 0) ctx.drawImage(image, x, y, TILE_SIZE, TILE_SIZE);
  else {
    ctx.fillStyle = "#777";
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  }
}

function drawTile(type, x, y) {
  if (type === "g") return drawImageTile(images.grassTexture, x, y);
  if (type === "d") return drawImageTile(images.dirt, x, y);
  if (type === "s" || type === "b") return drawImageTile(images.stone, x, y);
  if (type === "t" || type === "w") return drawImageTile(images.wood, x, y);
  if (type === "l") return drawImageTile(images.leaves, x, y);
  if (type === "c") return drawImageTile(images.coalOre, x, y);
  if (type === "i") return drawImageTile(images.ironOre, x, y);
  if (type === "o") return drawImageTile(images.goldOre, x, y);
  if (type === "n") return drawImageTile(images.diamondOre, x, y);
  if (type === "f") return drawFurnaceTile(x, y);
}

function drawFurnaceTile(x, y) {
  drawImageTile(images.stone, x, y);
  ctx.fillStyle = "#555";
  ctx.fillRect(x + 8, y + 8, 32, 8);
  ctx.fillStyle = "#222";
  ctx.fillRect(x + 11, y + 19, 26, 12);
  ctx.fillStyle = "#ffcc33";
  ctx.fillRect(x + 16, y + 36, 16, 7);
  ctx.fillStyle = "#ff8a00";
  ctx.fillRect(x + 18, y + 32, 12, 5);
}

function drawWorld() {
  for (let row = 0; row < WORLD_ROWS; row++) {
    for (let col = 0; col < WORLD_COLS; col++) {
      const tile = world[row][col];
      if (tile === ".") continue;

      const screenX = col * TILE_SIZE - camera.x;
      const screenY = row * TILE_SIZE - camera.y;
      if (screenX + TILE_SIZE < 0 || screenX > canvas.width || screenY + TILE_SIZE < 0 || screenY > canvas.height) continue;
      drawTile(tile, screenX, screenY);
    }
  }
}

function drawPlayer(px, py) {
  ctx.fillStyle = "#4f46e5";
  ctx.fillRect(px + 6, py + 28, 7, 14);
  ctx.fillRect(px + 16, py + 28, 7, 14);
  ctx.fillStyle = "#25b3ad";
  ctx.fillRect(px + 4, py + 14, 20, 15);
  ctx.fillStyle = "#d7a37b";
  ctx.fillRect(px, py + 16, 4, 10);
  ctx.fillRect(px + 24, py + 16, 4, 10);
  ctx.fillStyle = "#c88f66";
  ctx.fillRect(px + 4, py, 20, 14);
  ctx.fillStyle = "#6b3f1d";
  ctx.fillRect(px + 4, py, 20, 5);
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(px + 9, py + 6, 2, 2);
  ctx.fillRect(px + 16, py + 6, 2, 2);
  ctx.fillStyle = "#b77e5d";
  ctx.fillRect(px + 12, py + 8, 4, 3);
}

function render() {
  drawBackground();
  drawWorld();
  drawPlayer(player.x - camera.x, player.y - camera.y);
}

function updateUI(currentFps) {
  fpsElement.textContent = `FPS: ${currentFps}`;
  playerPositionElement.textContent = `X: ${Math.floor(player.x)} | Y: ${Math.floor(player.y)}`;
}

function canReachTile(col, row) {
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  const tileCenterX = col * TILE_SIZE + TILE_SIZE / 2;
  const tileCenterY = row * TILE_SIZE + TILE_SIZE / 2;
  return Math.hypot(playerCenterX - tileCenterX, playerCenterY - tileCenterY) <= TILE_SIZE * 3.2;
}

function hasSolidNeighbor(col, row) {
  const neighbors = [[col + 1, row], [col - 1, row], [col, row + 1], [col, row - 1]];
  return neighbors.some(([c, r]) => c >= 0 && c < WORLD_COLS && r >= 0 && r < WORLD_ROWS && world[r][c] !== ".");
}

function mineTile(item, col, row) {
  const tile = world[row][col];
  if (tile === ".") {
    setMessage("There is nothing to mine here.");
    return;
  }
  if (!item.breaks.includes(tile)) {
    setMessage(`${item.name} cannot break this block.`);
    return;
  }

  world[row][col] = ".";
  addItemToHotbar(tile);
  renderHotbar();
  renderInventory();

  const drop = oreDrops[tile];
  setMessage(drop ? `${item.name} mined ${drop}.` : `${item.name} mined a block.`);
}

function placeBlock(item, col, row) {
  if ((item.count || 0) <= 0) {
    setMessage(`No ${item.name} left.`);
    return;
  }
  if (world[row][col] !== ".") {
    setMessage("You can only place blocks in empty spaces.");
    return;
  }
  if (!hasSolidNeighbor(col, row)) {
    setMessage("Place the block next to another block.");
    return;
  }

  world[row][col] = item.places;
  item.count -= 1;
  renderHotbar();
  setMessage(`${item.name} placed.`);
}

function useConsumable(item) {
  if ((item.count || 0) <= 0) {
    setMessage(`No ${item.name} left.`);
    return;
  }
  item.count -= 1;
  renderHotbar();
  setMessage(`You used ${item.name}.`);
}

canvas.addEventListener("click", (event) => {
  if (!gameStarted) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (event.clientX - rect.left) * scaleX;
  const mouseY = (event.clientY - rect.top) * scaleY;
  const col = Math.floor((mouseX + camera.x) / TILE_SIZE);
  const row = Math.floor((mouseY + camera.y) / TILE_SIZE);

  if (col < 0 || col >= WORLD_COLS || row < 0 || row >= WORLD_ROWS) return;
  if (!canReachTile(col, row)) {
    setMessage("You are too far from that block.");
    return;
  }

  const item = getSelectedItem();
  if (!item) return;
  if (item.type === "tool") mineTile(item, col, row);
  else if (item.type === "block") placeBlock(item, col, row);
  else if (item.type === "consumable") setMessage("Press F to use the apple.");
  else setMessage("Select a usable slot first.");
});

function resetGame() {
  buildWorld();
  player.x = 23 * TILE_SIZE;
  player.y = 7 * TILE_SIZE;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  camera.x = 0;
  camera.y = 0;
  hotbar = createHotbar();
  inventoryResources = createInventoryResources();
  selectedSlot = 0;
  renderHotbar();
  renderInventory();
  setMessage("World reset successfully.");
}

function toggleInventory() {
  inventoryPanel.classList.toggle("hidden");
  renderInventory();
}

inventoryToggle.addEventListener("click", toggleInventory);
closeInventory.addEventListener("click", toggleInventory);
resetButton.addEventListener("click", resetGame);
startGameButton.addEventListener("click", startGame);

let lastTime = 0;
let fps = 0;

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  fps = Math.max(1, Math.round(1000 / delta));
  if (gameStarted) {
    updatePlayer();
    updateCamera();
    render();
    updateUI(fps);
  }
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (!gameStarted) {
    if (key === "enter") startGame();
    return;
  }

  if (["a", "arrowleft", "d", "arrowright", "w", "arrowup"].includes(key) || event.code === "Space") event.preventDefault();
  if (key === "a" || key === "arrowleft") keys.left = true;
  if (key === "d" || key === "arrowright") keys.right = true;
  if (key === "w" || key === "arrowup" || event.code === "Space") keys.jump = true;
  if (key >= "1" && key <= "9") selectHotbarSlot(Number(key) - 1);
  if (key === "f") {
    const item = getSelectedItem();
    if (item && item.type === "consumable") useConsumable(item);
  }
  if (key === "e") toggleInventory();
});

window.addEventListener("keyup", (event) => {
  if (!gameStarted) return;
  const key = event.key.toLowerCase();
  if (key === "a" || key === "arrowleft") keys.left = false;
  if (key === "d" || key === "arrowright") keys.right = false;
  if (key === "w" || key === "arrowup" || event.code === "Space") keys.jump = false;
});

buildWorld();
renderHotbar();
renderInventory();
setMessage("Final version ready: gold and diamond ores use your exact images, emerald removed.");
requestAnimationFrame(gameLoop);
