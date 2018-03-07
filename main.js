const playerOneMark = 'X';
const playerTwoMark = 'O';
var gameBoard = [];
var moveCount = 0;
var gameType = 'pvp';
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
]

window.onload = function () {
    gameInit();
}

function gameInit() {
    setEmptyBoard();
    document.getElementById('main-table').addEventListener('click', processUserClick, false);
    let gameProgress = getUrlParamByName('game_progress');
    if (gameProgress) {
        setGameProgress(gameProgress);
    }

    let gametypeParam = getUrlParamByName('game_type');
    if (gametypeParam) {
        gameType = gametypeParam;
    }
    document.getElementById("ai-switcher").value = gameType;
}

function setEmptyBoard() {
    gameBoard = [...Array(9).keys()];
}

function processUserClick(event) {
    if (event.target.id) {
        cellNumberId = event.target.id.match('^cell-([0-9]+)$')[1];
        if (cellNumberId && typeof gameBoard[cellNumberId] == 'number') {
            let mark = getCurrentMark();
            event.target.innerText = mark;
            gameBoard[cellNumberId] = mark;
            setLinkForContinue();
            moveCount++;
            let finish = checkWinner(gameBoard, mark);
            if (!finish && gameType === 'pvai') {
                processAiTurn();
            }
        }
    }
}

function processAiTurn() {
    let mark = getCurrentMark();
    let avalibleCells = emptyCells();
    let aiTurn = avalibleCells[Math.floor(Math.random() * avalibleCells.length)]
    document.getElementById('cell-' + aiTurn).innerText = mark;
    gameBoard[aiTurn] = mark;
    setLinkForContinue();
    moveCount++;
    checkWinner(gameBoard, mark);
}

function checkWinner(board, mark) {
    let playerMarks = board.reduce((a, e, i) =>
        (e === mark) ? a.concat(i) : a, []);
    for (let winComb of winningCombinations) {
        if (winComb.every(elem => playerMarks.includes(elem))) {
            finishGame(winComb, mark);
            return true;
        }
    }
    if (moveCount >= gameBoard.length) {
        finishGame([]);
        return true;
    }
}

function finishGame(combination, mark = '') {
    for (let cellId of combination) {
        document.getElementById('cell-' + cellId).style.color = (mark == 'X' ? 'red' : "blue");
    }
    document.getElementById('main-table').removeEventListener('click', processUserClick, false);
    let msg = '';
    if (combination.length) {
        msg = 'Player "' + mark + '" wins!';
    } else {
        msg = "Tie Game!";
    }
    document.querySelector('#message-box .game-status').innerText = msg;
    document.querySelector('#message-box .steps-count').innerText = "Steps count: " + moveCount;
    document.getElementById('link').value = '';
    document.getElementById('message-box').style.display = 'block';
}

function copyLink() {
    var copyText = document.getElementById("link");
    copyText.select();
    document.execCommand("Copy");
}

function getUrlParamByName(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function setGameProgress(progress) {
    progress = jsonDecode(progress);
    if (progress) {
        for (let [index, mark] of progress.entries()) {
            if (mark == playerOneMark || mark == playerTwoMark) {
                document.getElementById('cell-' + index).innerText = mark;
                gameBoard[index] = mark;
                moveCount++;
            }
        }
    }
}

function jsonDecode(json) {
    try {
        return JSON.parse(json);
    } catch (e) {
        return '';
    }
}

function getCurrentMark() {
    return (moveCount % 2) ? playerTwoMark : playerOneMark;
}

function setLinkForContinue() {
    document.getElementById('link').value = window.location.protocol + '//' + window.location.hostname + window.location.pathname
        + '?game_type=' + gameType + '&game_progress=' + encodeURIComponent(JSON.stringify(gameBoard));
}

function newGameProcessing() {
    window.location.replace(window.location.protocol + '//' + window.location.hostname + window.location.pathname);
}

function emptyCells() {
    return gameBoard.filter(s => typeof s == 'number');
}

function checkGameType() {
    gameType = document.getElementById("ai-switcher").value;
}
