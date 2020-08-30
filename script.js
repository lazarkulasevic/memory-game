let inputTimer = document.querySelector('input[name=timer]');

let formName = document.getElementById('name');
let inputName = document.querySelector('input[name=name]');
let btnSubmitName = document.querySelector('button[name=submit-name]');

let inputRadio = document.querySelector('input[name=level]:checked');
let inputRadioAll = document.querySelectorAll('input[name=level]');
let level;

let tableGame = document.getElementById('game');
let tableResults = document.getElementById('results');

let scoreBoardEasy = [], scoreBoardMedium = [], scoreBoardHard = [], scoreBoardExpert = [];
let userName = [], userTime = [];

let btnHighScores = document.getElementById('high-scores');
let btnReload = document.getElementById('reload');

inputTimer.value = "TIME";
inputName.value = localStorage.getItem('name');

inputRadioAll[0].checked = true;

// Style related scripts
let divCheckIcon = document.getElementById('check-icon');

// radio buttons disabled
function disableRadio(boolean) {
    inputRadioAll.forEach(radio => {
        radio.disabled = boolean;
    });
}
disableRadio(true);

function disableForm(boolean) {
    inputName.disabled = boolean;
    btnSubmitName.disabled = boolean;
}

// works with ENTER too :)
formName.addEventListener('submit', event => {
    event.preventDefault();

    if (inputName.value == null || inputName.value === "" || inputName.value.length < 2 || inputName.value.match(/\W/)) {
        return alert ("Please enter a valid name.");
    }

    inputName.disabled = true;
    btnSubmitName.disabled = true;

    disableRadio(false);
    divCheckIcon.style.visibility = "visible";
});

// Creating a TABLE
function createTable(rows) {
    // create rows
    for (let i = 1; i <= rows; i++) {
        let trElement = document.createElement('tr');
        tableGame.appendChild(trElement);
    }
    // create cells
    let trElementAll = document.querySelectorAll('tr');
    trElementAll.forEach(tr => {
        for (let i = 0; i < trElementAll.length; i++) {
            let tdElement = document.createElement('td');            
            tr.appendChild(tdElement);
        }
    });
}

let cells = 0;
// pick a level - displays a table
inputRadioAll.forEach(radio => {
    radio.addEventListener('click', event => {
        removeTable();

        let rows = 0;
        switch (event.target.value) {
            case "Easy":
                rows = 4;
                break;
            case "Medium":
                rows = 6;
                break;
            case "Hard":
                rows = 8;
                break;
            case "Expert":
                rows = 10;
                break;
        }
        level = radio.value;

        createTable(rows);
        addImagesToCells(rows*rows);
    });
});

function removeTable() {
    // remove table rows if they already exist
    let trElementAll = document.querySelectorAll('tr');
    trElementAll.forEach(tr => {
        tr.remove();
    });
}

// add IMGs to table cells
function addImagesToCells(cells) {
    let tdElementAll = document.querySelectorAll('td');
    let images = [];
    
    for (let i = 0; i < cells/2; i++) {
        images.push(i);
        images.push(i);
    }

    // shuffle(images);

    tdElementAll.forEach((td, i) => {
        td.addEventListener('click', flipCard);

        td.classList.add('card', resizeCardsClass(cells)[0]);
        td.setAttribute('data-card', images[i]);

        // frontface images
        let front = document.createElement('img');
        front.src = `images/${images[i]}.svg`;
        front.classList.add('front-face', resizeCardsClass(cells)[1]);
        td.appendChild(front);

        // backface image
        let back = document.createElement('img');
        back.src = `images/question-square.svg`;
        back.classList.add('back-face', resizeCardsClass(cells)[1]);
        td.appendChild(back);
    });
}

function resizeCardsClass(cells) {
    switch (cells) {
        case 16:
            return ["easy", "easy-f-b"];
        case 36:
            return ["medium", "medium-f-b"];
        case 64:
            return ["hard", "hard-f-b"];
        case 100:
            return ["expert", "expert-f-b"];
    }
}

// ################################################## //
// ############### GAME FUNCTIONALITY ############### //
// ################################################## //

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let flippedCards = [];

// flip card
function flipCard() {
    startTimer();
    disableRadio(true); // prevent missclick
    disableForm(true);
    btnHighScores.disabled = true;

    if (lockBoard) return; // prevent from opening more than 2 cards at once
    if (this == firstCard) return; // prevent "double-click" bug

    this.classList.add('flip');

    if (!hasFlippedCard) {
        // first click
        hasFlippedCard = true;
        firstCard = this;
        return; 
    }
    // second click
    secondCard = this;

    checkIfMatch();
}

// do cards match?
function checkIfMatch() {
    let isMatch = firstCard.dataset.card === secondCard.dataset.card; 
    isMatch ? disableCards() : unflipCards();
}

