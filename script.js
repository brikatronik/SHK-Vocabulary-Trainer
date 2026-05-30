let vocabulary = [];
let currentWord = null;
let sourceLanguage = "french";
let targetLanguage = "german";
let stats = {
    easy: 0,
    hard: 0,
    again: 0
};

let sessionCount = 0;
const dailyGoal = 25;

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

    const today =
    new Date().toDateString();

    const savedDate =
        localStorage.getItem(
            "lastStudyDate"
        );

    if(savedDate !== today) {

        // New day → reset session
        sessionCount = 0;

        localStorage.setItem(
            "lastStudyDate",
            today
        );

    } else {

        const savedSession =
            localStorage.getItem(
                "sessionCount"
            );

        if(savedSession) {
            sessionCount =
                Number(savedSession);
        }
    }

    updateSession();
    updateStats();
    updateSession();
    //Load saved language choice
    const savedLanguages =
    localStorage.getItem(
        "languageSettings"
    );

    if(savedLanguages) {

        const settings =
            JSON.parse(savedLanguages);

        sourceLanguage =
            settings.sourceLanguage;

        targetLanguage =
            settings.targetLanguage;

        // Update dropdowns
        document
            .getElementById(
                "hintLanguage"
            )
            .value =
            sourceLanguage;

        document
            .getElementById(
                "guessLanguage"
            )
            .value =
            targetLanguage;
    }
    updateLanguageDropdowns();
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

    // Hide answer
    document
        .getElementById("answer")
        .classList.add("hidden");

    // Hide rating buttons
    document
        .querySelector(".rating-buttons")
        .classList.add("hidden");

    // Show answer button again
    document
        .getElementById("showButton")
        .classList.remove("hidden");

    currentWord =
        chooseWeightedWord();

    document
        .getElementById("question")
        .textContent =
        currentWord[sourceLanguage] || "";

    // Hide previous image
    document
        .getElementById("pageImage")
        .classList.add("hidden");

}

function showAnswer() {

    // Show answer
    document
        .getElementById("answer")
        .classList.remove("hidden");

    document
        .getElementById("germanWord")
        .textContent =
        currentWord[targetLanguage] || "";

    document
        .getElementById("description")
        .textContent =
        currentWord.description || "";

    // Hide answer button
    document
        .getElementById("showButton")
        .classList.add("hidden");

    // Show rating buttons
    document
        .querySelector(".rating-buttons")
        .classList.remove("hidden");

    // Show picture
    const image =
        document.getElementById(
            "pageImage"
        );

        image.src =
            `images/${currentWord.page}.webp`;

        image.classList.remove(
            "hidden"
        );
    
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

const overlay =
    document.getElementById(
        "overlay"
    );

const modal =
    document.getElementById(
        "languageModal"
    );

document
    .getElementById(
        "menuButton"
    )
    .addEventListener(
        "click",
        () => {

            overlay
                .classList
                .remove("hidden");
        }
    );

overlay
    .addEventListener(
        "click",
        (e) => {

            if(e.target === overlay) {

                overlay
                    .classList
                    .add("hidden");
            }
        }
    );

document
    .getElementById(
        "languageOption"
    )
    .addEventListener(
        "click",
        () => {

            overlay
                .classList
                .add("hidden");

            modal
                .classList
                .remove("hidden");
        }
    );

document
    .getElementById(
        "cancelLanguage"
    )
    .addEventListener(
        "click",
        () => {

            modal
                .classList
                .add("hidden");
        }
    );

//Bestätigen behavior    
document
    .getElementById(
        "confirmLanguage"
    )
    .addEventListener(
        "click",
        () => {

            sourceLanguage =
                document
                .getElementById(
                    "hintLanguage"
                )
                .value;

            targetLanguage =
                document
                .getElementById(
                    "guessLanguage"
                )
                .value;

            // Save permanently
            localStorage.setItem(
                "languageSettings",
                JSON.stringify({
                    sourceLanguage,
                    targetLanguage
                })
            );

            // Close modal
            modal
                .classList
                .add("hidden");

            // Update CURRENT card
            document
                .getElementById(
                    "question"
                )
                .textContent =
                currentWord[
                    sourceLanguage
                ] || "";

            // If answer visible,
            // update translation too
            if(
                !document
                .getElementById(
                    "answer"
                )
                .classList
                .contains(
                    "hidden"
                )
            ) {

                document
                    .getElementById(
                        "germanWord"
                    )
                    .textContent =
                    currentWord[
                        targetLanguage
                    ] || "";
            }
        }
    );

    //Disable a language selected in the Übersetzung dropbox
function updateLanguageDropdowns() {

    const source =
        document.getElementById(
            "hintLanguage"
        ).value;

    const guessSelect =
        document.getElementById(
            "guessLanguage"
        );

    [...guessSelect.options]
        .forEach(option => {

            option.disabled =
                option.value === source;
        });

    // If same selected, auto switch
    if(
        guessSelect.value === source
    ) {

        guessSelect.selectedIndex = 0;

        if(
            guessSelect.value === source
        ) {
            guessSelect.selectedIndex = 1;
        }
    }
}

document
    .getElementById(
        "hintLanguage"
    )
    .addEventListener(
        "change",
        updateLanguageDropdowns
    );