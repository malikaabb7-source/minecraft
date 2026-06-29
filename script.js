const cols = 40;
const rows = 22;

const Game = {
    worldArray: [],
    selectedTool: null,
    inventoryTile: null,
    inventorySelected: false,
    initialWorld: [],

    toolsMapping: {
        'axe': ['wood', 'bed', 'bookshelf', 'pumpkin'],
        'pickaxe': ['stone', 'glass'],
        'shovel': ['dirt', 'grass']
    },

    init() {
        this.generateHouseWorld();
        this.resetWorld();

        document.querySelectorAll('.tool').forEach(toolBtn => {
            toolBtn.addEventListener('click', (e) => this.selectTool(e.target));
        });

        document.getElementById('inventory').addEventListener('click', () => this.selectInventory());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetWorld());
    },

    generateHouseWorld() {
        for (let r = 0; r < rows; r++) {
            let row = [];
            for (let c = 0; c < cols; c++) {
                if (r < 17) row.push('air');
                else if (r === 17) row.push('grass');
                else row.push('dirt');
            }
            this.initialWorld.push(row);
        }

        for (let c = 8; c <= 31; c++) {
            this.initialWorld[16][c] = 'wood';
            this.initialWorld[11][c] = 'wood';
        }

        for (let r = 12; r <= 15; r++) {
            this.initialWorld[r][8] = 'wood';
            this.initialWorld[r][31] = 'wood';
        }
        for (let r = 8; r <= 10; r++) {
            this.initialWorld[r][8] = 'wood';
            this.initialWorld[r][31] = 'wood';
        }

        for (let c = 6; c <= 33; c++) this.initialWorld[9][c] = 'stone';
        for (let c = 9; c <= 30; c++) this.initialWorld[8][c] = 'stone';
        for (let c = 12; c <= 27; c++) this.initialWorld[7][c] = 'stone';
        for (let c = 15; c <= 24; c++) this.initialWorld[6][c] = 'stone';
        for (let c = 18; c <= 21; c++) this.initialWorld[5][c] = 'stone';

        for (let r = 13; r <= 15; r++) {
            for (let c = 12; c <= 15; c++) this.initialWorld[r][c] = 'glass';
            for (let c = 24; c <= 27; c++) this.initialWorld[r][c] = 'glass';
        }

        for (let r = 9; r <= 10; r++) {
            for (let c = 16; c <= 18; c++) this.initialWorld[r][c] = 'glass';
            for (let c = 21; c <= 23; c++) this.initialWorld[r][c] = 'glass';
        }

        this.initialWorld[10][14] = 'bed';
        this.initialWorld[10][15] = 'bed';
        
        this.initialWorld[15][18] = 'bookshelf';
        this.initialWorld[14][18] = 'bookshelf';
        this.initialWorld[15][20] = 'bookshelf';
        this.initialWorld[14][20] = 'bookshelf';

        this.initialWorld[16][4] = 'pumpkin';
        this.initialWorld[15][4] = 'pumpkin';
        this.initialWorld[16][35] = 'pumpkin';
    },

    resetWorld() {
        this.worldArray = this.initialWorld.map(row => [...row]);
        this.inventoryTile = null;
        this.selectedTool = null;
        this.inventorySelected = false;
        
        document.querySelectorAll('.tool').forEach(t => t.classList.remove('selected'));
        document.getElementById('inventory').classList.remove('selected');
        
        this.updateInventoryUI();
        this.renderWorld();
    },

    renderWorld() {
        const worldContainer = document.getElementById('world');
        worldContainer.innerHTML = ''; 

        this.worldArray.forEach((row, rIndex) => {
            row.forEach((tileType, cIndex) => {
                const tileDiv = document.createElement('div');
                tileDiv.className = `tile tile-${tileType}`;
                
                tileDiv.addEventListener('click', () => this.clickTile(rIndex, cIndex));
                worldContainer.appendChild(tileDiv);
            });
        });
    },

    selectTool(toolElement) {
        document.querySelectorAll('.tool').forEach(t => t.classList.remove('selected'));
        document.getElementById('inventory').classList.remove('selected');
        
        toolElement.classList.add('selected');
        this.selectedTool = toolElement.dataset.tool;
        this.inventorySelected = false;
    },

    selectInventory() {
        if (this.inventoryTile) {
            this.inventorySelected = true;
            this.selectedTool = null;
            
            document.querySelectorAll('.tool').forEach(t => t.classList.remove('selected'));
            document.getElementById('inventory').classList.add('selected');
        }
    },

    clickTile(r, c) {
        const currentTile = this.worldArray[r][c];

        if (this.selectedTool) {
            const validTiles = this.toolsMapping[this.selectedTool];
            
            if (validTiles.includes(currentTile)) {
                this.addToInventory(currentTile);
                this.worldArray[r][c] = 'air';
                this.renderWorld();
            }
        } 
        else if (this.inventorySelected && this.inventoryTile) {
            if (currentTile === 'air') {
                this.placeFromInventory(r, c);
            }
        }
    },

    addToInventory(tileType) {
        this.inventoryTile = tileType;
        this.updateInventoryUI();
    },

    placeFromInventory(r, c) {
        this.worldArray[r][c] = this.inventoryTile;
        this.inventoryTile = null;
        this.inventorySelected = false;
        
        document.getElementById('inventory').classList.remove('selected');
        this.updateInventoryUI();
        this.renderWorld();
    },

    updateInventoryUI() {
        const inv = document.getElementById('inventory');
        inv.className = ''; 
        
        if (this.inventoryTile) {
            inv.classList.add('tile', `tile-${this.inventoryTile}`);
        }
    }
};

Game.init();
