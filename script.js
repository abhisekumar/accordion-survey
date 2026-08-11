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
        "Basics first. Answer True/False — if you pick False, a follow-up text box appears so you can explain why.",
      questions: [
        {
          id: "s1-clear",
          type: "rating",
          text: "How clear was the overall experience?",
        },
        {
          id: "s1-easy",
          type: "boolean",
          text: "Was the survey easy to understand?",
        },
        {
          id: "s1-easy-why",
          type: "text",
          text: "What made it hard to understand?",
          placeholder: "Tell us what confused you…",
          showIf: { id: "s1-easy", equals: "false" },
        },
        {
          id: "s1-design",
          type: "rating",
          text: "How would you rate the visual design?",
        },
        {
          id: "s1-improve",
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
        "Usefulness and flow. Conditional follow-ups only appear when needed — for example after a False answer.",
      questions: [
        {
          id: "s2-found",
          type: "boolean",
          text: "Did you find the main feature you needed?",
        },
        {
          id: "s2-found-why",
          type: "text",
          text: "What were you looking for?",
          placeholder: "Describe the missing feature…",
          showIf: { id: "s2-found", equals: "false" },
        },
        {
          id: "s2-flow",
          type: "rating",
          text: "How smooth was the interaction flow?",
        },
        {
          id: "s2-device",
          type: "choice",
          text: "Which device did you use?",
          options: [
            { value: "mobile", label: "Mobile" },
            { value: "tablet", label: "Tablet" },
            { value: "desktop", label: "Desktop" },
          ],
        },
        {
          id: "s2-mobile-note",
          type: "text",
          text: "Anything awkward on mobile?",
          placeholder: "Optional note about mobile…",
          optional: true,
          showIf: { id: "s2-device", equals: "mobile" },
        },
        {
          id: "s2-expect",
          type: "rating",
          text: "How well did this meet your expectations?",
        },
      ],
    },
    {
      id: "survey-3",
      title: "Survey III",
      intro:
        "Final thoughts. Recommend = False triggers a required reason. Optional comments stay optional.",
      questions: [
        {
          id: "s3-again",
          type: "boolean",
          text: "Would you use this again?",
        },
        {
          id: "s3-again-why",
          type: "text",
          text: "Why might you not use it again?",
          placeholder: "What would need to change?",
          showIf: { id: "s3-again", equals: "false" },
        },
        {
          id: "s3-recommend",
          type: "boolean",
          text: "Would you recommend this to a friend?",
        },
        {
          id: "s3-recommend-why",
          type: "text",
          text: "What held you back from recommending it?",
          placeholder: "Be as specific as you like…",
          showIf: { id: "s3-recommend", equals: "false" },
        },
        {
          id: "s3-overall",
          type: "rating",
          text: "Overall, how was the complete journey?",
        },
        {
          id: "s3-comment",
          type: "text",
          text: "Any final comment?",
          placeholder: "Optional detail is fine…",
          optional: true,
        },
      ],
    },
  ];

  const STORAGE_KEY = "accordion-survey-answers-v3";

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
  let openQuestionId = null;
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

  function answerKey(questionId) {
    return questionId;
  }

  function getAnswerById(questionId) {
    const value = answers[answerKey(questionId)];
    return value === undefined || value === null ? null : value;
  }

  function isQuestionVisible(surveyIndex, question) {
    if (!question.showIf) return true;
    const parentValue = getAnswerById(question.showIf.id);
    return parentValue === question.showIf.equals;
  }

  function visibleQuestions(surveyIndex) {
    return SURVEYS[surveyIndex].questions.filter(function (question) {
      return isQuestionVisible(surveyIndex, question);
    });
  }

  function isAnsweredQuestion(question) {
    const value = getAnswerById(question.id);
    if (question.optional) return true;
    if (question.type === "text") {
      return typeof value === "string" && value.trim().length > 0;
    }
    return value !== null && value !== "";
  }

  function displayAnswerFor(question) {
    const value = getAnswerById(question.id);
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

  function clearHiddenAnswers(surveyIndex) {
    SURVEYS[surveyIndex].questions.forEach(function (question) {
      if (!isQuestionVisible(surveyIndex, question) && answers[question.id] != null) {
        delete answers[question.id];
      }
    });
  }

  function countRequired(surveyIndex) {
    return visibleQuestions(surveyIndex).filter(function (question) {
      return !question.optional;
    }).length;
  }

  function countRequiredAnswered(surveyIndex) {
    return visibleQuestions(surveyIndex).reduce(function (total, question) {
      if (question.optional) return total;
      return total + (isAnsweredQuestion(question) ? 1 : 0);
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

  function renderChoiceGroup(question, answer) {
    const name = question.id;
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

  function renderInput(question, answer) {
    if (question.type === "text") {
      const id = question.id + "-text";
      return (
        '<div class="text-field">' +
        (question.showIf
          ? '<p class="followup-note">Shown because your previous answer matched this follow-up.</p>'
          : "") +
        '<label class="sr-only" for="' +
        id +
        '">' +
        question.text +
        "</label>" +
        '<textarea id="' +
        id +
        '" data-text-id="' +
        question.id +
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

    return renderChoiceGroup(question, answer);
  }

  function typeBadge(question) {
    if (question.showIf) return "Follow-up";
    const labels = {
      rating: "Rating",
      boolean: "True / False",
      choice: "Choice",
      text: "Text",
    };
    return labels[question.type] || question.type;
  }

  function ensureOpenQuestion() {
    const visible = visibleQuestions(activeSurvey);
    if (!visible.length) {
      openQuestionId = null;
      return;
    }
    const stillVisible = visible.some(function (question) {
      return question.id === openQuestionId;
    });
    if (!stillVisible) {
      const firstUnanswered = visible.find(function (question) {
        return !isAnsweredQuestion(question);
      });
      openQuestionId = (firstUnanswered || visible[0]).id;
    }
  }

  function renderQuestions() {
    const survey = SURVEYS[activeSurvey];
    const visible = visibleQuestions(activeSurvey);
    els.list.innerHTML = "";
    ensureOpenQuestion();

    visible.forEach(function (question, visibleIndex) {
      const answer = getAnswerById(question.id);
      const shown = displayAnswerFor(question);
      const isOpen = openQuestionId === question.id;
      const item = document.createElement("article");
      item.className =
        "question" +
        (isOpen ? " is-open" : "") +
        (question.showIf ? " is-followup" : "");

      item.innerHTML =
        '<button type="button" class="question-toggle" data-open-id="' +
        question.id +
        '" aria-expanded="' +
        String(isOpen) +
        '">' +
        '<span class="question-title">' +
        '<span class="type-badge' +
        (question.showIf ? " followup" : "") +
        '">' +
        typeBadge(question) +
        "</span>" +
        (visibleIndex + 1) +
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
        renderInput(question, answer) +
        "</div>";

      els.list.appendChild(item);
    });

    if (!visible.length) {
      els.list.innerHTML = '<p class="empty-state">No questions in this section.</p>';
    }
  }

  function renderSurvey() {
    clearHiddenAnswers(activeSurvey);
    saveAnswers();

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

    renderQuestions();
    updateProgress();
  }

  function advanceFrom(questionId) {
    const visible = visibleQuestions(activeSurvey);
    const currentIndex = visible.findIndex(function (question) {
      return question.id === questionId;
    });
    const nextUnanswered = visible.find(function (question, index) {
      return index > currentIndex && !isAnsweredQuestion(question);
    });
    if (nextUnanswered) openQuestionId = nextUnanswered.id;
  }

  function firstFollowUpUnlocked(parentId) {
    return SURVEYS[activeSurvey].questions.find(function (question) {
      return (
        question.showIf &&
        question.showIf.id === parentId &&
        isQuestionVisible(activeSurvey, question)
      );
    });
  }

  function setAnswer(questionId, value, shouldAdvance) {
    answers[answerKey(questionId)] = value;
    clearHiddenAnswers(activeSurvey);
    saveAnswers();

    const followUp = firstFollowUpUnlocked(questionId);
    if (followUp) {
      openQuestionId = followUp.id;
    } else if (shouldAdvance) {
      advanceFrom(questionId);
    }

    renderSurvey();
  }

  function buildInsights() {
    let trueCount = 0;
    let falseCount = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    let followUps = 0;

    SURVEYS.forEach(function (survey, surveyIndex) {
      visibleQuestions(surveyIndex).forEach(function (question) {
        const value = getAnswerById(question.id);
        if (question.showIf && value) followUps += 1;
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
      followUps: followUps,
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
      "<li><span>Follow-ups answered</span><strong>" +
      insights.followUps +
      "</strong></li>" +
      "<li><span>Average rating</span><strong>" +
      insights.avgRating +
      "</strong></li>" +
      "</ul>";
    els.resultsList.appendChild(insight);

    SURVEYS.forEach(function (survey, surveyIndex) {
      const group = document.createElement("div");
      group.className = "result-group";
      const items = visibleQuestions(surveyIndex)
        .map(function (question, index) {
          const shown = displayAnswerFor(question);
          const value = getAnswerById(question.id);
          const fullText =
            question.type === "text" && value ? String(value).trim() : shown;
          return (
            "<li><span>" +
            (index + 1) +
            ". " +
            (question.showIf ? "[Follow-up] " : "") +
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
      openQuestionId = null;
      hideResults();
      renderSurvey();
    });
  });

  els.list.addEventListener("click", function (event) {
    const toggle = event.target.closest("[data-open-id]");
    if (!toggle) return;
    const id = toggle.getAttribute("data-open-id");
    openQuestionId = openQuestionId === id ? null : id;
    renderQuestions();
  });

  els.list.addEventListener("change", function (event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "radio") return;
    setAnswer(input.name, input.value, true);
  });

  els.list.addEventListener("input", function (event) {
    const area = event.target;
    if (!(area instanceof HTMLTextAreaElement) || !area.hasAttribute("data-text-id")) return;
    const id = area.getAttribute("data-text-id");
    answers[answerKey(id)] = area.value;
    saveAnswers();
    updateProgress();
    const meta = area.parentElement && area.parentElement.querySelector(".text-meta span:last-child");
    if (meta) meta.textContent = area.value.trim().length + "/280";
  });

  els.list.addEventListener(
    "blur",
    function (event) {
      const area = event.target;
      if (!(area instanceof HTMLTextAreaElement) || !area.hasAttribute("data-text-id")) return;
      const id = area.getAttribute("data-text-id");
      if (area.value.trim()) advanceFrom(id);
      renderSurvey();
    },
    true
  );

  els.prevSurvey.addEventListener("click", function () {
    if (activeSurvey === 0) return;
    activeSurvey -= 1;
    openQuestionId = null;
    renderSurvey();
  });

  els.nextSurvey.addEventListener("click", function () {
    if (activeSurvey < SURVEYS.length - 1) {
      activeSurvey += 1;
      openQuestionId = null;
      renderSurvey();
      return;
    }
    els.sendBtn.click();
  });

  els.sendBtn.addEventListener("click", function () {
    SURVEYS.forEach(function (_, index) {
      clearHiddenAnswers(index);
    });
    saveAnswers();

    const unanswered = totalRequired() - totalRequiredAnswered();
    if (unanswered > 0) {
      showToast("Complete required questions first (" + unanswered + " left).");
      for (let s = 0; s < SURVEYS.length; s += 1) {
        const missing = visibleQuestions(s).find(function (question) {
          return !question.optional && !isAnsweredQuestion(question);
        });
        if (missing) {
          activeSurvey = s;
          openQuestionId = missing.id;
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
    openQuestionId = null;
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
          answers: visibleQuestions(surveyIndex).map(function (question) {
            const value = getAnswerById(question.id);
            return {
              id: question.id,
              type: question.type,
              question: question.text,
              value: value,
              label: displayAnswerFor(question),
              optional: !!question.optional,
              followUp: !!question.showIf,
              showIf: question.showIf || null,
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
