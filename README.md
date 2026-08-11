# Accordion Survey

A modern multi-section survey with accordion questions, rating scales, progress tracking, and a results summary.

## Features

- Name + email start screen (feels like a real form)
- Three sections: Survey I, Survey II, Quiz
- Accordion questions (one open at a time)
- Mixed question types:
  - Rating (too bad → super)
  - True / False
  - Multiple choice
  - Multi-select checkboxes (“Select all that apply”)
  - Short text (required or optional)
- Conditional follow-ups (`showIf`) — False → ask why, or Other → explain
- Quiz mode with correct answers, score %, and Pass/Fail (70%)
- Follow-ups auto-open and clear when hidden
- Progress counts only visible required questions
- Local save in the browser
- Results summary + JSON download

## Live demo

`https://abhisekumar.github.io/accordion-survey/`

## Run locally

Open `index.html` in a browser, or:

```bash
npx serve .
```

## License

MIT
