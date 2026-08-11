(function () {
  const RATINGS = [
    { value: "too-bad", label: "too bad" },
    { value: "bad", label: "bad" },
    { value: "normal", label: "normal" },
    { value: "good", label: "good" },
    { value: "super", label: "super" },
  ];

  const QUIZ_PASS_PERCENT = 70;

  const SURVEYS = [
    {
      id: "survey-1",
      title: "Survey I",
      intro:
        "Basics first. True/False can unlock a follow-up text box. Use select-all where more than one option fits.",
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
          id: "s1-topics",
          type: "multiselect",
          text: "Which topics matter most to you? (Select all that apply)",
          options: [
            { value: "design", label: "Design" },
            { value: "speed", label: "Speed" },
            { value: "clarity", label: "Clarity" },
            { value: "support", label: "Support" },
          ],
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
        "Usefulness and flow. Conditional follow-ups appear only when needed. Multi-select captures overlapping needs.",
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
          id: "s2-channels",
          type: "multiselect",
          text: "Where did you hear about this? (Select all that apply)",
          options: [
            { value: "search", label: "Search" },
            { value: "social", label: "Social" },
            { value: "friend", label: "Friend" },
            { value: "work", label: "Work" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "s2-other-note",
          type: "text",
          text: "Where else did you hear about it?",
          placeholder: "Tell us the other source…",
          showIf: { id: "s2-channels", includes: "other" },
        },
        {
          id: "s2-device",
          type: "choice",
          text: "Which device did you use most?",
          options: [
            { value: "mobile", label: "Mobile" },
            { value: "tablet", label: "Tablet" },
            { value: "desktop", label: "Desktop" },
          ],
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
      title: "Quiz",
      intro:
        "Quiz mode: True/False questions are scored. You need " +
        QUIZ_PASS_PERCENT +
        "% or higher to pass. Feedback questions stay unscored.",
      quiz: true,
      questions: [
        {
          id: "q1",
          type: "boolean",
          text: "HTML is used to structure web page content.",
          correct: "true",
        },
        {
          id: "q1-why",
          type: "text",
          text: "Why did you choose False?",
          placeholder: "Optional — what were you thinking?",
          optional: true,
          showIf: { id: "q1", equals: "false" },
        },
        {
          id: "q2",
          type: "boolean",
          text: "CSS stands for Cascading Style Sheets.",
          correct: "true",
        },
        {
          id: "q3",
          type: "boolean",
          text: "JavaScript can only run on servers, never in browsers.",
          correct: "false",
        },
        {
          id: "q4",
          type: "boolean",
          text: "GitHub Pages can host static HTML/CSS/JS sites.",
          correct: "true",
        },
        {
          id: "q5",
          type: "choice",
          text: "Which format usually makes photos smaller than PNG?",
          options: [
            { value: "bmp", label: "BMP" },
            { value: "webp", label: "WebP" },
            { value: "raw", label: "RAW" },
          ],
          correct: "webp",
        },
        {
          id: "q-comment",
          type: "text",
          text: "Any final comment about the quiz?",
          placeholder: "Optional…",
          optional: true,
        },
      ],
    },
  ];

  const STORAGE_KEY = "accordion-survey-state-v4";

  const els = {
    startPanel: document.getElementById("startPanel"),
    startForm: document.getElementById("startForm"),
    profileName: document.getElementById("profileName"),
    profileEmail: document.getElementById("profileEmail"),
    startError: document.getElementById("startError"),
    surveyShell: document.getElementById("surveyShell"),
    profileChip: document.getElementById("profileChip"),
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
  let started = false;
  let profile = { name: "", email: "" };
  let answers = {};

  loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      profile = data.profile || profile;
      answers = data.answers || {};
      started = !!data.started;
      activeSurvey = Number(data.activeSurvey) || 0;
    } catch (error) {
      // ignore bad storage
    }
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        started: started,
        profile: profile,
        answers: answers,
        activeSurvey: activeSurvey,
      })
    );
  }

  function getAnswerById(questionId) {
    const value = answers[questionId];
    return value === undefined || value === null ? null : value;
  }

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === "") return [];
    return [value];
  }

  function isQuestionVisible(surveyIndex, question) {
    if (!question.showIf) return true;
    const parentValue = getAnswerById(question.showIf.id);
    if (question.showIf.includes !== undefined) {
      return asArray(parentValue).indexOf(question.showIf.includes) !== -1;
    }
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
    if (question.type === "multiselect") {
      return asArray(value).length > 0;
    }
    return value !== null && value !== "";
  }

  function optionLabel(question, value) {
    const found = (question.options || []).find(function (item) {
      return item.value === value;
    });
    return found ? found.label : value;
  }

  function displayAnswerFor(question) {
    const value = getAnswerById(question.id);
    if (value === null || value === "" || (Array.isArray(value) && !value.length)) {
      return null;
    }

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
      return optionLabel(question, value);
    }

    if (question.type === "multiselect") {
      return asArray(value)
        .map(function (item) {
          return optionLabel(question, item);
        })
        .join(", ");
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

  function scoredQuestions() {
    const list = [];
    SURVEYS.forEach(function (survey, surveyIndex) {
      if (!survey.quiz) return;
      visibleQuestions(surveyIndex).forEach(function (question) {
        if (question.correct !== undefined) list.push(question);
      });
    });
    return list;
  }

  function gradeQuiz() {
    const scored = scoredQuestions();
    let correct = 0;
    const details = scored.map(function (question) {
      const value = getAnswerById(question.id);
      const ok = String(value) === String(question.correct);
      if (ok) correct += 1;
      return {
        id: question.id,
        text: question.text,
        value: value,
        correctAnswer: question.correct,
        isCorrect: ok,
      };
    });
    const total = scored.length;
    const percent = total ? Math.round((correct / total) * 100) : 0;
    return {
      correct: correct,
      total: total,
      percent: percent,
      passed: percent >= QUIZ_PASS_PERCENT,
      details: details,
    };
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

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function updateProfileChip() {
    els.profileChip.textContent = profile.name + " · " + profile.email;
  }

  function showStart() {
    started = false;
    saveState();
    els.startPanel.classList.remove("hidden");
    els.surveyShell.classList.add("hidden");
    els.resultsPanel.classList.add("hidden");
    els.progressFill.style.width = "0%";
    els.overallProgress.textContent = "Start with your details";
    els.profileName.value = profile.name || "";
    els.profileEmail.value = profile.email || "";
  }

  function showSurvey() {
    started = true;
    saveState();
    els.startPanel.classList.add("hidden");
    els.surveyShell.classList.remove("hidden");
    els.resultsPanel.classList.add("hidden");
    updateProfileChip();
    renderSurvey();
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

  function renderMultiSelect(question, answer) {
    const selected = asArray(answer);
    return (
      '<div class="choice-group multi" role="group" aria-label="' +
      question.text.replace(/"/g, "&quot;") +
      '">' +
      (question.options || [])
        .map(function (option) {
          const id = question.id + "-" + option.value;
          const checked = selected.indexOf(option.value) !== -1 ? " checked" : "";
          return (
            '<label for="' +
            id +
            '">' +
            '<input type="checkbox" data-multi-id="' +
            question.id +
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
          ? '<p class="followup-note">Shown because your previous answer unlocked this follow-up.</p>'
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

    if (question.type === "multiselect") {
      return (
        '<p class="multi-hint">Select all that apply</p>' +
        renderMultiSelect(question, answer)
      );
    }

    return renderChoiceGroup(question, answer);
  }

  function typeBadge(question) {
    if (question.showIf) return "Follow-up";
    if (question.correct !== undefined) return "Quiz";
    const labels = {
      rating: "Rating",
      boolean: "True / False",
      choice: "Choice",
      multiselect: "Select all",
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
        (question.showIf ? " is-followup" : "") +
        (question.correct !== undefined ? " is-quiz" : "");

      item.innerHTML =
        '<button type="button" class="question-toggle" data-open-id="' +
        question.id +
        '" aria-expanded="' +
        String(isOpen) +
        '">' +
        '<span class="question-title">' +
        '<span class="type-badge' +
        (question.showIf ? " followup" : "") +
        (question.correct !== undefined ? " quiz" : "") +
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
  }

  function renderSurvey() {
    clearHiddenAnswers(activeSurvey);
    saveState();

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
    answers[questionId] = value;
    clearHiddenAnswers(activeSurvey);
    saveState();

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
        if (question.showIf && value && !(Array.isArray(value) && !value.length)) {
          followUps += 1;
        }
        if (question.type === "boolean" && question.correct === undefined) {
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
      quiz: gradeQuiz(),
    };
  }

  function showResults() {
    els.startPanel.classList.add("hidden");
    els.surveyShell.classList.add("hidden");
    els.resultsPanel.classList.remove("hidden");
    els.resultsList.innerHTML = "";

    const insights = buildInsights();
    const quiz = insights.quiz;

    const profileCard = document.createElement("div");
    profileCard.className = "result-group";
    profileCard.innerHTML =
      "<h3>Participant</h3><ul>" +
      "<li><span>Name</span><strong>" +
      profile.name.replace(/</g, "&lt;") +
      "</strong></li>" +
      "<li><span>Email</span><strong>" +
      profile.email.replace(/</g, "&lt;") +
      "</strong></li>" +
      "</ul>";
    els.resultsList.appendChild(profileCard);

    const quizCard = document.createElement("div");
    quizCard.className =
      "result-group insights " + (quiz.passed ? "pass" : "fail");
    quizCard.innerHTML =
      "<h3>Quiz score</h3><ul>" +
      "<li><span>Result</span><strong>" +
      (quiz.passed ? "PASS" : "FAIL") +
      "</strong></li>" +
      "<li><span>Score</span><strong>" +
      quiz.correct +
      " / " +
      quiz.total +
      " (" +
      quiz.percent +
      "%)</strong></li>" +
      "<li><span>Pass mark</span><strong>" +
      QUIZ_PASS_PERCENT +
      "%</strong></li>" +
      "</ul>";
    els.resultsList.appendChild(quizCard);

    const insight = document.createElement("div");
    insight.className = "result-group insights";
    insight.innerHTML =
      "<h3>Survey insights</h3><ul>" +
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
          let mark = "";
          if (question.correct !== undefined) {
            mark =
              String(value) === String(question.correct)
                ? ' <em class="ok">✓</em>'
                : ' <em class="bad">✗</em>';
          }
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
            mark +
            "</strong></li>"
          );
        })
        .join("");
      group.innerHTML = "<h3>" + survey.title + "</h3><ul>" + items + "</ul>";
      els.resultsList.appendChild(group);
    });
  }

  els.startForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = els.profileName.value.trim();
    const email = els.profileEmail.value.trim();
    if (name.length < 2) {
      els.startError.textContent = "Please enter your full name.";
      els.startError.classList.remove("hidden");
      return;
    }
    if (!isValidEmail(email)) {
      els.startError.textContent = "Please enter a valid email address.";
      els.startError.classList.remove("hidden");
      return;
    }
    els.startError.classList.add("hidden");
    profile = { name: name, email: email };
    activeSurvey = 0;
    openQuestionId = null;
    showSurvey();
  });

  els.tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activeSurvey = Number(tab.getAttribute("data-survey"));
      openQuestionId = null;
      showSurvey();
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
    if (!(input instanceof HTMLInputElement)) return;

    if (input.type === "radio") {
      setAnswer(input.name, input.value, true);
      return;
    }

    if (input.type === "checkbox" && input.hasAttribute("data-multi-id")) {
      const questionId = input.getAttribute("data-multi-id");
      const selected = Array.from(
        els.list.querySelectorAll('input[data-multi-id="' + questionId + '"]:checked')
      ).map(function (node) {
        return node.value;
      });
      setAnswer(questionId, selected, false);
      const followUp = firstFollowUpUnlocked(questionId);
      if (followUp) openQuestionId = followUp.id;
      renderSurvey();
    }
  });

  els.list.addEventListener("input", function (event) {
    const area = event.target;
    if (!(area instanceof HTMLTextAreaElement) || !area.hasAttribute("data-text-id")) return;
    const id = area.getAttribute("data-text-id");
    answers[id] = area.value;
    saveState();
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
    saveState();

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
          showSurvey();
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
    profile = { name: "", email: "" };
    activeSurvey = 0;
    openQuestionId = null;
    saveState();
    showStart();
    showToast("Form cleared.");
  });

  els.editAgain.addEventListener("click", function () {
    showSurvey();
  });

  els.downloadJson.addEventListener("click", function () {
    const insights = buildInsights();
    const payload = {
      submittedAt: new Date().toISOString(),
      profile: profile,
      quiz: insights.quiz,
      insights: {
        trueCount: insights.trueCount,
        falseCount: insights.falseCount,
        followUps: insights.followUps,
        avgRating: insights.avgRating,
      },
      surveys: SURVEYS.map(function (survey, surveyIndex) {
        return {
          id: survey.id,
          title: survey.title,
          quiz: !!survey.quiz,
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
              correct: question.correct,
              isCorrect:
                question.correct !== undefined
                  ? String(value) === String(question.correct)
                  : null,
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

  if (started && profile.name && profile.email) {
    showSurvey();
  } else {
    showStart();
  }
})();
