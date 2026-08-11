# Accordion Survey

A modern multi-section survey with accordion questions, rating scales, progress tracking, and a results summary.

## Features

- Three survey sections with tab navigation
- Accordion questions (one open at a time)
- Mixed question types:
  - Rating (too bad → super)
  - True / False
  - Multiple choice
  - Short text (required or optional)
- Conditional follow-ups (`showIf`) — e.g. False → ask why
- Follow-ups auto-open, clear when hidden again
- Answered state on completed questions
- Progress counts only visible required questions
- Auto-advance after radio answers
- Quick insights (True/False counts, follow-ups, average rating)
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
