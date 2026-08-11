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
        "Basics first. This section mixes ratings and True/False so you can capture both opinion and clear yes/no signals.",
      questions: [
        {
          type: "rating",
          text: "How clear was the overall experience?",
        },
        {
          type: "boolean",
          text: "Was the survey easy to understand?",
        },
        {
          type: "rating",
          text: "How would you rate the visual design?",
        },
        {
          type: "text",
          text: "What is one thing we should improve?",
          placeholder: "Type a short suggestion…",
        },
      ],
    },
    {
      id: "survey-2",
      title: "Survey II",
      intro:
        "Usefulness and flow. True/False catches blockers quickly; ratings show strength; text captures detail.",
      questions: [
        {
          type: "boolean",
          text: "Did you find the main feature you needed?",
        },
        {
          type: "rating",
          text: "How smooth was the interaction flow?",
        },
        {
          type: "choice",
          text: "Which device did you use?",
          options: [
            { value: "mobile", label: "Mobile" },
            { value: "tablet", label: "Tablet" },
            { value: "desktop", label: "Desktop" },
          ],
        },
        {
          type: "rating",
          text: "How well did this meet your expectations?",
        },
      ],
    },
    {
      id: "survey-3",
      title: "Survey III",
      intro:
        "Final thoughts. Finish with confidence checks and open feedback, then send for a full summary.",
      questions: [
        {
          type: "boolean",
          text: "Would you use this again?",
        },
        {
          type: "boolean",
          text: "Would you recommend this to a friend?",
        },
        {
          type: "rating",
          text: "Overall, how was the complete journey?",
        },
        {
          type: "text",
          text: "Any final comment?",
          placeholder: "Optional detail is fine…",
          optional: true,
        },
      ],
    },
  ];

  const STORAGE_KEY = "accordion-survey-answers-v2";

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
    const value = answers[answerKey(surveyIndex, questionIndex)];
    return value === undefined || value === null ? null : value;
  }

  function isAnswered(surveyIndex, questionIndex) {
    const question = SURVEYS[surveyIndex].questions[questionIndex];
    const value = getAnswer(surveyIndex, questionIndex);
    if (question.optional) return true;
    if (question.type === "text") {
      return typeof value === "string" && value.trim().length > 0;
    }
    return value !== null && value !== "";
  }

  function displayAnswer(surveyIndex, questionIndex) {
    const question = SURVEYS[surveyIndex].questions[questionIndex];
    const value = getAnswer(surveyIndex, questionIndex);
    if (value === null || value === "") return null;

    if (question.type === "rating") {
      const found = RATINGS.find(function (item) {
        return item.value === value;
      });
      return found ? found.label : value;
    }

    if (question.type === "boolean") {
      return value === "true" ? "True" : "False";
    }

    if (question.type === "choice") {
      const found = (question.options || []).find(function (item) {
        return item.value === value;
      });
      return found ? found.label : value;
    }

    if (question.type === "text") {
      const text = String(value).trim();
      return text.length > 28 ? text.slice(0, 28) + "…" : text;
    }

    return String(value);
  }

  function countAnswered(surveyIndex) {
    return SURVEYS[surveyIndex].questions.reduce(function (total, _, index) {
      const question = SURVEYS[surveyIndex].questions[index];
      if (question.optional) {
        const value = getAnswer(surveyIndex, index);
        return total + (value && String(value).trim() ? 1 : 0);
      }
      return total + (isAnswered(surveyIndex, index) ? 1 : 0);
    }, 0);
  }

  function countRequired(surveyIndex) {
    return SURVEYS[surveyIndex].questions.filter(function (question) {
      return !question.optional;
    }).length;
  }

  function countRequiredAnswered(surveyIndex) {
    return SURVEYS[surveyIndex].questions.reduce(function (total, question, index) {
      if (question.optional) return total;
      return total + (isAnswered(surveyIndex, index) ? 1 : 0);
    }, 0);
  }

  function totalRequired() {
    return SURVEYS.reduce(function (total, _, index) {
      return total + countRequired(index);
    }, 0);
  }

  function totalRequiredAnswered() {
    return SURVEYS.reduce(function (total, _, index) {
      return total + countRequiredAnswered(index);
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
    const answered = totalRequiredAnswered();
    const total = totalRequired();
    const pct = total ? Math.round((answered / total) * 100) : 0;
    els.progressFill.style.width = pct + "%";
    els.overallProgress.textContent = answered + " / " + total + " required";

    els.counts.forEach(function (node) {
      const index = Number(node.getAttribute("data-count"));
      node.textContent =
        countRequiredAnswered(index) + "/" + countRequired(index);
    });

    const sectionDone = countRequiredAnswered(activeSurvey) === countRequired(activeSurvey);
    els.status.textContent = sectionDone ? "Complete" : "In progress";
    els.status.classList.toggle("done", sectionDone);
  }

  function renderChoiceGroup(question, surveyIndex, questionIndex, answer) {
    const name = SURVEYS[surveyIndex].id + "-q" + questionIndex;
    const options =
      question.type === "boolean"
        ? [
            { value: "true", label: "True" },
            { value: "false", label: "False" },
          ]
        : question.type === "rating"
          ? RATINGS
          : question.options || [];

    const className =
      question.type === "boolean"
        ? "choice-group boolean"
        : question.type === "rating"
          ? "rating"
          : "choice-group";

    return (
      '<div class="' +
      className +
      '" role="radiogroup" aria-label="' +
      question.text.replace(/"/g, "&quot;") +
      '">' +
      options
        .map(function (option) {
          const id = name + "-" + option.value;
          const checked = answer === option.value ? " checked" : "";
          return (
            '<label for="' +
            id +
            '">' +
            '<input type="radio" name="' +
            name +
            '" id="' +
            id +
            '" value="' +
            option.value +
            '"' +
            checked +
            " />" +
            "<span>" +
            option.label +
            "</span>" +
            "</label>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderInput(question, surveyIndex, questionIndex, answer) {
    if (question.type === "text") {
      const id = SURVEYS[surveyIndex].id + "-q" + questionIndex + "-text";
      return (
        '<div class="text-field">' +
        '<label class="sr-only" for="' +
        id +
        '">' +
        question.text +
        "</label>" +
        '<textarea id="' +
        id +
        '" data-text="' +
        questionIndex +
        '" rows="3" maxlength="280" placeholder="' +
        (question.placeholder || "Type your answer…").replace(/"/g, "&quot;") +
        '">' +
        (answer ? String(answer).replace(/</g, "&lt;") : "") +
        "</textarea>" +
        '<div class="text-meta">' +
        (question.optional ? "<span>Optional</span>" : "<span>Required</span>") +
        "<span>" +
        (answer ? String(answer).trim().length : 0) +
        "/280</span>" +
        "</div>" +
        "</div>"
      );
    }

    return renderChoiceGroup(question, surveyIndex, questionIndex, answer);
  }

  function typeBadge(type) {
    const labels = {
      rating: "Rating",
      boolean: "True / False",
      choice: "Choice",
      text: "Text",
    };
    return labels[type] || type;
  }

  function renderQuestions() {
    const survey = SURVEYS[activeSurvey];
    els.list.innerHTML = "";

    survey.questions.forEach(function (question, index) {
      const answer = getAnswer(activeSurvey, index);
      const shown = displayAnswer(activeSurvey, index);
      const isOpen = openQuestion === index;
      const item = document.createElement("article");
      item.className = "question" + (isOpen ? " is-open" : "");

      item.innerHTML =
        '<button type="button" class="question-toggle" data-open="' +
        index +
        '" aria-expanded="' +
        String(isOpen) +
        '">' +
        '<span class="question-title">' +
        '<span class="type-badge">' +
        typeBadge(question.type) +
        "</span>" +
        (index + 1) +
        ". " +
        question.text +
        "</span>" +
        (shown
          ? '<span class="voted">answered: ' + shown + "</span>"
          : question.optional
            ? '<span class="voted optional-tag">optional</span>'
            : "<span></span>") +
        '<svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        "</button>" +
        '<div class="question-body">' +
        renderInput(question, activeSurvey, index, answer) +
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

  function advanceFrom(questionIndex) {
    const nextUnanswered = SURVEYS[activeSurvey].questions.findIndex(function (question, index) {
      return index > questionIndex && !isAnswered(activeSurvey, index);
    });
    if (nextUnanswered !== -1) openQuestion = nextUnanswered;
  }

  function setAnswer(questionIndex, value, shouldAdvance) {
    answers[answerKey(activeSurvey, questionIndex)] = value;
    saveAnswers();
    if (shouldAdvance) advanceFrom(questionIndex);
    renderSurvey();
  }

  function buildInsights() {
    let trueCount = 0;
    let falseCount = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    SURVEYS.forEach(function (survey, surveyIndex) {
      survey.questions.forEach(function (question, questionIndex) {
        const value = getAnswer(surveyIndex, questionIndex);
        if (question.type === "boolean") {
          if (value === "true") trueCount += 1;
          if (value === "false") falseCount += 1;
        }
        if (question.type === "rating" && value) {
          const score = RATINGS.findIndex(function (item) {
            return item.value === value;
          });
          if (score >= 0) {
            ratingSum += score + 1;
            ratingCount += 1;
          }
        }
      });
    });

    return {
      trueCount: trueCount,
      falseCount: falseCount,
      avgRating: ratingCount ? (ratingSum / ratingCount).toFixed(1) + " / 5" : "—",
    };
  }

  function showResults() {
    els.surveyPanel.classList.add("hidden");
    els.resultsPanel.classList.remove("hidden");
    els.resultsList.innerHTML = "";

    const insights = buildInsights();
    const insight = document.createElement("div");
    insight.className = "result-group insights";
    insight.innerHTML =
      "<h3>Quick insights</h3>" +
      "<ul>" +
      "<li><span>True answers</span><strong>" +
      insights.trueCount +
      "</strong></li>" +
      "<li><span>False answers</span><strong>" +
      insights.falseCount +
      "</strong></li>" +
      "<li><span>Average rating</span><strong>" +
      insights.avgRating +
      "</strong></li>" +
      "</ul>";
    els.resultsList.appendChild(insight);

    SURVEYS.forEach(function (survey, surveyIndex) {
      const group = document.createElement("div");
      group.className = "result-group";
      const items = survey.questions
        .map(function (question, questionIndex) {
          const shown = displayAnswer(surveyIndex, questionIndex);
          const value = getAnswer(surveyIndex, questionIndex);
          const fullText =
            question.type === "text" && value ? String(value).trim() : shown;
          return (
            "<li><span>" +
            (questionIndex + 1) +
            ". " +
            question.text +
            '</span><strong title="' +
            (fullText || "—").replace(/"/g, "&quot;") +
            '">' +
            (fullText || (question.optional ? "Skipped" : "—")) +
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
    setAnswer(Number(match[1]), input.value, true);
  });

  els.list.addEventListener("input", function (event) {
    const area = event.target;
    if (!(area instanceof HTMLTextAreaElement) || !area.hasAttribute("data-text")) return;
    const index = Number(area.getAttribute("data-text"));
    answers[answerKey(activeSurvey, index)] = area.value;
    saveAnswers();
    updateProgress();
    const meta = area.parentElement && area.parentElement.querySelector(".text-meta span:last-child");
    if (meta) meta.textContent = area.value.trim().length + "/280";
  });

  els.list.addEventListener("blur", function (event) {
    const area = event.target;
    if (!(area instanceof HTMLTextAreaElement) || !area.hasAttribute("data-text")) return;
    const index = Number(area.getAttribute("data-text"));
    if (area.value.trim()) advanceFrom(index);
    renderSurvey();
  }, true);

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
    const unanswered = totalRequired() - totalRequiredAnswered();
    if (unanswered > 0) {
      showToast("Complete required questions first (" + unanswered + " left).");
      for (let s = 0; s < SURVEYS.length; s += 1) {
        const missing = SURVEYS[s].questions.findIndex(function (question, q) {
          return !question.optional && !isAnswered(s, q);
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
      insights: buildInsights(),
      surveys: SURVEYS.map(function (survey, surveyIndex) {
        return {
          id: survey.id,
          title: survey.title,
          answers: survey.questions.map(function (question, questionIndex) {
            const value = getAnswer(surveyIndex, questionIndex);
            return {
              type: question.type,
              question: question.text,
              value: value,
              label: displayAnswer(surveyIndex, questionIndex),
              optional: !!question.optional,
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
