# Accordion Survey

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://abhisekumar.github.io/accordion-survey/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Modern **accordion survey tool** with a real form start screen, mixed question types, conditional follow-ups, multi-select checkboxes, and quiz pass/fail scoring.

**Live demo:** https://abhisekumar.github.io/accordion-survey/

Prefill and auto-start with query params:

`https://abhisekumar.github.io/accordion-survey/?name=Jaga&email=aj@google.com`

## Why use it

- Demo a production-style feedback + quiz flow
- Show conditional logic (False → ask why)
- Collect name/email before questions
- Score True/False quiz answers with a clear pass mark

## Features

- Name + email start screen
- Sections: Survey I, Survey II, Quiz
- Accordion questions (one open at a time)
- Question types:
  - Rating (too bad → super)
  - True / False
  - Multiple choice
  - Multi-select (“Select all that apply”)
  - Short text (required or optional)
- Conditional follow-ups (`showIf`)
- Quiz mode with correct answers and Pass/Fail (70%)
- Progress for visible required questions
- Local save in the browser
- Results summary + JSON download

## Tech

- HTML, CSS, and JavaScript
- LocalStorage for draft answers
- GitHub Pages hosting
- No backend required

## Run locally

```bash
npx serve .
```

## SEO / discoverability

- Canonical URL and Open Graph tags
- JSON-LD `WebApplication` schema
- `robots.txt` + `sitemap.xml`

## Related tools

- [Password Generator](https://abhisekumar.github.io/password-generator/)
- [Color Converter](https://abhisekumar.github.io/color-converter/)
- [Image Compressor](https://abhisekumar.github.io/image-compressor/)

## License

MIT © Abhisek Kumar
