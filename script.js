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

    //load selected categories

    const savedCategories =
        localStorage.getItem(
            "selectedCategories"
        );

    if(savedCategories) {

        selectedCategories =
            JSON.parse(
                savedCategories
            );

        document
            .querySelectorAll(
                "#categoryList input"
            )
            .forEach(input => {

                input.checked =
                    selectedCategories
                    .includes(
                        input.value
                    );
            });
    }

    showRandomWord();
}

//search variables
const searchModal =
    document.getElementById(
        "searchModal"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchResults =
    document.getElementById(
        "searchResults"
    );


//category variables
const categoryModal =
    document.getElementById(
        "categoryModal"
    );

let selectedCategories = [
    "Sicherheit",
    "Fertigungstechnik",
    "Werkstofftechnik",
    "Elektrotechnik",
    "Sanitärtechnik",
    "Heizungstechnik",
    "Klimatechnik"
];

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

        if(
            !selectedCategories
            .includes(
                word.category
            )
        ) {
            return;
        }
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

//open search
document
    .getElementById(
        "searchOption"
    )
    .addEventListener(
        "click",
        () => {

            overlay
                .classList
                .add("hidden");

            searchModal
                .classList
                .remove("hidden");

            searchInput.value = "";

            searchResults.innerHTML = "";

            searchInput.focus();
        }
    );

//close search
document
    .getElementById(
        "closeSearch"
    )
    .addEventListener(
        "click",
        () => {

            searchModal
                .classList
                .add("hidden");
        }
    );

//live search
function performSearch() {

    const query =
        searchInput.value
        .toLowerCase()
        .trim();

    searchResults.innerHTML = "";

    if(!query) return;

    const matches =
        vocabulary.filter(word => {

            return (
                word.french
                    ?.toLowerCase()
                    .includes(query)

                ||

                word.german
                    ?.toLowerCase()
                    .includes(query)

                ||

                word.english
                    ?.toLowerCase()
                    .includes(query)

                ||

                word.description
                    ?.toLowerCase()
                    .includes(query)
            );
        });

    matches
        .slice(0, 20)
        .forEach(word => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "searchResult";

            div.textContent =
                `${word.french}
                 → ${word.german}`;

            div.addEventListener(
                "click",
                () => {

                    currentWord = word;

                    // Update question
                    document
                        .getElementById(
                            "question"
                        )
                        .textContent =
                        currentWord[
                            sourceLanguage
                        ] || "";

                    // Open answer directly
                    showAnswer();

                    // Close search popup
                    searchModal
                        .classList
                        .add("hidden");
                }
            );

            searchResults
                .appendChild(div);
        });
}

//connect typing
searchInput
    .addEventListener(
        "input",
        performSearch
    );

//open modal
document
    .getElementById(
        "categoryOption"
    )
    .addEventListener(
        "click",
        () => {

            overlay
                .classList
                .add("hidden");

            categoryModal
                .classList
                .remove("hidden");
        }
    );

//close category menu and save by tapping outside

categoryModal
    .addEventListener(
        "click",
        (e) => {

            if (
                e.target === categoryModal
            ) {

                const checked =
                    document.querySelectorAll(
                        "#categoryList input:checked"
                    );

                selectedCategories =
                    [...checked]
                    .map(
                        input =>
                            input.value
                    );

                if (
                    selectedCategories.length === 0
                ) {

                    selectedCategories = [
                        "Sicherheit",
                        "Fertigungstechnik",
                        "Werkstofftechnik",
                        "Elektrotechnik",
                        "Sanitärtechnik",
                        "Heizungstechnik",
                        "Klimatechnik"
                    ];
                }

                localStorage.setItem(
                    "selectedCategories",
                    JSON.stringify(
                        selectedCategories
                    )
                );

                categoryModal
                    .classList
                    .add("hidden");
            }
        }
    );