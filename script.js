const originalWorld = [
  ["sky", "sky", "sky", "sky", "tree", "sky", "sky", "tree", "sky", "sky"],
  ["sky", "sky", "sky", "tree", "tree", "sky", "sky", "tree", "sky", "sky"],
  ["sky", "sky", "sky", "sky", "tree", "sky", "sky", "sky", "sky", "sky"],
  ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],
  ["dirt", "dirt", "dirt", "dirt", "rock", "dirt", "dirt", "rock", "dirt", "dirt"],
  ["dirt", "rock", "dirt", "rock", "rock", "dirt", "rock", "rock", "dirt", "rock"],
  ["rock", "rock", "rock", "rock", "rock", "rock", "rock", "rock", "rock", "rock"]
];

let world = JSON.parse(JSON.stringify(originalWorld));
let selectedTool = null;
let selectedInventoryTile = null;

const inventory = {
  tree: 0,
  dirt: 0,
  rock: 0
};

const worldDiv = document.getElementById("world");
const inventoryDiv = document.getElementById("inventory");
const resetBtn = document.getElementById("resetBtn");

function renderWorld() {
  worldDiv.innerHTML = "";

  world.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      const tileDiv = document.createElement("div");

      tileDiv.classList.add("tile", tile);
      tileDiv.title = tile;

      tileDiv.addEventListener("click", () => {
        handleTileClick(rowIndex, colIndex);
      });

      worldDiv.appendChild(tileDiv);
    });
  });
}

function renderInventory() {
  inventoryDiv.innerHTML = "";

  for (let type in inventory) {
    const item = document.createElement("div");

    item.classList.add("inventory-item");

    if (selectedInventoryTile === type) {
      item.classList.add("selected");
    }

    item.textContent = `${getEmoji(type)} ${type}: ${inventory[type]}`;

    item.addEventListener("click", () => {
      if (inventory[type] > 0) {
        selectedInventoryTile = type;
        selectedTool = null;
        clearToolSelection();
        renderInventory();
      }
    });

    inventoryDiv.appendChild(item);
  }
}

function getEmoji(type) {
  if (type === "tree") return "🌳";
  if (type === "dirt") return "🟫";
  if (type === "rock") return "🪨";
  return "";
}

function handleTileClick(row, col) {
  const tile = world[row][col];

  if (selectedInventoryTile && tile === "sky" && inventory[selectedInventoryTile] > 0) {
    world[row][col] = selectedInventoryTile;
    inventory[selectedInventoryTile]--;
    selectedInventoryTile = null;
    renderWorld();
    renderInventory();
    return;
  }

  if (selectedTool === "axe" && tile === "tree") {
    removeTile(row, col, "tree");
  } else if (selectedTool === "pickaxe" && tile === "rock") {
    removeTile(row, col, "rock");
  } else if (selectedTool === "shovel" && tile === "dirt") {
    removeTile(row, col, "dirt");
  }
}

function removeTile(row, col, type) {
  world[row][col] = "sky";
  inventory[type]++;

  renderWorld();
  renderInventory();
}

function clearToolSelection() {
  document.querySelectorAll("#toolbar button").forEach(btn => {
    btn.classList.remove("selected");
  });
}

document.querySelectorAll("#toolbar button").forEach(button => {
  button.addEventListener("click", () => {
    selectedTool = button.dataset.tool;
    selectedInventoryTile = null;

    clearToolSelection();
    button.classList.add("selected");

    renderInventory();
  });
});

resetBtn.addEventListener("click", () => {
  world = JSON.parse(JSON.stringify(originalWorld));

  inventory.tree = 0;
  inventory.dirt = 0;
  inventory.rock = 0;

  selectedTool = null;
  selectedInventoryTile = null;

  clearToolSelection();

  renderWorld();
  renderInventory();
});

renderWorld();
renderInventory();
