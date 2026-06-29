const Game = {
    worldArray: [],
    selectedTool: null,
    inventoryTile: null,
    inventorySelected: false,

    initialWorld: [
        ['air', 'air', 'air', 'air', 'air', 'air', 'air', 'air', 'air', 'air'],
        ['air', 'air', 'air', 'air', 'air', 'air', 'air', 'air', 'air', 'air'],
        ['air', 'air', 'air', 'air', 'air', 'tree', 'air', 'air', 'air', 'air'],
        ['air', 'air', 'air', 'air', 'air', 'tree', 'air', 'air', 'air', 'air'],
        ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
        ['dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt'],
        ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock']
    ],

    toolsMapping: {
        'axe': 'tree',
        'pickaxe': 'rock',
        'shovel': 'dirt'
    },

    init() {
        document.getElementById('start-btn').addEventListener('click', () => {
            document.getElementById('landing-page').classList.add('hidden');
            document.getElementById('game-container').classList.remove('hidden');
            this.resetWorld();
        });

        document.querySelectorAll('.tool').forEach(toolBtn => {
            toolBtn.addEventListener('click', (e) => this.selectTool(e.target));
        });

        document.getElementById('inventory').addEventListener('click', () => this.selectInventory());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetWorld());
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
                tileDiv.classList.add('tile', `tile-${tileType}`);
                
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
            const targetTileForTool = this.toolsMapping[this.selectedTool];
            
            if (currentTile === targetTileForTool) {
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
