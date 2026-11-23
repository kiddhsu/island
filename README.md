# Island 學習島

國小一、二年級教育小遊戲：2D 小島地圖，涵蓋注音、識字、閱讀、數學、量與圖形、安全、自然、健康、自理與情緒。

## 本機開發

```bash
npm install
cp .env.example .env.local   # 填入 Firebase（可選；不填也能玩，進度只存本機）
npm run dev
```

開發伺服器預設路徑需搭配 `base: /island/`。若要以根路徑本機預覽，可暫時改 `vite.config.ts` 的 `base` 與 `main.tsx` 的 `basename`。

## Firebase

1. 啟用 Authentication → Google
2. 建立 Firestore，部署本倉庫的 [`firestore.rules`](firestore.rules)（含 `island/{uid}/...`）
3. Authorized domains 加入 `localhost` 與 `kiddhsu.github.io`
4. 將 6 個 `VITE_FIREBASE_*` 寫入 `.env.local`，並在 GitHub repo Secrets 設定同名變數供 Pages 建置

進度路徑：`island/{uid}/profiles/{profileId}`、`island/{uid}/progress/{profileId}`（與一年級練習、好奇小勇者分開）。

## 部署

推送到 `main` 後由 GitHub Actions 部署至 GitHub Pages：

https://kiddhsu.github.io/island/

請在 GitHub repo → Settings → Pages → Source 選 **GitHub Actions**。

## 音效

介面與答題回饋音來自 [卡斯伯免費音效庫](https://www.casper.tw/sound-effects/zh-tw/)，可自由使用（[授權說明](https://www.casper.tw/sound-effects/zh-tw/license)）。

| 檔案 | 用途 | 來源名稱 |
|------|------|----------|
| `public/sounds/tap.mp3` | 按鈕輕點 | Click Crisp |
| `public/sounds/correct.mp3` | 答對 | Confirm Bright |
| `public/sounds/wrong.mp3` | 答錯（柔和） | Error Blip Low |
| `public/sounds/success.mp3` | 回合結束 | Confirm Sparkle |
| `public/sounds/enter.mp3` | 進島／開始 | Dialog Pop |

畫面上有「音效開／關」開關，偏好存在本機 `localStorage`。
