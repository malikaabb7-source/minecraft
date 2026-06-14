const Game = {
  selectedTool: 'axe',
  selectedInventoryTile: null,
  inventory: {
    wood: 2,
    plank: 18,
    stick: 4,
    coal: 6,
    cobble: 16,
    torch: 8,
    dirt: 13,
    stone: 0,
    grass: 0,
    leaves: 0,
    iron: 0
  },
  toolRules: {
    axe: ['wood', 'leaves'],
    pickaxe: ['stone', 'cobble', 'coal', 'iron'],
    shovel: ['dirt', 'grass']
  },
  originalWorld: [
    ['sky','sky','sky','sky','sky','sky','sky','sky','sky','sky','sky','sky','sky','sky','sky','sky','sky','sky'],
    ['sky','sky','sky','sky','sky','sky','leaves','leaves','leaves','sky','sky','sky','sky','wood','plank','plank','plank','sky'],
    ['sky','sky','grass','sky','sky','leaves','leaves','leaves','leaves','leaves','sky','sky','sky','wood','sky','sky','wood','sky'],
    ['sky','grass','dirt','grass','sky','leaves','leaves','wood','leaves','leaves','sky','sky','grass','plank','plank','plank','wood','sky'],
    ['grass','dirt','stone','dirt','grass','grass','grass','wood','grass','grass','grass','grass','dirt','stone','stone','stone','dirt','grass'],
    ['dirt','stone','stone','stone','dirt','dirt','dirt','dirt','stone','stone','stone','dirt','stone','stone','coal','stone','stone','dirt'],
    ['stone','stone','coal','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','iron','stone','stone','stone','stone'],
    ['stone','coal','coal','coal','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','cobble','stone','stone'],
    ['stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone']
  ],
  world: [],

  init() {
    this.world = this.clone(this.originalWorld);
    this.bindTools();
    this.bindButtons();
    this.renderWorld();
    this.renderHotbar();
    this.renderInventoryGrid();
    this.showMessage('Axe selected. Mine wood or leaves.');
  },

  clone(data) {
    return JSON.parse(JSON.stringify(data));
  },

  renderWorld() {
    const worldDiv = document.getElementById('world');
    worldDiv.innerHTML = '';

    this.world.forEach((row, y) => {
      row.forEach((tile, x) => {
        const block = document.createElement('div');
        block.className = `tile ${tile}`;
        block.dataset.x = x;
        block.dataset.y = y;
        block.title = tile;

        block.addEventListener('mouseenter', () => {
          document.getElementById('coords').textContent = `X: ${x} | Y: ${y}`;
        });

        block.addEventListener('click', () => this.handleTileClick(y, x));
        worldDiv.appendChild(block);
      });
    });
  },

  handleTileClick(y, x) {
    const tile = this.world[y][x];

    if (this.selectedInventoryTile && tile === 'sky') {
      this.placeTile(y, x);
      return;
    }

    if (!this.selectedTool) {
      this.showMessage('Choose a tool first.');
      return;
    }

    if (this.toolRules[this.selectedTool].includes(tile)) {
      this.mineTile(y, x, tile);
    } else if (tile === 'sky') {
      this.showMessage('This is sky. Select an inventory block to place something here.');
    } else {
      this.showMessage(`Wrong tool. ${this.selectedTool} cannot remove ${tile}.`);
    }
  },

  mineTile(y, x, tile) {
    this.world[y][x] = 'sky';
    this.inventory[tile] = (this.inventory[tile] || 0) + 1;
    this.selectedInventoryTile = null;
    this.renderWorld();
    this.renderHotbar();
    this.renderInventoryGrid();
    this.showMessage(`${tile} collected!`);
  },

  placeTile(y, x) {
    const type = this.selectedInventoryTile;
    if (!type || this.inventory[type] <= 0) return;
    this.world[y][x] = type;
    this.inventory[type]--;
    if (this.inventory[type] === 0) this.selectedInventoryTile = null;
    this.renderWorld();
    this.renderHotbar();
    this.renderInventoryGrid();
    this.showMessage(`${type} placed.`);
  },

  bindTools() {
    document.querySelectorAll('.tool').forEach(button => {
      button.addEventListener('click', () => {
        this.selectedTool = button.dataset.tool;
        this.selectedInventoryTile = null;
        document.querySelectorAll('.tool').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        this.renderHotbar();
        this.renderInventoryGrid();
        this.showMessage(`${button.textContent.trim()} selected.`);
      });
    });
  },

  bindButtons() {
    document.getElementById('resetBtn').addEventListener('click', () => this.resetWorld());
    document.getElementById('craftBtn').addEventListener('click', () => {
      document.getElementById('inventoryModal').classList.toggle('hidden');
    });
    document.getElementById('inventoryModal').addEventListener('click', (e) => {
      if (e.target.id === 'inventoryModal') e.target.classList.add('hidden');
    });
  },

  renderHotbar() {
    const hotbar = document.getElementById('hotbar');
    const items = ['axe','pickaxe','shovel','plank','stick','coal','cobble','torch','dirt'];
    hotbar.innerHTML = '';

    items.forEach(item => {
      const slot = document.createElement('div');
      slot.className = 'slot';

      if (item === this.selectedInventoryTile || item === this.selectedTool) slot.classList.add('selected');

      const icon = document.createElement('div');
      icon.className = `icon ${this.itemClass(item)}`;
      slot.appendChild(icon);

      const count = this.getCount(item);
      if (count !== null) {
        const countSpan = document.createElement('span');
        countSpan.className = 'count';
        countSpan.textContent = count;
        slot.appendChild(countSpan);
      }

      if (this.inventory[item] !== undefined) {
        slot.addEventListener('click', () => this.selectInventoryTile(item));
      }

      hotbar.appendChild(slot);
    });
  },

  renderInventoryGrid() {
    const grid = document.getElementById('inventoryGrid');
    const items = Object.keys(this.inventory);
    grid.innerHTML = '';

    for (let i = 0; i < 27; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      const item = items[i];
      if (item) {
        const icon = document.createElement('div');
        icon.className = `icon ${this.itemClass(item)}`;
        slot.appendChild(icon);
        const count = document.createElement('span');
        count.className = 'count';
        count.textContent = this.inventory[item];
        slot.appendChild(count);
        slot.addEventListener('click', () => this.selectInventoryTile(item));
      }
      grid.appendChild(slot);
    }
  },

  selectInventoryTile(item) {
    if (this.inventory[item] <= 0) {
      this.showMessage(`No ${item} left.`);
      return;
    }
    this.selectedInventoryTile = item;
    this.selectedTool = null;
    document.querySelectorAll('.tool').forEach(btn => btn.classList.remove('selected'));
    this.renderHotbar();
    this.renderInventoryGrid();
    this.showMessage(`${item} selected. Click a sky block to place it.`);
  },

  itemClass(item) {
    const map = { axe: 'axe-tool', pickaxe: 'pickaxe-tool', shovel: 'shovel-tool', torch: 'torch' };
    return map[item] || item;
  },

  getCount(item) {
    if (this.inventory[item] !== undefined) return this.inventory[item];
    if (['axe','pickaxe','shovel'].includes(item)) return null;
    return null;
  },

  resetWorld() {
    this.world = this.clone(this.originalWorld);
    this.inventory = { wood: 2, plank: 18, stick: 4, coal: 6, cobble: 16, torch: 8, dirt: 13, stone: 0, grass: 0, leaves: 0, iron: 0 };
    this.selectedTool = 'axe';
    this.selectedInventoryTile = null;
    document.querySelectorAll('.tool').forEach(btn => btn.classList.remove('selected'));
    document.querySelector('[data-tool="axe"]').classList.add('selected');
    this.renderWorld();
    this.renderHotbar();
    this.renderInventoryGrid();
    this.showMessage('World reset. Axe selected.');
  },

  showMessage(text) {
    document.getElementById('message').textContent = text;
  }
};

Game.init();
