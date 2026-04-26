# Journal

A minimal, end-to-end-encrypted journaling app that syncs across devices without ever sending plaintext to a server.

**Live:** [journal.byearlybird.com](https://journal.byearlybird.com)

## What it does

- **Private by default.** Entries are encrypted in the browser before they leave the device. The server stores opaque ciphertext and never holds a key capable of reading it.
- **Local-first.** Everything is written to a local SQLite database in the browser. The app works offline; sync is just a background concern.
- **Multi-device sync.** Conflict resolution uses a hybrid logical clock with last-writer-wins semantics, so writes from any device merge cleanly without a coordinator.
- **Installable.** Ships as a PWA with a native-feeling shell, dynamic theme color, and an iOS wrapper.
- **Export your data.** One-click export of plaintext entries — no lock-in.

## Stack

**Frontend**
- React 19 + TanStack Router (file-based routing)
- Tailwind v4, Base UI primitives, Phosphor icons
- Nanostores for state, IndexedDB for key caching
- SQLite in the browser via [`sqlocal`](https://github.com/DallasHoff/sqlocal) (OPFS-backed) with Kysely as the query builder

**Backend** (Cloudflare)
- Workers + D1 (SQLite at the edge)
- oRPC for end-to-end-typed RPC with Zod-validated contracts
- Clerk for authentication

**Crypto**
- AES-256-GCM data encryption key, wrapped by a PBKDF2-derived key (600k iterations, SHA-256)
- Only the wrapped key ever touches the server; the unwrapped key lives as a non-extractable `CryptoKey` in IndexedDB

**Tooling**
- Vite 8, TypeScript (strict), oxlint + oxfmt, pnpm

## Architecture in one paragraph

The browser holds a SQLite database that is the source of truth for the user's data. Every mutation to a syncable table fires SQLite triggers that stamp the row with a hybrid logical clock and enqueue an entry in an outbox. A sync pass encrypts the outbox, pushes it to a Cloudflare Worker, and pulls remote changes back, decrypting and applying them under last-writer-wins. The Worker only ever sees ciphertext.
