# Island Quest 學習島

國小一、二年級寓教於樂平台：**3D 小島地圖**＋**十島十玩法**（跳躍、接物、岔路、翻牌、水管、時鐘、安全路徑、分類桶、背包、氣球）。題庫融進操作，不是純選擇題介面；不做手寫／語音評分。

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

| 檔案                        | 用途         | 來源名稱        |
| --------------------------- | ------------ | --------------- |
| `public/sounds/tap.mp3`     | 按鈕輕點     | Click Crisp     |
| `public/sounds/correct.mp3` | 答對         | Confirm Bright  |
| `public/sounds/wrong.mp3`   | 答錯（柔和） | Error Blip Low  |
| `public/sounds/success.mp3` | 回合結束     | Confirm Sparkle |
| `public/sounds/enter.mp3`   | 進島／開始   | Dialog Pop      |

音量請用裝置自行調整。

## 答題特效（tsParticles＋幾何光暈）

關卡與結果頁用 `@tsparticles/slim` 做低飽和石材色方塊粒子，連擊／結算改 CSS 菱形光暈（等軸測幾何、柔霧色調）；地圖頁不載入。系統開啟「減少動態效果」時只保留 CSS 回饋。

**一島一玩法**（共 10 種；題庫分一、二年級，每回合抽 8 題）：

| **島** | **主題** | **玩法** | **一年級** | **二年級** |
| ------ | -------- | -------- | ---------: | ---------: |
| 注音島 | 拼讀聲調；左右移動接住正確注音 | 接物 | 64 | 72 |
| 識字島 | 常用國字；翻牌配對或點選正確字卡 | 翻牌 | 51 | 51 |
| 閱讀島 | 短文大意；在岔路選正確方向 | 岔路 | 25 | 28 |
| 加減島 | 加減、位值（含併入的錢幣／形狀／長度） | 跳躍平台 | 73 | 57 |
| 時鐘島 | 認識時間；看鐘面時針分針點出時刻 | 鐘面點選 | 24 | 48 |
| 安全島 | 交通／校園／生活安全；選最安全做法 | 安全路徑 | 20 | 20 |
| 自然島 | 四季與自然觀察；選正確答案投入分類桶 | 分類桶 | 31 | 31 |
| 健康島 | 衛生習慣；依序完成洗手／刷牙步驟 | 水管排序 | 30 | 30 |
| 自理島 | 生活自理；把正確習慣裝進探險背包 | 背包 | 20 | 20 |
| 心情島 | 情緒社交；點破正確的心情氣球 | 氣球點破 | 20 | 20 |

題庫合計：**一年級 358**、**二年級 377**（時鐘島僅時間題；錢幣等已併入加減島）。
