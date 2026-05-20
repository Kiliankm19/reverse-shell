# reverseshell

Client-side reverse shell generator for authorized security testing and lab work. It is inspired by tools such as [revshells.com](https://www.revshells.com) and [tex2e reverse shell generator](https://tex2e.github.io/reverse-shell-generator/index.html).

> Use only in environments where you have explicit permission. The app generates commands in the browser; it does not open callbacks or execute payloads.

## Features

- Reverse shell builder for Bash, Netcat, Python, PHP, Perl, Ruby, Socat, and PowerShell.
- Obfuscation helpers missing from many generators: URL encoding, Bash base64 wrappers, `${IFS}` spacing, reversed Bash reconstruction, PowerShell `-EncodedCommand`, PowerShell string chunking, and Python `chr()` rebuilds.
- Listener builder for netcat, rlwrap, ncat SSL, socat TTY, and Metasploit multi/handler.
- Shell upgrade recipes for Python PTY, `script`, socat, and Windows-oriented notes.
- Ready-to-use reverse shell collections, including bind, staged, and HoaxShell-style presets, plus browser-side saved collections with JSON import/export via IndexedDB.
- Markdown engagement card export with LHOST, LPORT, generated command, raw command, and recommended listener.
- Dark Tailwind/shadcn UI in the same family as `shellcodes` and `xsspayloads`.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/en/builder`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server. |
| `pnpm build` | Build the production app. |
| `pnpm lint` | Run ESLint. |
| `pnpm typecheck` | Run TypeScript checks. |
| `pnpm format` | Format the project. |

## Project Structure

```text
reverseshell/
├── src/app/[locale]/
│   ├── builder/       # reverse shell generator
│   ├── listener/      # listener command generator
│   ├── upgrade/       # shell upgrade recipes
│   └── collections/   # saved configs
├── src/features/      # client panels and feature UI
├── src/lib/reverse-shells/
│   ├── catalog.ts     # payload/listener/upgrade catalogs
│   ├── generate.ts    # rendering and obfuscation engine
│   └── types.ts
└── messages/          # next-intl message bundles
```

## Security Notes

- All generation happens locally in the browser.
- No generated command is executed by the app.
- Collections are stored in IndexedDB and can be exported/imported as JSON.
- Inputs are bounded before storage/import to reduce accidental oversized payloads.
- Script CSP is nonce-based via middleware; inline scripts are not allowed without the per-request nonce.

## License

Private/unlicensed unless stated otherwise.
