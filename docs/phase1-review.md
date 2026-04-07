# Phase 1 Review — 架構交叉比對報告

> Reviewed by: Tech Lead  
> Date: 2026-04-07

## 比對結果摘要

三份架構產出整體一致性高，發現 **3 個需要對齊的問題** 和 **2 個建議改進**。

---

## 1. 發現的不一致（需修正）

### Issue 1: Dating Role 值不一致 ⚠️

| Source | Role Values |
|--------|-------------|
| **DB Schema** | `top, bottom, vers, vers_top, vers_bottom, side, other` |
| **API Spec** | `top, bottom, versatile, none` |
| **UI/UX Arch** | References API spec values |
| **User 原始需求** | `top, bottom, vers, vers-top, vers-bottom, side` |

**決定**: 採用 DB Schema 的值，因為最完整且符合用戶需求。  
**修正**: API Spec 的 `DatingProfile.role` 和 `DatingFilters.roles` 需要更新為：  
`'top' | 'bottom' | 'vers' | 'vers_top' | 'vers_bottom' | 'side' | 'other'`

---

### Issue 2: API Spec 缺少 `orders` 表的 `coupon_id` 欄位

| Source | Coupon in Order |
|--------|----------------|
| **DB Schema** | `orders` 表 **沒有** `coupon_id` FK（coupon 在 API 層驗證，不存 DB） |
| **API Spec** | `POST /orders` 接受 `couponCode`，在 response 中也沒有回傳 coupon info |

**決定**: 需要在 `orders` 表新增 `coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL` 欄位，以便追蹤哪個訂單使用了哪個優惠券（退款/稽核需要）。  
**修正**: DB Schema 需加欄位；API response 可保持不變。

---

### Issue 3: `UserProfile` 計算欄位來源不明確

| Source | UserProfile |
|--------|-------------|
| **Shared Types** | `UserProfile extends User` with `eventsAttended, eventsWantToGo, friendCount` |
| **DB Schema** | `users` 表沒有這些欄位（需從 `event_interactions` 和 `friendships` 計算） |
| **API Spec** | `GET /users/me` returns `UserProfile` |

**決定**: 這些是 computed fields，在 API 層 JOIN/COUNT 計算，不存 DB。這是正確的。  
**修正**: 無需修正，但需在 API Spec 補充 note 說明這些是 computed fields。

---

## 2. 建議改進

### Suggestion A: 新增 `past` type 到 `/users/me/events`

UI/UX Architecture 的 MyEventsScreen 有 "Past" segment，但 API Spec 的 `/users/me/events` 只支援 `attending | interested | want_to_go`。

**建議**: 新增 `past` type（查詢 `event_interactions` JOIN `events WHERE end_time < NOW()`）。

---

### Suggestion B: Shared Types 需新增 Dating 相關型別

API Spec 定義了 3 個新型別（`DatingProfile`, `DatingFilters`, `DiscoverPerson`），但 `packages/shared/src/types/index.ts` 還沒有這些。

**需要新增到 shared types**:
```typescript
// Dating Profile
export interface DatingProfile {
  userId: string;
  gender: 'male' | 'female' | 'non_binary' | 'other';
  role: 'top' | 'bottom' | 'vers' | 'vers_top' | 'vers_bottom' | 'side' | 'other';
  interestedInGenders: ('male' | 'female' | 'non_binary' | 'other')[];
  interestedInRoles: ('top' | 'bottom' | 'vers' | 'vers_top' | 'vers_bottom' | 'side' | 'other')[];
  bio: string;
  photos: string[];
  showOnDating: boolean;
  age: number;
  createdAt: string;
  updatedAt: string;
}

// Dating Filters
export interface DatingFilters {
  genders: ('male' | 'female' | 'non_binary' | 'other')[];
  roles: ('top' | 'bottom' | 'vers' | 'vers_top' | 'vers_bottom' | 'side' | 'other')[];
  ageRange: { min: number; max: number };
  maxDistance: number;
}

// Discover Person (public, no sensitive data)
export interface DiscoverPerson {
  userId: string;
  displayName: string;
  age: number;
  gender: 'male' | 'female' | 'non_binary' | 'other';
  role: 'top' | 'bottom' | 'vers' | 'vers_top' | 'vers_bottom' | 'side' | 'other';
  bio: string;
  photos: string[];
  distance: number;
  mutualFriendCount: number;
  sharedEventCount: number;
}

// Friend Activity
export interface FriendActivity {
  id: string;
  user: { id: string; displayName: string; avatarUrl?: string };
  type: 'attending' | 'interested' | 'want_to_go';
  event: EventSummary;
  createdAt: string;
}
```

---

## 3. 一致性確認（通過）

| 檢查項目 | 結果 |
|----------|------|
| DB 每張表都有對應的 API endpoint | ✅ 15 tables, all covered |
| API response types 都在 shared types 中定義（或已標註新增） | ✅ 3 new types noted |
| UI 每個畫面都有對應的 API endpoint | ✅ 25+ screens, all mapped |
| Event category values 三方一致 | ✅ 10 categories match |
| Event status values 三方一致 | ✅ draft/published/cancelled/ended |
| Ticket status values 三方一致 | ✅ valid/used/cancelled/refunded |
| Payment method values 三方一致 | ✅ credit_card/apple_pay/google_pay/external |
| Friendship status values 三方一致 | ✅ pending/accepted/blocked |
| Interaction type values 三方一致 | ✅ attending/interested/want_to_go |
| Notification type values 三方一致 | ✅ 5 types match |
| Gender values 三方一致 | ✅ male/female/non_binary/other |
| Deeplink templates referenced correctly | ✅ Uber/Google Maps/Apple Maps |
| Map center default (Taipei) consistent | ✅ 25.033, 121.5654 |
| Currency (TWD, INTEGER) consistent | ✅ All prices as INTEGER |
| PostGIS usage consistent | ✅ DB + API geo queries aligned |

---

## 4. 修正行動

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| 1 | 統一 dating role 值為 DB 的 7 個值 | Phase 2 Backend Dev | High |
| 2 | DB `orders` 表新增 `coupon_id` | Phase 2 Backend Dev | Medium |
| 3 | API `GET /users/me/events` 新增 `past` type | Phase 2 Backend Dev | Medium |
| 4 | Shared types 新增 Dating 相關型別 | Phase 2 Integration Dev | High |
| 5 | API Spec 補充 UserProfile computed fields 說明 | Documentation | Low |

---

## 結論

**架構設計通過 Review。** 三份產出整體高度一致，發現的 3 個不一致已有明確修正方案。可以進入 Phase 2 開發階段。修正項目會在 Phase 2 各 agent 的 task 中一併處理。
