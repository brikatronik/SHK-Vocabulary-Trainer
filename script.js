let vocabulary = [];
let currentWord = null;
let stats = {
    easy: 0,
    hard: 0,
    again: 0
};

let sessionCount = 0;
const dailyGoal = 50;

async function loadDatabase() {

    const response =
        await fetch("database.json");

    vocabulary =
        await response.json();

    // Restore saved progress
    const saved =
        localStorage.getItem(
            "vocabularyProgress"
        );

    if (saved) {

        const savedData =
            JSON.parse(saved);

        vocabulary =
            vocabulary.map(word => {

                const savedWord =
                    savedData.find(
                        s => s.id === word.id
                    );

                return savedWord
                    ? savedWord
                    : word;
            });
    }

    const savedStats =
        localStorage.getItem(
            "studyStats"
        );

    if(savedStats) {
        stats =
            JSON.parse(savedStats);
    }

    const savedSession =
        localStorage.getItem(
            "sessionCount"
        );

    if(savedSession) {
        sessionCount =
            Number(savedSession);
    }

    updateStats();
    updateSession();
    showRandomWord();
}

function updateSession() {

    document
        .getElementById(
            "sessionCount"
        )
        .textContent =
        sessionCount;

    const percentage =
        Math.min(
            (sessionCount /
            dailyGoal) * 100,
            100
        );

    document
        .getElementById(
            "progressBarInner"
        )
        .style.width =
        percentage + "%";

    localStorage.setItem(
        "sessionCount",
        sessionCount
    );
}

function chooseWeightedWord() {

    let weightedList = [];

    vocabulary.forEach(word => {

        let weight = 1;

        switch(word.difficulty) {

            case 1:
                weight = 5;
                break;

            case 2:
                weight = 3;
                break;

            case 3:
                weight = 1;
                break;
        }

        for(let i = 0; i < weight; i++) {
            weightedList.push(word);
        }
    });

    const randomIndex =
        Math.floor(
            Math.random() *
            weightedList.length
        );

    return weightedList[randomIndex];
}

function showRandomWord() {

    document
        .getElementById("answer")
        .classList.add("hidden");

    document
        .querySelector(".rating-buttons")
        .classList.add("hidden");

    currentWord =
        chooseWeightedWord();

    document
        .getElementById("question")
        .textContent =
        currentWord.french;
}

function showAnswer() {

    document
        .getElementById("answer")
        .classList.remove("hidden");

    document
        .querySelector(".rating-buttons")
        .classList.remove("hidden");

    document
        .getElementById("germanWord")
        .textContent =
        currentWord.german;

    document
        .getElementById("page")
        .textContent =
        "Page: " +
        currentWord.page;

    document
        .getElementById("description")
        .textContent =
        currentWord.description || "";
}

function saveProgress() {

    localStorage.setItem(
        "vocabularyProgress",
        JSON.stringify(vocabulary)
    );
}

function markEasy() {

    currentWord.difficulty = 3;
    currentWord.learned += 1;

    stats.easy++;

    saveProgress();
    updateStats();
    sessionCount++; 
    updateSession();
    showRandomWord();
}

function markHard() {

    currentWord.difficulty = 2;

    stats.hard++;

    saveProgress();
    updateStats();
    sessionCount++;
    updateSession();
    showRandomWord();
}

function markAgain() {

    currentWord.difficulty = 1;

    stats.again++;

    saveProgress();
    updateStats();
    sessionCount++;
    updateSession();
    showRandomWord();
}

function updateStats() {

    document
        .getElementById("easyCount")
        .textContent =
        stats.easy;

    document
        .getElementById("hardCount")
        .textContent =
        stats.hard;

    document
        .getElementById("againCount")
        .textContent =
        stats.again;

    localStorage.setItem(
        "studyStats",
        JSON.stringify(stats)
    );
}

document
    .getElementById("showButton")
    .addEventListener(
        "click",
        showAnswer
    );

document
    .getElementById("nextButton")
    .addEventListener(
        "click",
        showRandomWord
    );

document
    .getElementById("easyButton")
    .addEventListener(
        "click",
        markEasy
    );

document
    .getElementById("hardButton")
    .addEventListener(
        "click",
        markHard
    );

document
    .getElementById("againButton")
    .addEventListener(
        "click",
        markAgain
    );

loadDatabase();