# FOMO App — Product Requirements Document (PRD)

## 問題（Problem）

- 活動資訊分散在 IG、FB、Accupass、店家限動、朋友口耳相傳；常常錯過當天剛發生的活動。
- 想揪團卻不知道朋友誰要去；想即刻出門卻缺交通／導航／購票的一條龍體驗。
- 想認識新朋友但缺少基於共同活動興趣的社交管道。

## 解決方案（Solution）

FOMO App 以「即時活動發現 + 社交關聯 + 交友配對 + 一鍵前往 + 一鍵購買」為核心，整合地圖｜交通｜金流｜交友，讓「看到 → 決定 → 認識人 → 抵達 → 參與」一路順暢。

---

## MVP 功能範圍

### 1. 活動清單 + 地圖
- 預設顯示「今天／本週」活動；地圖上以熱度視覺化
- 場地資訊（地址、營業時間、電話、照片、Google 評分）
- 篩選：時間、距離、類型（夜店／展演／市集／運動等）

### 2. 人氣排行 + 好友動態
- 活動「正在關注／已報名／想去」人數；顯示朋友要去
- 個人檔案頁：最近參加、想去清單
- 即時榜單（Tonight / This Weekend）

### 3. 交友功能（Tinder-like）
- 註冊時設定個人交友檔案：
  - 性別（male, female, non_binary, other）
  - 角色（top, bottom, vers, vers_top, vers_bottom, side, other）
  - 喜愛族群（interested_in_genders, interested_in_roles）
- Discover Tab：瀏覽符合自己偏好的人
- 可看到對方正在參加/有興趣的活動
- 登入後可在 Settings 隨時調整 filter
- 可選擇不開啟交友功能（show_on_dating = false）

### 4. 購票／優惠券
- MVP L0：外部售票連結跳轉
- MVP L1：站內結帳 stub（信用卡、Apple Pay、Google Pay）
- 訂單／票券錢包、入場掃碼 QR

### 5. 一鍵前往（Uber／地圖）
- Uber Deep Link：一鍵叫車（自動帶入目的地座標）
- Google Maps / Apple Maps：一鍵導航

### 6. 商家自助上架（Phase 2）
- 商家後台：建立活動、設定票種、上傳短片、購買曝光
- MVP 先由後台手動管理

---

## 目標用戶
- 雙北地區 20-35 歲年輕族群
- iOS 用戶優先

## 語言
- 繁體中文（zh-TW）+ 英文（en）
- 跟隨手機系統語言設定

## 商業模式
1. 商家付費推廣（首頁置頂、地圖置頂、關鍵字卡位）
2. 票務抽成（5-10%）
3. 會員制（VIP 折扣、優先通知）
4. 合作分潤（Uber/車隊導流）

---

## KPI（MVP 期）
- DAU / 7D Retention / 首週付費率
- 活動頁 → 購票轉化率
- 活動頁 → 導航或叫車點擊率
- Discover Tab 使用率 / 配對數
