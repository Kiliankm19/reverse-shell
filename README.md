# reverseshell

Client-side reverse shell generator for authorized security testing and lab work. It is inspired by tools such as [revshells.com](https://www.revshells.com) and [tex2e reverse shell generator](https://tex2e.github.io/reverse-shell-generator/index.html).

> Use only in environments where you have explicit permission. The app generates commands in the browser; it does not open callbacks or execute payloads.

## Features

- Reverse shell builder for Bash, Netcat, Python, PHP, Perl, Ruby, Node.js, Java, Go, Lua, awk, OpenSSL, Telnet, Socat, and PowerShell.
- Builder persists your last config in localStorage and syncs shareable `?template=&lhost=&lport=` URLs.
- Inline recommended listener command with links to the listener and TTY upgrade pages.
- Obfuscation helpers missing from many generators: URL encoding, Bash base64 wrappers, `${IFS}` spacing, reversed Bash reconstruction, PowerShell `-EncodedCommand`, PowerShell string chunking, and Python `chr()` rebuilds.
- Search and filters for payload family and platform.
- Listener builder for netcat, rlwrap, ncat SSL, OpenSSL `s_server`, socat TTY, and Metasploit multi/handler.
- Shell upgrade recipes for Python PTY, `script`, socat, and Windows-oriented notes.
- Ready-to-use reverse shell collections, including bind, staged, and HoaxShell-style presets, plus browser-side saved collections with JSON import/export preview via IndexedDB.
- Markdown engagement card export with LHOST, LPORT, generated command, raw command, and recommended listener.
- Dark Tailwind/shadcn UI in the same family as `shellcodes` and `xsspayloads`.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3002` for the reverse shell builder (dev server uses port 3002 by default).

## Routes

| Route           | Page                             |
| --------------- | -------------------------------- |
| `/`             | Reverse shell builder (home)     |
| `/builder`      | Redirects to `/` (legacy path)   |
| `/reverseshell` | Marketing landing page           |
| `/listener`     | Listener command generator       |
| `/upgrade`      | Shell upgrade recipes            |
| `/collections`  | Presets and saved configurations |

## Scripts

| Command          | Description                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| `pnpm dev`       | Start the Next.js dev server.                                           |
| `pnpm build`     | Build the production app.                                               |
| `pnpm lint`      | Run ESLint.                                                             |
| `pnpm typecheck` | Run TypeScript checks.                                                  |
| `pnpm test`      | Run Vitest unit tests.                                                  |
| `pnpm test:e2e`  | Run Playwright end-to-end tests (`pnpm exec playwright install` first). |
| `pnpm format`    | Format the project.                                                     |

## Project Structure

```text
reverseshell/
├── src/app/
│   ├── page.tsx       # reverse shell builder (home)
│   ├── builder/       # redirect to /
│   ├── reverseshell/  # marketing landing
│   ├── listener/      # listener command generator
│   ├── upgrade/       # shell upgrade recipes
│   └── collections/   # saved configs
├── src/features/      # client panels and feature UI
├── src/lib/reverse-shells/
│   ├── catalog.ts     # payload/listener/upgrade catalogs
│   ├── generate.ts    # rendering and obfuscation engine
│   └── types.ts
├── tests/e2e/         # Playwright smoke tests
└── messages/en/       # English UI copy
```

## Security Notes

- All generation happens locally in the browser.
- No generated command is executed by the app.
- Collections are stored in IndexedDB and can be exported/imported as JSON.
- JSON imports are schema-validated and previewed before being written.
- Inputs are bounded before storage/import to reduce accidental oversized payloads.
- Script CSP is nonce-based via middleware; inline scripts are not allowed without the per-request nonce.
- No analytics or third-party telemetry is configured by default.

## License

Private/unlicensed unless stated otherwise.


