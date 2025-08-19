const container = document.getElementById('puzzle-container');
const shuffleButton = document.getElementById('shuffle-button');

let tiles = [];
const emptyTile = { row: 3, col: 3 };

function createTile(number, row, col) {
    const tile = document.createElement('div');
    tile.classList.add('puzzle-tile');
    if (number === 16) {
        tile.classList.add('empty');
    }
    tile.textContent = number === 16 ? '' : number;
    tile.style.gridRowStart = row + 1;
    tile.style.gridColumnStart = col + 1;
    tile.addEventListener('click', () => moveTile(tile, number));
    return tile;
}

function moveTile(tile, number) {
    const tileIndex = tiles.findIndex(t => t.number === number);
    const tilePos = tiles[tileIndex].pos;

    if (Math.abs(tilePos.row - emptyTile.row) + Math.abs(tilePos.col - emptyTile.col) === 1) {
        const emptyIndex = tiles.findIndex(t => t.number === 16);
        
        // Swap positions in the array
        [tiles[tileIndex].pos, tiles[emptyIndex].pos] = [tiles[emptyIndex].pos, tiles[tileIndex].pos];

        // Update the grid positions
        tile.style.gridRowStart = tiles[tileIndex].pos.row + 1;
        tile.style.gridColumnStart = tiles[tileIndex].pos.col + 1;
        
        const emptyDiv = document.querySelector('.empty');
        emptyDiv.style.gridRowStart = tiles[emptyIndex].pos.row + 1;
        emptyDiv.style.gridColumnStart = tiles[emptyIndex].pos.col + 1;

        emptyTile.row = tilePos.row;
        emptyTile.col = tilePos.col;
    }
}

function shuffle() {
    for (let i = 0; i < 1000; i++) {
        const neighbors = [];
        const { row, col } = emptyTile;
        if (row > 0) neighbors.push({ row: row - 1, col });
        if (row < 3) neighbors.push({ row: row + 1, col });
        if (col > 0) neighbors.push({ row, col: col - 1 });
        if (col < 3) neighbors.push({ row, col: col + 1 });

        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        const tileToMove = tiles.find(t => t.pos.row === randomNeighbor.row && t.pos.col === randomNeighbor.col);
        moveTile(document.querySelector(`.puzzle-tile:not(.empty)[style*="grid-row-start: ${randomNeighbor.row + 1}"][style*="grid-column-start: ${randomNeighbor.col + 1}"]`), tileToMove.number);
    }
}

function init() {
    container.innerHTML = '';
    tiles = [];
    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        tiles.push({ number: i + 1, pos: { row, col } });
        container.appendChild(createTile(i + 1, row, col));
    }
    emptyTile.row = 3;
    emptyTile.col = 3;
    shuffle();
}

shuffleButton.addEventListener('click', shuffle);

init();
