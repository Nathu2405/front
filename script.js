let playerName = null;

function choosePlayer(name) {
    playerName = name;
    alert("You are now " + name);
    loadHand();
    loadTopCard();
    loadCurrentPlayer();
}

function startGame() {
    fetch('http://localhost:8080/game/start-game')
        .then(response => response.text())
        .then(data => {
            document.getElementById('response').textContent = data;
            loadHand();
            loadTopCard();
            loadCurrentPlayer();
        })
        .catch(error => {
            document.getElementById('response').textContent = 'Error: ' + error;
        });
}

function loadHand() {
    fetch("http://localhost:8080/game/current-player")
        .then(response => response.text())
        .then(current => {
            const cardContainer = document.getElementById("cardContainer");
            cardContainer.innerHTML = "";

            if (current === playerName) {
                fetch("http://localhost:8080/game/hand")
                    .then(response => response.json())
                    .then(cards => {

                        cards.forEach(cardStr => {
                            const valueMap = {
                                                    ONE: "1", TWO: "2", THREE: "3", FOUR: "4", FIVE: "5",
                                                    SIX: "6", SEVEN: "7", EIGHT: "8", NINE: "9",
                                                    DRAW_ONE: "+1", SKIP: "⊘", REVERSE: "🔄", WILD: "★"
                                                };

                            const [colorRaw, valueRaw] = cardStr.split(" ");
                            const color = colorRaw.trim().toUpperCase();
                            const value = valueMap[valueRaw] || valueRaw;

                            const div = document.createElement("div");
                            div.className = `card ${color ? color.toLowerCase() : 'null'}`;

                            const centerText = document.createElement("div");
                            centerText.className = "card-value";
                            centerText.textContent = value;

                            const cornerTL = document.createElement("div");
                            cornerTL.className = "card-corner top-left";
                            cornerTL.textContent = value;

                            const cornerBR = document.createElement("div");
                            cornerBR.className = "card-corner bottom-right";
                            cornerBR.textContent = value;

                            div.appendChild(centerText);
                            div.appendChild(cornerTL);
                            div.appendChild(cornerBR);

                            div.onclick = () => {
                                document.getElementById("playColor").value = color;
                                const reverseValue = Object.keys(valueMap).find(key => valueMap[key] === value);
                                document.getElementById("playValue").value = reverseValue || valueRaw
                            };

                            cardContainer.appendChild(div);
                        });
                    });
            } else {
                cardContainer.innerHTML = `<p>It's not your turn.</p>`
            }

            document.getElementById("currentPlayer").textContent = "Current turn: " + current;
        });
}

function drawCard() {
    fetch('http://localhost:8080/game/current-player')
        .then(response => response.text())
        .then(current => {
            if(current === playerName) {
                fetch("http://localhost:8080/game/draw-card")
                    .then(response => response.text())
                    .then(result => {
                        document.getElementById("drawResult").textContent = result;
                        loadHand();
                        loadTopCard();
                    })
            } else {
                document.getElementById("drawResult").textContent = "It's not your turn.";
            }
        })
        .catch(error=> {
            document.getElementById('drawResult').textContent = 'Error: ' + error;
        });
}

function playCard() {
    const color = document.getElementById("playColor").value;
    const displayedValue = document.getElementById("playValue").value;

    const reverseValueMap = {
        "1": "ONE",
        "2": "TWO",
        "3": "THREE",
        "4": "FOUR",
        "5": "FIVE",
        "6": "SIX",
        "7": "SEVEN",
        "8": "EIGHT",
        "9": "NINE",
        "+1": "DRAW_ONE",
        "⊘": "SKIP",
        "🔄": "REVERSE",
        "★": "WILD"
    };

    const value = reverseValueMap[displayedValue] || displayedValue.toUpperCase();

    if (!color || !value) {
        document.getElementById('playResult').textContent = "Please enter both color and value.";
        return;
    }

    fetch("http://localhost:8080/game/current-player")
        .then(response => response.text())
        .then(current => {
            if (current !== playerName) {
                document.getElementById('playResult').textContent = "It's not your turn!";
                return;
            }

            const url = `http://localhost:8080/game/play?color=${color}&value=${value}`;

            fetch(url, { method: "POST" })
                .then(response => response.text())
                .then(result => {
                    document.getElementById('playResult').textContent = result;
                    document.getElementById('playColor').value = "";
                    document.getElementById('playValue').value = "";

                    loadHand();
                    loadTopCard();
                    loadCurrentPlayer();
                })
                .catch(error => {
                    document.getElementById("playResult").textContent = "Error: " + error;
                });
        });
        fetch("http://localhost:8080/game/winner")
            .then(response => response.text())
            .then(msg => {
                document.getElementById("winnerDisplay").textContent = msg;
            });
}

function endTurn() {
    fetch('http://localhost:8080/game/end-turn')
        .then(response => response.text())
        .then(message => {
            document.getElementById('response').textContent = message;

            loadHand();
            loadTopCard();
            loadCurrentPlayer();
        })
        .catch(error => {
            document.getElementById('response').textContent = "Error: " + error;
        });
}

function loadTopCard() {
    fetch('http://localhost:8080/game/top-card')
        .then(response => response.text())
        .then(data => {
            document.getElementById('topCardDisplay').textContent = "Top Card: " + data;
        })
        .catch(error => {
            console.error("Failed to load top card: ", error);
            document.getElementById('topCardDisplay').textContent = "error loading card: " + error;
        });
}

function loadCurrentPlayer(){
    fetch('http://localhost:8080/game/current-player')
        .then(response => response.text())
        .then(name => {
            document.getElementById('currentPlayer').textContent = "Current Player: " + name;
        })
        .catch(error => {
            console.error("Error loading current player: ", error);
        });
}

