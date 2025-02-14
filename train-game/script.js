const gameIdInput = document.getElementById("game-id-input");
const newGameButton = document.getElementById("new-game-button");
const playerHandImage = document.getElementById("player-hand-image");
const opponentHandImage = document.getElementById("opponent-hand-image");
const playerCardsText = document.getElementById("player-cards-text");
const opponentCardsText = document.getElementById("opponent-cards-text");
const pile = document.getElementById("pile");
const putButton = document.getElementById("put-button");
const callButton = document.getElementById("call-button");
const passButton = document.getElementById("pass-button");
const what = document.getElementById("what");
const whatText = document.getElementById("what-text");
const whatCounterText = document.getElementById("what-counter-text");

// round:
// initial: put, (call)
// after put: call, pass
// oppo chance claim, initial: put, call
// after put: call, pass

// rp7ljk8k7x10

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function showWhat() {
    what.style.borderWidth = "6rem 5rem 18rem 5rem";
    what.style.pointerEvents = "none";
    whatText.hidden = false;
    whatCounterText.innerHTML = "5";
    whatCounterText.hidden = false;
    await sleep(1000);
    whatCounterText.innerHTML = "4";
    await sleep(1000);
    whatCounterText.innerHTML = "3";
    await sleep(1000);
    whatCounterText.innerHTML = "2";
    await sleep(1000);
    whatCounterText.innerHTML = "1";
    await sleep(1000);
    whatCounterText.innerHTML = "0";
    hideWhat();
}

async function showLose() {
    what.style.borderWidth = "6rem 5rem 18rem 5rem";
    what.style.pointerEvents = "none";
    whatText.innerHTML = "You lost!";
    whatText.hidden = false;
    whatCounterText.innerHTML = "How?";
    whatCounterText.hidden = false;
}

async function showWin() {
    what.style.borderWidth = "6rem 5rem 18rem 5rem";
    what.style.pointerEvents = "none";
    whatText.innerHTML = "You won!";
    whatText.hidden = false;
    whatCounterText.innerHTML = "XD!";
    whatCounterText.hidden = false;
}

function hideWhat() {
    what.style.borderWidth = "0";
    what.style.pointerEvents = "all";
    whatText.hidden = true;
    whatCounterText.hidden = true;
}

/** Request a new Game ID and initialize a new game */
async function newGame() {
    // reset playground
    putButton.disabled = true;
    callButton.disabled = true;
    passButton.disabled = true;
    pile.innerHTML = "";
    hideWhat();
    playerHandImage.src = "https://www.deckofcardsapi.com/static/img/back.png";
    opponentHandImage.src = "https://www.deckofcardsapi.com/static/img/back.png";
    playerCardsText.innerHTML = "Dealing cards...";
    opponentCardsText.innerHTML = "Dealing cards...";

    // request new deck
    const deckResponse = await fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
    const deckData = await deckResponse.json();
    gameIdInput.value = deckData.deck_id;

    // deal cards to 2 players
    const playerDrawResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckData.deck_id}/draw/?count=26`);
    const playerDrawData = await playerDrawResponse.json();
    const playerCardsString = playerDrawData.cards.map(card => card.code).join(",");
    const playerHandAddResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckData.deck_id}/pile/player_hand/add/?cards=${playerCardsString}`);
    const playerHandAddData = await playerHandAddResponse.json();
    playerCardsText.innerHTML = `${playerHandAddData.piles.player_hand.remaining} Cards`;

    const opponentDrawResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckData.deck_id}/draw/?count=26`);
    const opponentDrawData = await opponentDrawResponse.json();
    const opponentCardsString = opponentDrawData.cards.map(card => card.code).join(",");
    const opponentHandAddResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckData.deck_id}/pile/opponent_hand/add/?cards=${opponentCardsString}`);
    const opponentHandAddData = await opponentHandAddResponse.json();
    opponentCardsText.innerHTML = `${opponentHandAddData.piles.opponent_hand.remaining} Cards`;

    // enable buttons
    putButton.disabled = false;
}

