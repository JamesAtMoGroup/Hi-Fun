# FOMO App — Team & Agent Workflow

## 開發團隊架構

```
                    ┌─────────────────┐
                    │   Tech Lead     │
                    │   協調 + 整合    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
    │ 架構組   │        │ 開發組   │        │ 品質組   │
    └────┬────┘        └────┬────┘        └────┬────┘
         │                   │                   │
    ┌────┴────┐        ┌────┴────────┐     ┌────┴────┐
    │DB Arch  │        │ Backend Dev │     │ QA Lead  │
    │API Arch │        │ FE Core Dev │     │          │
    │UI/UX    │        │ FE Social   │     └─────────┘
    │  Arch   │        │ Integration │
    └─────────┘        │   Dev       │
                       └─────────────┘
```

---

## Phase 1: 架構組（Parallel）

### Agent 1 — DB Architect
- **職責**: PostgreSQL schema 設計、PostGIS 設定、migration 順序、indexes
- **技能**: SQL、PostgreSQL、PostGIS、資料建模
- **產出**:
  - `docs/db-schema.sql` — 完整 SQL schema
  - `docs/db-architect-qa.md` — 自我品質檢查清單
- **QA 重點**: FK 一致性、index 覆蓋率、CHECK 約束與 shared types 對齊、交友欄位完整性

### Agent 2 — API Architect
- **職責**: REST API 路由設計、request/response 規格、錯誤碼定義
- **技能**: RESTful API 設計、TypeScript、API 文件撰寫
- **產出**:
  - `docs/api-spec.md` — 完整 API 規格文件
  - `docs/api-architect-qa.md` — 自我品質檢查清單
- **QA 重點**: endpoint 命名一致性、auth 標記正確、response 與 shared types 對齊、交友 API 完整

### Agent 3 — UI/UX Architect
- **職責**: 畫面架構、Navigation flow、component 拆分、data flow
- **技能**: React Native、Expo、react-navigation、UI 設計
- **產出**:
  - `docs/ui-ux-architecture.md` — 完整 UI/UX 架構文件
  - `docs/ui-ux-architect-qa.md` — 自我品質檢查清單
- **QA 重點**: 畫面覆蓋率、navigation 無死路、API 對應、交友畫面流程

### Phase 1 Review（Tech Lead）
- 交叉比對三個架構產出
- 確認 DB schema 支援所有 API 查詢
- 確認 API response 與 shared types 一致
- 確認 UI 需要的資料 API 都有提供
- 解決衝突後進入 Phase 2

---

## Phase 2: 開發組（Parallel，依架構產出開發）

### Agent 4 — Backend Dev
- **職責**: Express server setup、DB migrations (Knex)、所有 API controllers、auth middleware
- **技能**: Node.js、Express、TypeScript、Knex.js、JWT、bcrypt
- **依賴**: DB Architect + API Architect 產出
- **產出**: `server/` 完整可運行後端
- **QA**: API 回傳格式正確、auth 保護正確、SQL injection 防護

### Agent 5 — Frontend Core Dev
- **職責**: Expo project 建立、Navigation 設定、Home/Map/Search/EventDetail screens
- **技能**: React Native、Expo、react-navigation、react-native-maps、NativeWind
- **依賴**: UI/UX Architect + API Architect 產出
- **產出**: `apps/mobile/` 核心畫面
- **QA**: Navigation flow 正確、API 呼叫正確、i18n 支援

### Agent 6 — Frontend Social Dev
- **職責**: Profile、Friends、Dating (Discover/Filter/Profile Edit)、Tickets、Notifications、QR code
- **技能**: React Native、Zustand、QR code 生成、Tinder-style UI
- **依賴**: UI/UX Architect + API Architect 產出
- **產出**: `apps/mobile/` 社交/交友/票券畫面
- **QA**: 交友 filter 邏輯正確、QR 顯示正確、通知流程完整

### Agent 7 — Integration Dev
- **職責**: API client service (Axios)、Uber/Maps deeplinks、payment stubs、i18n 設定、push notification
- **技能**: Axios、deeplink 處理、i18next、expo-notifications
- **依賴**: API Architect 產出
- **產出**: `apps/mobile/src/services/`、`apps/mobile/src/utils/`、`apps/mobile/src/i18n/`
- **QA**: Deeplink 格式正確、API client 錯誤處理、i18n 翻譯完整

---

## Phase 3: 品質組

### Agent 8 — QA Lead
- **職責**: Review 所有 agents 產出、跑 checklist、驗證跨模組整合
- **產出**: `docs/qa-final-report.md`
- **檢查項目**:
  - TypeScript 型別一致性（shared ↔ server ↔ mobile）
  - API endpoint 與前端呼叫對應
  - Navigation 完整性
  - 安全性（no sensitive data leak、proper auth）
  - i18n 覆蓋率
  - 交友功能端到端流程

---

## 溝通機制

1. **每個 Agent 產出後**：Tech Lead review 並交叉比對
2. **發現衝突時**：Tech Lead 調整並通知相關 agents
3. **每個 Agent 自帶 QA checklist**：完成時自我檢查
4. **Phase 3 QA Lead**：最終全面品質把關

---

## 進度追蹤

| Phase | Agent | Status | Output |
|-------|-------|--------|--------|
| 1 | DB Architect | 🔄 In Progress | `docs/db-schema.sql` |
| 1 | API Architect | 🔄 In Progress | `docs/api-spec.md` |
| 1 | UI/UX Architect | 🔄 In Progress | `docs/ui-ux-architecture.md` |
| 1 | Phase 1 Review | ⏳ Pending | — |
| 2 | Backend Dev | ⏳ Pending | `server/` |
| 2 | Frontend Core Dev | ⏳ Pending | `apps/mobile/` core screens |
| 2 | Frontend Social Dev | ⏳ Pending | `apps/mobile/` social screens |
| 2 | Integration Dev | ⏳ Pending | `apps/mobile/` services |
| 3 | QA Lead | ⏳ Pending | `docs/qa-final-report.md` |

---

## 決策紀錄 (Decision Log)

| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-07 | iOS-first (Expo) | 目標用戶以 iPhone 為主 |
| 2026-04-07 | Email/Password auth only | MVP 簡化，後續再加 Apple/Google Sign-In |
| 2026-04-07 | zh-TW + en, follow system locale | 雙語支援，跟隨系統 |
| 2026-04-07 | NativeWind for styling | Eventbrite-style clean UI |
| 2026-04-07 | 新增 Dating feature (Tinder-like) | 交友功能：性別、角色、偏好篩選 |
| 2026-04-07 | Payment L0: external URL | 避開法遵風險，快速上線 |
| 2026-04-07 | Merchant dashboard deferred | MVP 專注用戶端 |
