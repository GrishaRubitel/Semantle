
window.addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        sendRequest();
    }
});

document.getElementById("ruleBlock").addEventListener('click', function() {
    document.getElementById("ruleBlock").style.display = "none";
});

function showRules() {
    document.getElementById("ruleBlock").style.display = "block";
}

function percentSimulation() {
    return Math.random(0, 1);
}

function apiAskPercent(text) {
    return percentSimulation();
}

function wordsUpdate(text, perc, span) {

    let lastW = document.getElementById("lastWord");
    let lastP = document.getElementById("lastPerc");
    let bestW = document.getElementById("bestWord");
    let bestP = document.getElementById("bestPerc");

    if (lastW.innerHTML == "") {
        lastP.style.display = "block";
        bestP.style.display = "block";
    }

    lastW.innerHTML = text;
    lastP.style.backgroundColor = span.style.backgroundColor;
    lastP.innerHTML = perc;

    if (perc >= parseInt(bestP.innerHTML)) {
        maxPerc = perc / 100;
        bestW.innerHTML = text;
        bestP.innerHTML = perc;
        bestP.style.backgroundColor = span.style.backgroundColor;
        document.getElementById("best").style.boxShadow = "#77B6EA 0px 0px 10px 5px, inset #77B6EA 0px 0px 15px 5px";
        setTimeout(function() {
            document.getElementById("best").style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0)";
        }, 500);
    }
} 

function sendRequest() {
    let inText = document.getElementById("inputRequest").value.toLowerCase();
    createUserRequest(inText, 0);
    checkEquality(inText).then((response) => {
        if (response == true) {
            message("Ура, ты отгадал слово!");
        }
    });
}

function createUserRequest(inText, flag) {
    if (inText != "" && flag == 0) {
        inText = inText.charAt(0).toUpperCase() + inText.slice(1);
        similarityRequest(inText).then((perc) => {
            perc = perc * 100;
            if (perc >= 100) {
                perc = 100;
            } else if (perc < 10 && perc >= 0) {
                perc = perc.toString().slice(0, 1);
            } else if (perc < 0) {
                perc = 0;
            } else {
                perc = perc.toString().slice(0, 2);
            }
            
            updateHistory(inText, perc);
        })
        
    } else if (flag == 1) {
        maxPerc = inText[1];
        addCount(1);
        updateHistory(inText[0], inText[1].toFixed(2) * 100);
        message("Новое слово - " + inText[0].charAt(0).toUpperCase() + inText[0].slice(1));
        /*
        if (inText[0].charAt(0).toUpperCase() + inText[0].slice(1) == document.getElementById("bestWord").innerHTML) {
            message("Слова ближе не нашлось, вы близки к победе");
        } else {
            addCount(1);
            message("Новое слово - " + inText[0].charAt(0).toUpperCase() + inText[0].slice(1));
        }
        */
    }
}

function updateHistory(inText, perc) {
    inText = inText.charAt(0).toUpperCase() + inText.slice(1)
    let newLI = document.createElement('li');
    newLI.classList.add("historyItem");

    let textLI = document.createElement('div');
    textLI.classList.add('listWord');
    textLI.innerHTML = inText;

    var spanPerc = document.createElement('span');
    spanPerc.classList.add("percent");
    let color = 120 * (perc / 100);
    spanPerc.style.backgroundColor = `hsl(${color}, 100%, 50%`;
    spanPerc.textContent = perc;

    wordsUpdate(inText, perc, spanPerc);

    newLI.appendChild(spanPerc);

    let textNode = document.createTextNode(inText);
    newLI.appendChild(textLI);

    let container = document.getElementById('historyList');
    container.appendChild(newLI);
    container.scrollTo(0, container.scrollHeight);

    document.getElementById("inputRequest").value = "";
    addCount(0);
}

var host = "http://semantle.ru:8080";
var sypheredWord;
var maxPerc = 0;

getRandom();

function getRandom() {
    return  fetch(host + "/random_word")
    .then((response) => response.json())
    .then((json) => sypheredWord = json)
}
    
function similarityRequest(guess) {
    return fetch(host + "/similarity?" + new URLSearchParams({
        encWord: sypheredWord,
        word: guess,
    }))
    .then((response) => response.json())
}

function hintHandler() {
    let bG = document.getElementById("bestPerc").innerHTML;
    if (bG == -900) {
        message("Не было ни одной догадки");
        return 0;
    } else {
        hintRequest(bG / 100).then((hintStruct) => {
            if (hintStruct == null) {
                message("Слова ближе не нашлось, вы близки к победе");
            } else {
                createUserRequest(hintStruct, 1);
            }
        });
    }
}

function hintRequest(bG) {
    return fetch(host + "/hint?" + new URLSearchParams({
        encWord: sypheredWord,
        bestGuess: maxPerc,
    }))
    .then((response) => response.json())
}

function checkEquality(guess) {
    return fetch(host + "/check?" + new URLSearchParams({
        encWord: sypheredWord,
        word: guess,
    }))
    .then((response) => response.json())
}

function message(text) {
    var messageBlock = document.getElementById("message");
    var line = document.getElementById("messageLine");

    messageBlock.classList.remove("displayMes");
    line.innerHTML = text;
    setTimeout(function() {
        messageBlock.classList.add("displayMes");
    }, 3000)
}

let hintButt = document.getElementById("hintButt");
let hintCounter = document.getElementById("counter");
let value = 0;

function addCount(flag) {
    debugger;
    if (flag == 0 && hintCounter.innerHTML < 5) {
        value = parseInt(hintCounter.innerHTML) + 1; 
        hintCounter.innerHTML = value;
    } else if (flag == 1 && hintCounter.innerHTML == 5) {
        value = -1; 
        hintCounter.innerHTML = value;
        hintButt.style.pointerEvents = "none";
        hintButt.style.backgroundColor = "#404040";
        return;
    }
    if (hintCounter.innerHTML == 5) {
        hintButt.style.pointerEvents = "auto";
        hintButt.style.backgroundColor = "#fff";
    } else if (hintCounter.innerHTML < 5) {
        hintButt.style.pointerEvents = "none";
        hintButt.style.backgroundColor = "#404040";
    }
}