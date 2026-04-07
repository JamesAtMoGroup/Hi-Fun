# FOMO — Don't Miss Out!

> 雙北 20–35 歲年輕族群的「即時 × 社交 × 交友」城市活動入口

## Quick Start

```bash
# Install dependencies
yarn install

# Start mobile app (Expo)
yarn mobile

# Start backend server
yarn server
```

## Monorepo Structure

```
Hi-Fun/
├── apps/
│   └── mobile/              # @fomo/mobile — Expo React Native (iOS-first)
├── server/                  # @fomo/server — Node.js + Express + TypeScript
├── packages/
│   └── shared/              # @fomo/shared — Shared types & constants
└── docs/                    # Architecture docs, specs, QA checklists
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Expo (React Native), iOS-first |
| Navigation | @react-navigation v6 (bottom tabs + native stack) |
| Map | react-native-maps (Google Maps provider) |
| State | Zustand + TanStack Query |
| Styling | NativeWind (Tailwind CSS for RN) |
| i18n | react-i18next (zh-TW + en, follow system locale) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 + PostGIS |
| Migrations | Knex.js |
| Auth | Email/Password + JWT (access 15min + refresh 7d) |
| Payment | L0: External URL; L1: TapPay/NewebPay (stub) |
| Transport | Uber / Google Maps / Apple Maps deeplinks |

## Documentation

See [`docs/`](./docs/) for:
- [Project Requirements (PRD)](./docs/prd.md)
- [Team & Agent Workflow](./docs/team-workflow.md)
- [DB Schema](./docs/db-schema.sql)
- [API Spec](./docs/api-spec.md)
- [UI/UX Architecture](./docs/ui-ux-architecture.md)
- QA Checklists per module
