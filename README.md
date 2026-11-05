# 肺栓塞風險分層

急性肺栓塞的互動風險分層工具：同時計算 **ESC 2019** 風險等級與 **AHA/ACC 2026** 臨床分類（A–E），並依結果提示抗凝血、進階治療與劑量。另有 8 例示範病例、20 題考題（基礎 10、高階 10）與心智圖。

線上版：https://yht5582-source.github.io/pul-emboli-icu/

> ⚠️ **僅供臨床決策輔助與教學，不取代臨床判斷與 PE 團隊（PERT）討論。** 血栓溶解與抗凝血藥物請依院內規範與出血風險評估。

## 分頁

| 分頁 | 網址 | 內容 |
|---|---|---|
| 決策工具 | `#tool` | 輸入後即時分類；空白時顯示「尚未評估」，資料不足時標「暫定」 |
| 示範病例 | `#cases` | 8 例虛構病例，分類由引擎即時計算；帶入工具時不寫入床號 |
| 考題 | `#quiz` | 20 題，固定順序，答案 A–D 各 5 題，不儲存 |
| 心智圖 | `#map` | 10 個分支，可展開與收合 |

## 分類邏輯

**ESC 2019**
- 高風險：心跳停止、阻塞性休克（低血壓合併器官低灌流）、持續低血壓。
- 中高風險：PESI III–V 或 sPESI ≥1，且 RV 功能不全與 troponin 上升兩者皆有。
- 中低風險：PESI III–V 或 sPESI ≥1，但未同時有兩者；或臨床分數低但有 RV 或 troponin 異常（ESC 內文）。
- 低風險：PESI I–II 或 sPESI 0，且 RV 與 troponin 正常。

**AHA/ACC 2026（Figure 2）**
- **A**：無症狀、偶然發現。
- **B1／B2**：有症狀、低嚴重度分數；次節段／非次節段。
- **C1–C3**：嚴重度分數升高；C1 皆正常、C2 RV 或 ≥1 個生物標記異常、C3 兩者皆異常。生物標記包含 troponin 與 BNP。
- **D1**：短暫低血壓，無低灌流。
- **D2**：常血壓休克，或短暫低血壓合併低灌流。
- **E1**：反覆或持續低血壓合併心因性休克。
- **E2**：難治性休克或心跳停止。
- **-R**：C 類為 SpO₂ <90%、RR ≥30 或需要氧氣；D 類為 >6 L/min 鼻導管或非再吸入面罩；E 類為需要 NIV 或侵襲性通氣。A、B 類沒有 R。

**工具自訂的判斷**：分數低但 RV 或生物標記異常時，Figure 2 沒有明文，工具依內文「依最嚴重指標」歸入 C 類，畫面會註明。

## 進階治療（Table 7）

| 類別 | 全身溶栓 | CDL | 機械取栓 | 外科取栓 |
|---|---|---|---|---|
| A–C1 | 3-Harm A | 3-NB C-EO | 3-NB C-EO | 3-NB C-EO |
| C2 | 3-Harm B-R | 2b C-LD | 2b C-LD | 3-NB C-EO |
| C3 | 2b C-LD | 2b C-LD | 2b C-LD | 3-NB C-EO |
| D1–2 | 2b C-LD | 2b B-NR | 2b B-NR | 2b C-LD |
| E1 | 2a C-LD | 2a C-LD | 2a B-NR | 2a B-NR |
| E2 | 2a C-LD | N/A | N/A | 3-NB B-NR |

## 開發

- 單一 `index.html`，不需建置。引擎在 `/*ENGINE-START*/`，教學資料在 `/*TEACH-START*/`。
- 測試：`node tests.cjs`。

## 在地化設定

| 項目 | 位置 |
|---|---|
| 床號 | 網頁下方「床號設定」 |
| 評估項目 | `PEE` 內 `HEMO`、`HYPO`、`RESP`、`SCORE`、`RV`、`CI_ABS`、`CI_REL`、`POP` |
| 分類邏輯 | `calc()` |
| 處置建議 | `escPlan()`、`ahaPlan()`、`popNotes()` |

## 資料與隱私

- 床號資料只存在該瀏覽器的 `localStorage`，不會上傳。示範病例與考題答案不會儲存。
- 只記錄床號，請勿輸入姓名或病歷號。

## 依據

1. Konstantinides SV, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism. *Eur Heart J* 2020;41:543–603；[Eur Respir J 2019;54:1901647](https://doi.org/10.1183/13993003.01647-2019).
2. Creager MA, et al. 2026 AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/SVM/SVN Guideline for the Evaluation and Management of Acute Pulmonary Embolism in Adults. *Circulation* 2026;153(12). [doi:10.1161/CIR.0000000000001415](https://doi.org/10.1161/CIR.0000000000001415)
3. Jiménez D, et al. *Arch Intern Med* 2010;170:1383–1389；Aujesky D, et al. *Am J Respir Crit Care Med* 2005;172:1041–1046.
4. Rosenfield K, et al. HI-PEITHO. *N Engl J Med* 2026;394:1979–1990. [doi:10.1056/NEJMoa2516567](https://doi.org/10.1056/NEJMoa2516567)

## 授權

請依使用單位規定自行選擇授權方式（例如 MIT）。