/** Try to load a new game from Game ID */
async function loadGame() {
    // reset playground
    putButton.disabled = true;
    callButton.disabled = true;
    passButton.disabled = true;
    pile.innerHTML = "";
    hideWhat();
    playerHandImage.src = "https://www.deckofcardsapi.com/static/img/back.png";
    opponentHandImage.src = "https://www.deckofcardsapi.com/static/img/back.png";
    playerCardsText.innerHTML = "Loading...";
    opponentCardsText.innerHTML = "Loading...";

    // get pile info
    const pileResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/pile/list/`);
    const pileData = await pileResponse.json();

    if (pileData.success) {
        // set player cards left text
        playerCardsText.innerHTML = `${pileData.piles.player_hand.remaining} Cards`;
        opponentCardsText.innerHTML = `${pileData.piles.opponent_hand.remaining} Cards`;

        // add cards to pile
        if (pileData.piles?.pile) {
            for (let i = 0; i < pileData.piles.pile.cards.length; i++) {
                const div = document.createElement("div");
                const img = document.createElement("img");
                img.src = pileData.piles.pile.cards[i].image;
                div.appendChild(img);
                pile.appendChild(div);
            }
        }

        // enable buttons (cannot determine before put or after put state)
        putButton.disabled = false;
        callButton.disabled = false;
        passButton.disabled = false;
    } else {
        // set player screaming!!!
        playerCardsText.innerHTML = "NOO! Where is game??";
        opponentCardsText.innerHTML = "Failed to load";
    }
}

/** when clicking the put card button */
async function putCardToPile() {
    putButton.disabled = true;
    callButton.disabled = true;
    passButton.disabled = true;

    // requests
    const playerDrawResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/player_hand/draw/?count=1`);
    const playerDrawData = await playerDrawResponse.json();
    const addToPileResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/pile/add/?cards=${playerDrawData.cards[0].code}`);
    const addToPileData = await addToPileResponse.json();
    
    // animation start (show card in hand, then put hand image to deck and continue game)
    playerHandImage.src = playerDrawData.cards[0].image;
    await sleep(250);
    playerHandImage.src = "https://www.deckofcardsapi.com/static/img/back.png";
    const div = document.createElement("div");
    const img = document.createElement("img");
    img.src = playerDrawData.cards[0].image;
    div.appendChild(img);
    img.addEventListener("load", () => {
        pile.appendChild(div);
    });
    playerCardsText.innerHTML = `${addToPileData.piles.player_hand.remaining} Cards`;

    callButton.disabled = false;
    passButton.disabled = false;
}

/** when clicking the call claim! button */
async function tryToClaim() {
    callButton.disabled = true;
    
    // get pile info
    const pileResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/pile/list/`);
    const pileData = await pileResponse.json();
    
    // check cards
    const lastCard = pileData.piles.pile.cards[pileData.piles.pile.cards.length - 1];
    let claimed = false;
    for (let i = 0; i < pileData.piles.pile.cards.length - 1; i++) {
        if (pileData.piles.pile.cards[i].value === lastCard.value) {
            claimed = true;

            // add things to deck
            const pileDrawResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/pile/draw/?count=${pileData.piles.pile.cards.length - i}`);
            const pileDrawData = await pileDrawResponse.json();
            const claimedCardsString = pileDrawData.cards.map(card => card.code).join(",");
            const playerHandAddResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/player_hand/add/?cards=${claimedCardsString}`);
            const playerHandAddData = await playerHandAddResponse.json();
            await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/player_hand/shuffle/`);

            // animation
            const pileCards = document.querySelectorAll("#pile div");
            let iii = 0;
            for (let ii = pileData.piles.pile.cards.length - 1; ii >= i; ii--) {
                pileCards[ii].remove();
                playerHandImage.src = pileDrawData.cards[pileDrawData.cards.length - 1 - iii++].image;
                playerCardsText.innerHTML = `${playerHandAddData.piles.player_hand.remaining - (pileData.piles.pile.cards.length - i) + iii} Cards`;
                await sleep(500);
            }
            playerHandImage.src = "https://www.deckofcardsapi.com/static/img/back.png";
            playerCardsText.innerHTML = `${playerHandAddData.piles.player_hand.remaining} Cards`;

            return;
        }
    }

    // egg
    if (!claimed) {
        showWhat();
    }
}

/** when clicking the pass! button (i'm not optimizing this at all) */
async function passRound() {
    putButton.disabled = true;
    callButton.disabled = true;
    passButton.disabled = true;

    // check if self 0 lose
    let pileResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/pile/list/`);
    let pileData = await pileResponse.json();
    if (pileData.piles.player_hand.remaining === 0) {
        showLose();
        return;
    }

    // enemy put card
    const opponentDrawResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/opponent_hand/draw/?count=1`);
    const opponentDrawData = await opponentDrawResponse.json();
    const addToPileResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/pile/add/?cards=${opponentDrawData.cards[0].code}`);
    const addToPileData = await addToPileResponse.json();
    
    // animation start (show card in hand, then put hand image to deck and continue game)
    opponentHandImage.src = opponentDrawData.cards[0].image;
    await sleep(250);
    opponentHandImage.src = "https://www.deckofcardsapi.com/static/img/back.png";
    const div = document.createElement("div");
    const img = document.createElement("img");
    img.src = opponentDrawData.cards[0].image;
    div.appendChild(img);
    img.addEventListener("load", () => {
        pile.appendChild(div);
    });
    opponentCardsText.innerHTML = `${addToPileData.piles.opponent_hand.remaining} Cards`;

    // can claim? enemy 80% chance calls claim
    // get pile info
    pileResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/pile/list/`);
    pileData = await pileResponse.json();
        
    // check cards
    const lastCard = pileData.piles.pile.cards[pileData.piles.pile.cards.length - 1];
    for (let i = 0; i < pileData.piles.pile.cards.length - 1; i++) {
        if (pileData.piles.pile.cards[i].value === lastCard.value && Math.random() < 0.8) {
            // add things to deck
            const pileDrawResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/pile/draw/?count=${pileData.piles.pile.cards.length - i}`);
            const pileDrawData = await pileDrawResponse.json();
            const claimedCardsString = pileDrawData.cards.map(card => card.code).join(",");
            const opponentHandAddResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/opponent_hand/add/?cards=${claimedCardsString}`);
            const opponentHandAddData = await opponentHandAddResponse.json();
            await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/opponent_hand/shuffle/`);

            // animation
            const pileCards = document.querySelectorAll("#pile div");
            let iii = 0;
            for (let ii = pileData.piles.pile.cards.length - 1; ii >= i; ii--) {
                pileCards[ii].remove();
                opponentHandImage.src = pileDrawData.cards[pileDrawData.cards.length - 1 - iii++].image;
                opponentCardsText.innerHTML = `${opponentHandAddData.piles.opponent_hand.remaining - (pileData.piles.pile.cards.length - i) + iii} Cards`;
                await sleep(500);
            }
            opponentHandImage.src = "https://www.deckofcardsapi.com/static/img/back.png";
            opponentCardsText.innerHTML = `${opponentHandAddData.piles.opponent_hand.remaining} Cards`;
        }
    }

    // check if enemy 0 lose
    pileResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameIdInput.value}/pile/pile/list/`);
    pileData = await pileResponse.json();
    if (pileData.piles.opponent_hand.remaining === 0) {
        showWin();
        return;
    }

    // back to player 1
    putButton.disabled = false;
    callButton.disabled = false;
}

newGameButton.addEventListener("click", async () => {
    await newGame();
});
gameIdInput.addEventListener("input", async () => {
    await loadGame();
});

putButton.addEventListener("click", async () => {
    await putCardToPile();
});
callButton.addEventListener("click", async () => {
    await tryToClaim();
});
passButton.addEventListener("click", async () => {
    await passRound();
})