// disable cards if matched
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    // to stop timer
    flippedCards.push(firstCard.dataset.card);
    flippedCards.push(secondCard.dataset.card);

    resetBoard();
}

// unflip if not matching
function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');

        resetBoard();
    }, 1200);
}

function resetBoard() {
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;

    stopTimer();
}

// shuffle cards
function shuffle(arr) {
    let currentIndex = arr.length, tempValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        tempValue = arr[currentIndex];
        arr[currentIndex] = arr[randomIndex];
        arr[randomIndex] = tempValue;
    }
    return arr;
}

let timer = null;

function startTimer() {
    let second = 0, minute = 0, min = 0;
    if (timer === null) {
        timer = setInterval(() => {
            second++;
            if (second == 60) {
                second = 0;
                minute++;
            }
            min = minute < 10 ? "0" + minute : minute;
            second = second < 10 ? "0" + second : second;
            inputTimer.value = `${min}:${second}`;
        }, 1000);
    }

    inputTimer.classList.add('timer-blinker');
}

function stopTimer() {
    let tdElementAll = document.querySelectorAll('td');
    if (flippedCards.length == tdElementAll.length) {
        clearInterval(timer);
        inputTimer.classList.remove('timer-blinker');

        storeInLocal(); // scoreBoardAll()

        createTableResults(6);
        populateTableResults();
    }
}

// ################################################## //
// ###############   LOCAL STORAGE   ################ //
// ################################################## //

function rankUsers(selectScoreBoard) {
    selectScoreBoard.push(user);
    selectScoreBoard.sort((a, b) => {
        let minA = a.time.substring(0, 2);
        let secA = a.time.substring(3, 5)
        
        let minB = b.time.substring(0, 2);
        let secB = b.time.substring(3, 5)

        a = minA * 60 + secA;
        b = minB * 60 + secB;

        return a - b;
    });
    selectScoreBoard.splice(5);
}

function switchScoreBoard(Level) {
    switch (Level) {
        case "Easy":
            rankUsers(scoreBoardEasy);
            localStorage.setItem('scoreBoardEasy', JSON.stringify(scoreBoardEasy));
            break;
        case "Medium":
            rankUsers(scoreBoardMedium);
            localStorage.setItem('scoreBoardMedium', JSON.stringify(scoreBoardMedium));
            break;
        case "Hard":
            rankUsers(scoreBoardHard);
            localStorage.setItem('scoreBoardHard', JSON.stringify(scoreBoardHard));
            break;
        case "Expert":
            rankUsers(scoreBoardExpert);
            localStorage.setItem('scoreBoardExpert', JSON.stringify(scoreBoardExpert));
            break;
    }
}

function scoreBoardAll(Level) {
    if (JSON.parse(localStorage.getItem(`scoreBoard${Level}`) == null)) {
        user = JSON.parse(localStorage.getItem('user'));

        switchScoreBoard(Level);
        
    } else {

        switch (Level) {
            case "Easy":
                scoreBoardEasy = JSON.parse(localStorage.getItem('scoreBoardEasy'));
                break;
            case "Medium":
                scoreBoardMedium = JSON.parse(localStorage.getItem('scoreBoardMedium'));
                break;
            case "Hard":
                scoreBoardHard = JSON.parse(localStorage.getItem('scoreBoardHard'));
                break;
            case "Expert":
                scoreBoardExpert = JSON.parse(localStorage.getItem('scoreBoardExpert'));
                break;
        }
        user = JSON.parse(localStorage.getItem('user'));
        
        switchScoreBoard(Level);
    }
}

function storeInLocal() {
    let inputRadio = document.querySelector('input[name=level]:checked');

    let user = {
        name: inputName.value,
        level: inputRadio.value,
        time: inputTimer.value
    }
    
    localStorage.setItem('user', JSON.stringify(user));
    
    scoreBoardAll(inputRadio.value);
}

// ################################################## //
// ##############   DISPLAY RESULTS   ############### //
// ################################################## //

function createTableResults(rows) {
    // create divs for levels
    for (let i = 1; i <= 4; i++) {
        let divLevel = document.createElement('div');
        divLevel.classList.add('results-level');
        tableResults.appendChild(divLevel);
    }
    // create rows
    for (let i = 1; i <= rows; i++) {
        let trElement = document.createElement('tr');
        tableResults.appendChild(trElement);
    }
    // create cells
    let trElementAll = document.querySelectorAll('#results tr');
    trElementAll.forEach(tr => {
        for (let i = 1; i <= 3; i++) {
            let tdElement = document.createElement('td');
            if (i == 2) {
                tdElement.colSpan = 2;
            }
            tr.appendChild(tdElement);
        }        
    });
}

