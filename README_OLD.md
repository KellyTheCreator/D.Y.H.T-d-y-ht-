
\# Dwight (DYHT) - Tauri Desktop Agent



Welcome to Dwight! This is a cross-platform desktop agent designed for privacy-first, always-on audio sensing, with the ability to transcribe, classify, and log sound events directly on your device.a dvr for real life! rewind, review, inspect and identify lifes audio. "never again miss what was said"!
realtime sound buffering?recording with ai to help you review transcribe spoken words and identify audible sounds with manual trigger settable trigger words and flashing lights when triggered by preset trigger sound eg car screaching baby crying glass breaking... 
used as a personal sound and memory aide. an aide for the deaf, handy forensic tool and a helper for new parents. also tested and proven to help with real time learning and development tool for autistic children




\## Features (Roadmap)

\- Cross-platform desktop app (Windows, Mac, Linux) via Tauri

\- Real-time microphone audio buffer

\- Manual and automatic recording triggers

\- Whisper (WASM) for privacy-preserving local transcription

\- Waveform visualization and transcript display

\- SQLite (local, via Drizzle ORM) for persistent memory/logs

\- Accessibility hooks (flash/vibrate on trigger)

\- Modular: hooks for sound classification, device sync, "find my phone", and more

\- Optional Postgres cloud sync (future)

\- Privacy "kill switch" for mic/listening

\- Extensible UI (React/TypeScript)



\## Setup Instructions



\### Prerequisites

\- \[Node.js](https://nodejs.org/) (v18+ recommended)

\- \[Rust \& Cargo](https://www.rust-lang.org/tools/install)

\- \[Tauri CLI](https://tauri.app/v1/guides/getting-started/setup/)

\- \[pnpm](https://pnpm.io/) or \[npm](https://www.npmjs.com/) (your choice)



\### Steps



1\. \*\*Install dependencies\*\*  

&nbsp;  Run in your project root:

&nbsp;  ```

&nbsp;  pnpm install

&nbsp;  ```

&nbsp;  or

&nbsp;  ```

&nbsp;  npm install

&nbsp;  ```



2\. \*\*Start the development server\*\*  

&nbsp;  ```

&nbsp;  pnpm tauri dev

&nbsp;  ```

&nbsp;  or

&nbsp;  ```

&nbsp;  npm run tauri dev

&nbsp;  ```



\### File Structure



See the codebase for:

\- `src-tauri/` — Rust (Tauri backend)

\- `src/` — React/TypeScript (frontend)

\- `public/` — Static files



\### Notes

\- All audio processing and transcription are done locally for maximum privacy.

\- Cloud sync and advanced features are opt-in and disabled by default.



---



\## Contributing



Pull requests and feedback are welcome!  

For roadmap, issues, and feature requests, see the Issues tab.



---



\## License



MIT

#   d w i g h t - d v r 4 s o u n d 
 
 
