board = (function createBoard(){
    const NUM_ROWS   = 3;
    const NUM_COLS   = 3;
    const playground = document.getElementById("playground");
    let boardInstance;

    function createBoard() {
        if (!boardInstance) {
            boardInstance = [
                ['', '', ''],
                ['', '', ''],
                ['', '', ''],
            ]
        }

        let cellNum = 1
        for (let row = 0; row < NUM_ROWS; row++) {
            for (let col = 0; col < NUM_COLS; col++) {
                playground.appendChild(createCell(cellNum++));
            }
        }

        function clearBoard() {
            for (let row = 0; row < NUM_ROWS; row++) {
                for (let col = 0; col < NUM_COLS; col++) {
                    boardInstance[row][col] = '';
                }
            }            
            for (let elem of playground.children) {
                if (elem.firstChild)
                    elem.removeChild(elem.firstChild);
            }
        }

        function update(cellNum, playerMarker) {
            const parsedCellNum  = parseInt(cellNum);
            const {row, col}     = positionTocell(parsedCellNum);
            boardInstance[row][col] = playerMarker;
        }

        function positionTocell(cellNum) {
            const row = Math.floor((cellNum - 1) / 3);
            const col = (cellNum-1) % 3;
            return {row, col};
        }

        function cellToPosition(row, col) {
            return row * NUM_ROWS + col + 1;
        }

        return Object.assign(
            {playground, boardInstance, clearBoard, update, cellToPosition}, 
            {dimension: [NUM_ROWS, NUM_COLS]}
        );
    }

    return createBoard()
})()

const marker = {
    'human': 'X',
    'computer': 'O'
};

function createCell(cellID) {
    const cell = document.createElement('div');
    cell.style.backgroundColor = "#000";
    cell.setAttribute('cellID', `${cellID}`);
    cell.classList.add('cell');
    return cell;
}

function getMarkerSprite(markerType) {
    if (markerType == marker.computer)
        return './assets/marker-o.png';
    else if (markerType == marker.human)
        return './assets/marker-x.png';
    return null;
}

function styleMarker(target, markerSprite) {
    const markerElem  = document.createElement('img');
    markerElem.setAttribute('src', markerSprite);
    markerElem.setAttribute('alt', 'Marker');
    markerElem.style.objectFit = "contain";
    markerElem.style.width = `${Math.floor(target.clientWidth/2)}px`;
    markerElem.style.height = `${Math.floor(target.clientHeight/2)}px`;
    markerElem.style.display = "block";
    markerElem.style.margin = `${Math.floor(target.clientHeight/4)}px auto`;
    markerElem.classList.add('animate-marker');
    markerElem.classList.add('marker-o');
    return markerElem;
}

function updateBoard(target, player) {
    const markerSprite = styleMarker(target, getMarkerSprite(player))
    target.appendChild(markerSprite);
    board.update(target.getAttribute('cellID'), player);
}

function getEmptyCells(state) {
    const emptyCells = [];
    for (let row = 0; row < board.dimension[0]; row++) {
        for (let col = 0; col < board.dimension[1]; col++) {
            if (state[row][col] == '')
                emptyCells.push([row, col]);
        }
    }
    return emptyCells;
}

function isValidPosition(pos) {
    return (
        pos[0] < board.dimension[0] &&
        pos[1] < board.dimension[1]
    );
}

function randint(start, end) {
    return start + Math.floor( (Math.random() * (end - start + 1)) );
}

function getNewState(marker, pos) {
    if (!isValidPosition(pos)) {
        alert("Warning: dont try to be oversmart. Otherwise i will come to your home");
        return null;
    }
    const [row, col] = pos;
    const state = board.boardInstance.map(row => {
        return row.map(col => {
            return col;
        })
    });
    state[row][col] = marker;
    return state;
}

function humanMove(target) {
    updateBoard(target, marker.human);
}

function aiMove() {
    const avilablePos = getEmptyCells(board.boardInstance);
    if (avilablePos.length == 0)
        return

    const maximizingStates = avilablePos.map(pos => {
        return getNewState(marker.computer, pos);
    })
    for (let i = 0; i < maximizingStates.length; i++) {
        if (checkWinning(marker.computer, maximizingStates[i])) {
            const [row, col] = avilablePos[i];
            const position   = board.cellToPosition(row, col);
            updateBoard(board.playground.children[position-1], marker.computer);
            board.update(position, marker.computer);
            return;
        }
    }

    const minimizingStates = avilablePos.map(pos => {
        return getNewState(marker.human, pos);
    })
    for (let i = 0; i < minimizingStates.length; i++) {
        if (checkWinning(marker.human, minimizingStates[i])) {
            const [row, col] = avilablePos[i];
            const position   = board.cellToPosition(row, col);
            updateBoard(board.playground.children[position-1], marker.computer);
            board.update(position, marker.computer);
            return;
        }
    }

    if (board.boardInstance[1][1] == '') {
        const [row, col] = [1, 1];
        const position   = board.cellToPosition(row, col);
        updateBoard(board.playground.children[position-1], marker.computer);
        board.update(position, marker.computer);
    }
    else {
        const [row, col] = avilablePos[randint(0, avilablePos.length-1)];
        const position   = board.cellToPosition(row, col);
        updateBoard(board.playground.children[position-1], marker.computer);
        board.update(position, marker.computer);
    }
}


function checkWinning(player, state) {
    const win_states = [
        [state[0][0], state[0][1], state[0][2]],
        [state[1][0], state[1][1], state[1][2]],
        [state[2][0], state[2][1], state[2][2]],
        [state[0][0], state[1][0], state[2][0]],
        [state[0][1], state[1][1], state[2][1]],
        [state[0][2], state[1][2], state[2][2]],
        [state[0][0], state[1][1], state[2][2]],
        [state[2][0], state[1][1], state[0][2]]  
    ]

    return win_states.some(state => {
        return state.every(cell => {
            return cell == player;
        })
    })
}

function makeMove(player, target) {
    if (player == marker.human) {
        humanMove(target);
        disablePointerEvents();
    } else {
        aiMove();
    }
}

function checkGameOver(player) {
    if (checkWinning(player, board.boardInstance))
        return true;
    return false;
}

function updateStausMessage(player=null) {
    let message;
    const dialogElem = document.querySelector('dialog');
    
    if (player === marker.player) {
        message = 'Human Won';
    } else if (player === marker.computer) {
        message = 'Computer Won';
    } else {
        message = 'Its Tie. Nobody won';
    }

    dialogElem.textContent = message;
    dialogElem.showModal();

    setTimeout( () => {
        dialogElem.close();
    }, 2000);
}

function play(e) {
    if (!e.target.classList.contains('cell') ||  e.target.children.length > 0)
        return
    enablePointerEvents();
    makeMove(marker.human, e.target);
    disablePointerEvents();
    if (checkGameOver(marker.human)) {
        updateStausMessage(marker.human);
        board.clearBoard();
    }
    else {
        makeMove(marker.computer);
        if (checkGameOver(marker.computer)) {
            updateStausMessage(marker.computer);
            setTimeout(board.clearBoard, 2000);
        }
    }

    if (getEmptyCells(board.boardInstance).length === 0) {
        board.clearBoard();
        updateStausMessage();
    }
}

function disablePointerEvents() {
    board.playground.style.pointerEvents = 'none';
}

function enablePointerEvents() {
    board.playground.style.pointerEvents = '';
}

board.playground.addEventListener('click', play);