function populateTableResults() {
    let divLevelAll = document.querySelectorAll('.results-level');
    
    // creating div buttons
    let divEasy   = document.createTextNode('Easy');
    let divMedium = document.createTextNode('Medium');
    let divHard   = document.createTextNode('Hard');
    let divExpert = document.createTextNode('Expert');

    divLevelAll[0].appendChild(divEasy);
    divLevelAll[1].appendChild(divMedium);
    divLevelAll[2].appendChild(divHard);
    divLevelAll[3].appendChild(divExpert);

    // printing fixed text
    let tdElementAll = document.querySelectorAll('#results td');
    let tdRank = document.createTextNode('Rank');
    let tdName = document.createTextNode('Name');
    let tdTime = document.createTextNode('Time');

    tdElementAll[0].appendChild(tdRank);
    tdElementAll[1].appendChild(tdName);
    tdElementAll[2].appendChild(tdTime);

    resultsPrePrint();
    navigateResults();
}


function resultsPrePrint() {
    let inputRadio = document.querySelector('input[name=level]:checked');

    switch (inputRadio.value) {
        case "Easy":
            scoreBoard = JSON.parse(localStorage.getItem('scoreBoardEasy'));
            break;
        case "Medium":
            scoreBoard = JSON.parse(localStorage.getItem('scoreBoardMedium'));
            break;
        case "Hard":
            scoreBoard = JSON.parse(localStorage.getItem('scoreBoardHard'));
            break;
        case "Expert":
            scoreBoard = JSON.parse(localStorage.getItem('scoreBoardExpert'));
            break;
    }
    userName = extractUserTime(scoreBoard)[0];
    userTime = extractUserTime(scoreBoard)[1];

    printSelectedBoard();
}

function navigateResults() {
    let divLevelAll = document.querySelectorAll('.results-level');

    divLevelAll.forEach(div => {
        div.addEventListener('click', () => {
            switch (div.textContent) {
                case "Easy":
                    scoreBoard = JSON.parse(localStorage.getItem('scoreBoardEasy'));
                    break;
                case "Medium":
                    scoreBoard = JSON.parse(localStorage.getItem('scoreBoardMedium'));
                    break;
                case "Hard":
                    scoreBoard = JSON.parse(localStorage.getItem('scoreBoardHard'));
                    break;
                case "Expert":
                    scoreBoard = JSON.parse(localStorage.getItem('scoreBoardExpert'));
                    break;
            }
            clearSelectedBoard();

            userName = extractUserTime(scoreBoard)[0];
            userTime = extractUserTime(scoreBoard)[1];

            printSelectedBoard();
        });
    });
}

function clearSelectedBoard() {
    let tdElementAll = document.querySelectorAll('#results td');
    tdElementAll.forEach((td, i) => {
        if (td.colSpan == 2 && i != 1) {
            td.textContent = "";
        }
        if (i % 3 == 2 && i != 2) {
            td.textContent = "";
        }
        if (i % 3 == 0 && i != 0) {
            td.textContent = "";
        }
    });
}

function printSelectedBoard() {
    let tdElementAll = document.querySelectorAll('#results td');
    let userNameText = "", userTimeText = "";

    let counter = 1;
    tdElementAll.forEach((td, i) => {
        if (i % 3 == 0 && i != 0) {
            counterText = document.createTextNode(counter);
            td.appendChild(counterText);
            counter++;
        }
        if (td.colSpan == 2 && i != 1) {
            if (userName[counter - 2] === undefined) {
                userNameText = document.createTextNode('');
            } else {
                userNameText = document.createTextNode(userName[counter - 2]);
            }
            td.appendChild(userNameText);
        }
        if (i % 3 == 2 && i != 2) {
            if (userTime[counter - 2] === undefined) {
                userTimeText = document.createTextNode('');
            } else {
                userTimeText = document.createTextNode(userTime[counter - 2]);
            }
            td.appendChild(userTimeText);
        }
    });
}

function extractUserTime(selectScoreBoard) {
    userName = []; userTime = []; 
    selectScoreBoard.forEach(board => {
        userName.push(board.name);
        userTime.push(board.time);
    });
    return [userName, userTime];
}

function deleteResultsBoard() {
    let tdElementAll = document.querySelectorAll('#results td');
    let divLevelAll = document.querySelectorAll('.results-level');

    divLevelAll.forEach(div => {
        div.remove();
    });

    tdElementAll.forEach(td => {
        td.remove();
    });
}

// display high scores
btnHighScores.addEventListener('click', () => {
    disableRadio(true);
    disableForm(true);

    createTableResults(6);
    populateTableResults()

    setTimeout(() => {
        btnReload.classList.add('reload-blinker');
    }, 5000);

}, {once: true});

btnReload.addEventListener('click', event => {
    alertUser();
});

function alertUser() {
    if (confirm('Are you sure you want to start a new game?')) {
        location.reload();
    } 
    return;
}
