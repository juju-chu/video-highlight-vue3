# 影片 Highlight 編輯器 (Video Highlight Vue3)

## 專案說明
這是一個基於 Vue 3 開發的影片 Highlight 編輯工具，讓使用者能夠輕鬆地為影片添加、編輯和管理 Highlight 片段。<br>
可使用人工智慧幫助用戶從上傳的影片中創建 Highlight 片段，並為這些片段添加字幕。（目前使用 mock api 模擬 AI 處理）<br>
<br>
專案採用了最新的 Vue 3 和 TypeScript，提供了現代化的開發體驗和型別安全性。<br>
使用 mock data 進行開發，上傳影片後會出現 public/mock/transcript.json 的結果，可用來播放和測試編輯功能。

### 使用者故事
- 上傳並產生 Highlight 片段、章節標題、字幕
- 預覽 Highlight 片段、章節標題、字幕效果
- 可播放、暫停、跳躍 Highlight 的影片
- 對應時間的字幕會出現在影片上
- 時間軸會顯示被選定的 Highlight 片段
- 可以選擇或取消選擇 Highlight 片段的句子
- 可以點擊時間戳，方便影片前往播放該時間點
- 編輯區的字幕會自動滾動跟隨預覽播放

## 專案設置

### 環境需求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安裝步驟

1. clone 專案
```bash
git clone [repository-url]
cd video-highlight-vue3
```

2. 安裝
```bash
npm install
# 或
yarn install
```

3. 啟動開發伺服器
```bash
npm run dev
# 或
yarn dev
```

## 編譯和部署

### 開發環境
```bash
npm run dev
# 或
yarn dev
```

### 生產環境編譯
```bash
npm run build
# 或
yarn build
```

### 預覽生產版本
```bash
npm run preview
# 或
yarn preview
```

## 技術選擇說明

### 核心技術

- **Vue 3**: 採用最新的 Vue 3 框架，利用 Composition API 提供更好的程式碼組織和重用性
- **TypeScript**: 確保程式碼的型別安全性和開發時的錯誤檢查
- **Vite**: 現代化的前端建置工具，提供極快的開發體驗
- **Pinia**: Vue 3 官方推薦的狀態管理解決方案

### UI/UX 設計

- **Tailwind CSS**: 採用實用優先的 CSS 框架，提供高度客製化的設計彈性
- **響應式設計**: 支援各種螢幕尺寸，提供最佳的使用體驗

### 效能優化

- 使用 Vue 3 的 `<script setup>` 語法，減少樣板程式碼
- 採用 Vite 的模組化開發，實現更快的開發和建置速度
- 實作影片播放的效能優化，確保流暢的播放體驗

### 專案結構

```
src/
├── components/      # Vue 元件
├── store/           # Pinia 狀態管理
├── assets/         # 靜態資源
└── App.vue         # 根元件
```

## 使用方式

1. 開啟頁面：https://juju-chu.github.io/video-highlight-vue3/
2. 可使用 public/sample.mp4 作為測試影片

