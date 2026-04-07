# 2F Frontend Foundation — QA Checklist

## Verification Results

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | package.json has all required deps | ✅ PASSED | expo, react-navigation, maps, nativewind, zustand, react-query, axios, i18next, etc. |
| 2 | App.tsx wraps all providers correctly | ✅ PASSED | SafeAreaProvider → QueryClientProvider → NavigationContainer → RootNavigator |
| 3 | RootNavigator switches Auth/MainTabs | ✅ PASSED | Checks `authStore.isAuthenticated` |
| 4 | AuthStack has 4 screens | ✅ PASSED | Welcome, Login, Register, OnboardingDating |
| 5 | MainTabs has 5 tabs | ✅ PASSED | Home, Map, Discover, Tickets, Profile |
| 6 | HomeStack nested correctly | ✅ PASSED | Home → EventDetail → Search → CategoryList |
| 7 | API client has auth interceptor | ✅ PASSED | Bearer token attachment + 401 refresh logic |
| 8 | AuthStore persists tokens | ✅ PASSED | Uses expo-secure-store |
| 9 | i18n configured with zh-TW and en | ✅ PASSED | expo-localization for detection, fallback en |
| 10 | Both locale files have matching keys | ✅ PASSED | zh-TW.json and en.json with same structure |
| 11 | Theme exports match architecture colors | ✅ PASSED | Primary #7C3AED, secondary #EC4899, etc. |
| 12 | tailwind.config has custom colors | ✅ PASSED | Custom palette extended in config |

**Result: 12/12 PASSED**
