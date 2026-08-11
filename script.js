(function () {
  const RATINGS = [
    { value: "too-bad", label: "too bad" },
    { value: "bad", label: "bad" },
    { value: "normal", label: "normal" },
    { value: "good", label: "good" },
    { value: "super", label: "super" },
  ];

  const SURVEYS = [
    {
      id: "survey-1",
      title: "Survey I",
      intro:
        "Start with the basics. Open each question, pick a rating, and we’ll remember your choice as you move through the accordion.",
      questions: [
        "How clear was the overall experience?",
        "How easy was it to find what you needed?",
        "How would you rate the visual design?",
        "How likely are you to recommend this?",
      ],
    },
    {
      id: "survey-2",
      title: "Survey II",
      intro:
        "This section focuses on usefulness and flow. Answer one question at a time — completed items show your vote on the right.",
      questions: [
        "How useful were the main features?",
        "How smooth was the interaction flow?",
        "How satisfied are you with the speed?",
        "How well did this meet your expectations?",
      ],
    },
    {
      id: "survey-3",
      title: "Survey III",
      intro:
        "Final thoughts. Finish the remaining questions, then send to review a full summary of your responses.",
      questions: [
        "How helpful was the guidance and copy?",
        "How comfortable did the process feel?",
        "How would you rate trust and clarity?",
        "Overall, how was the complete journey?",
      ],
    },
  ];

  const STORAGE_KEY = "accordion-survey-answers-v1";

  const els = {
    tabs: Array.from(document.querySelectorAll(".tab")),
    counts: Array.from(document.querySelectorAll(".tab-count")),
    intro: document.getElementById("surveyIntro"),
    title: document.getElementById("surveyTitle"),
    status: document.getElementById("surveyStatus"),
    list: document.getElementById("questionList"),
    progressFill: document.getElementById("progressFill"),
    overallProgress: document.getElementById("overallProgress"),
    prevSurvey: document.getElementById("prevSurvey"),
    nextSurvey: document.getElementById("nextSurvey"),
    sendBtn: document.getElementById("sendBtn"),
    resetBtn: document.getElementById("resetBtn"),
    surveyPanel: document.getElementById("surveyPanel"),
    resultsPanel: document.getElementById("resultsPanel"),
    resultsList: document.getElementById("resultsList"),
    editAgain: document.getElementById("editAgain"),
    downloadJson: document.getElementById("downloadJson"),
  };

  let activeSurvey = 0;
  let openQuestion = 0;
  let answers = loadAnswers();

  function loadAnswers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function saveAnswers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }

  function answerKey(surveyIndex, questionIndex) {
    return SURVEYS[surveyIndex].id + ":" + questionIndex;
  }

  function getAnswer(surveyIndex, questionIndex) {
    return answers[answerKey(surveyIndex, questionIndex)] || null;
  }

  function labelFor(value) {
    const found = RATINGS.find(function (item) {
      return item.value === value;
    });
    return found ? found.label : value;
  }

  function countAnswered(surveyIndex) {
    return SURVEYS[surveyIndex].questions.reduce(function (total, _, index) {
      return total + (getAnswer(surveyIndex, index) ? 1 : 0);
    }, 0);
  }

  function totalAnswered() {
    return SURVEYS.reduce(function (total, _, index) {
      return total + countAnswered(index);
    }, 0);
  }

  function totalQuestions() {
    return SURVEYS.reduce(function (total, survey) {
      return total + survey.questions.length;
    }, 0);
  }

  function showToast(message) {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(function () {
      toast.remove();
    }, 2200);
  }

  function updateProgress() {
    const answered = totalAnswered();
    const total = totalQuestions();
    const pct = total ? Math.round((answered / total) * 100) : 0;
    els.progressFill.style.width = pct + "%";
    els.overallProgress.textContent = answered + " / " + total + " answered";

    els.counts.forEach(function (node) {
      const index = Number(node.getAttribute("data-count"));
      const done = countAnswered(index);
      const max = SURVEYS[index].questions.length;
      node.textContent = done + "/" + max;
    });

    const sectionDone = countAnswered(activeSurvey);
    const sectionMax = SURVEYS[activeSurvey].questions.length;
    els.status.textContent = sectionDone === sectionMax ? "Complete" : "In progress";
    els.status.classList.toggle("done", sectionDone === sectionMax);
  }

  function renderQuestions() {
    const survey = SURVEYS[activeSurvey];
    els.list.innerHTML = "";

    survey.questions.forEach(function (text, index) {
      const answer = getAnswer(activeSurvey, index);
      const isOpen = openQuestion === index;
      const item = document.createElement("article");
      item.className = "question" + (isOpen ? " is-open" : "");

      const ratingHtml = RATINGS.map(function (rating) {
        const id = survey.id + "-q" + index + "-" + rating.value;
        const checked = answer === rating.value ? " checked" : "";
        return (
          '<label for="' +
          id +
          '">' +
          '<input type="radio" name="' +
          survey.id +
          "-q" +
          index +
          '" id="' +
          id +
          '" value="' +
          rating.value +
          '"' +
          checked +
          " />" +
          "<span>" +
          rating.label +
          "</span>" +
          "</label>"
        );
      }).join("");

      item.innerHTML =
        '<button type="button" class="question-toggle" data-open="' +
        index +
        '" aria-expanded="' +
        String(isOpen) +
        '">' +
        '<span class="question-title">' +
        (index + 1) +
        ". " +
        text +
        "</span>" +
        (answer
          ? '<span class="voted">voted: ' + labelFor(answer) + "</span>"
          : "<span></span>") +
        '<svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        "</button>" +
        '<div class="question-body">' +
        '<div class="rating" role="radiogroup" aria-label="Rating for question ' +
        (index + 1) +
        '">' +
        ratingHtml +
        "</div>" +
        "</div>";

      els.list.appendChild(item);
    });
  }

  function renderSurvey() {
    const survey = SURVEYS[activeSurvey];
    els.intro.textContent = survey.intro;
    els.title.textContent = survey.title;

    els.tabs.forEach(function (tab) {
      const index = Number(tab.getAttribute("data-survey"));
      const active = index === activeSurvey;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    els.prevSurvey.disabled = activeSurvey === 0;
    els.nextSurvey.textContent =
      activeSurvey === SURVEYS.length - 1 ? "Review" : "Next section";

    if (openQuestion < 0 || openQuestion >= survey.questions.length) {
      openQuestion = 0;
    }

    renderQuestions();
    updateProgress();
  }

  function setAnswer(questionIndex, value) {
    answers[answerKey(activeSurvey, questionIndex)] = value;
    saveAnswers();

    const nextUnanswered = SURVEYS[activeSurvey].questions.findIndex(function (_, index) {
      return index > questionIndex && !getAnswer(activeSurvey, index);
    });

    if (nextUnanswered !== -1) {
      openQuestion = nextUnanswered;
    }

    renderSurvey();
  }

  function showResults() {
    els.surveyPanel.classList.add("hidden");
    els.resultsPanel.classList.remove("hidden");
    els.resultsList.innerHTML = "";

    SURVEYS.forEach(function (survey, surveyIndex) {
      const group = document.createElement("div");
      group.className = "result-group";
      const items = survey.questions
        .map(function (question, questionIndex) {
          const answer = getAnswer(surveyIndex, questionIndex);
          return (
            "<li><span>" +
            (questionIndex + 1) +
            ". " +
            question +
            "</span><strong>" +
            (answer ? labelFor(answer) : "—") +
            "</strong></li>"
          );
        })
        .join("");
      group.innerHTML = "<h3>" + survey.title + "</h3><ul>" + items + "</ul>";
      els.resultsList.appendChild(group);
    });
  }

  function hideResults() {
    els.resultsPanel.classList.add("hidden");
    els.surveyPanel.classList.remove("hidden");
  }

  els.tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activeSurvey = Number(tab.getAttribute("data-survey"));
      openQuestion = 0;
      hideResults();
      renderSurvey();
    });
  });

  els.list.addEventListener("click", function (event) {
    const toggle = event.target.closest("[data-open]");
    if (!toggle) return;
    const index = Number(toggle.getAttribute("data-open"));
    openQuestion = openQuestion === index ? -1 : index;
    renderQuestions();
  });

  els.list.addEventListener("change", function (event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "radio") return;
    const match = input.name.match(/-q(\d+)$/);
    if (!match) return;
    setAnswer(Number(match[1]), input.value);
  });

  els.prevSurvey.addEventListener("click", function () {
    if (activeSurvey === 0) return;
    activeSurvey -= 1;
    openQuestion = 0;
    renderSurvey();
  });

  els.nextSurvey.addEventListener("click", function () {
    if (activeSurvey < SURVEYS.length - 1) {
      activeSurvey += 1;
      openQuestion = 0;
      renderSurvey();
      return;
    }
    els.sendBtn.click();
  });

  els.sendBtn.addEventListener("click", function () {
    const unanswered = totalQuestions() - totalAnswered();
    if (unanswered > 0) {
      showToast("Answer all questions first (" + unanswered + " left).");
      for (let s = 0; s < SURVEYS.length; s += 1) {
        const missing = SURVEYS[s].questions.findIndex(function (_, q) {
          return !getAnswer(s, q);
        });
        if (missing !== -1) {
          activeSurvey = s;
          openQuestion = missing;
          hideResults();
          renderSurvey();
          break;
        }
      }
      return;
    }
    showResults();
    showToast("Survey submitted.");
  });

  els.resetBtn.addEventListener("click", function () {
    answers = {};
    saveAnswers();
    activeSurvey = 0;
    openQuestion = 0;
    hideResults();
    renderSurvey();
    showToast("Responses cleared.");
  });

  els.editAgain.addEventListener("click", function () {
    hideResults();
    renderSurvey();
  });

  els.downloadJson.addEventListener("click", function () {
    const payload = {
      submittedAt: new Date().toISOString(),
      surveys: SURVEYS.map(function (survey, surveyIndex) {
        return {
          id: survey.id,
          title: survey.title,
          answers: survey.questions.map(function (question, questionIndex) {
            const value = getAnswer(surveyIndex, questionIndex);
            return {
              question: question,
              value: value,
              label: value ? labelFor(value) : null,
            };
          }),
        };
      }),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "accordion-survey-responses.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  renderSurvey();
})();
