# 肺栓塞風險分層

急性肺栓塞的互動風險分層工具：同時計算 **ESC 2019** 風險等級與 **AHA/ACC 2026** 臨床分類（A–E），並依結果提示抗凝血、全身性血栓溶解、導管治療或外科取栓，附依體重計算的劑量。

線上版：https://yht5582-source.github.io/pul-emboli-icu/

> ⚠️ **僅供臨床決策輔助與教學，不取代臨床判斷與 PE 團隊（PERT）討論。** 血栓溶解與抗凝血藥物請依院內規範與出血風險評估。

## 流程

| 步驟 | 內容 |
|---|---|
| 1. 血行動力學 | 穩定、短暫低血壓、持續低血壓或休克、難治性休克、心跳停止；器官低灌流（乳酸 >2、AKI、意識改變等）；呼吸修飾 R |
| 2. 臨床嚴重度 | sPESI（6 項，年齡自動判斷）或 PESI（依年齡加權，自動分級 I–V）；無症狀偶然發現 |
| 3. RV 功能與生物標記 | RV/LV 比、TAPSE、McConnell／60/60 sign、心室中隔變平、RV 基底直徑；troponin、BNP；栓塞位置 |
| 4. 溶栓禁忌 | ESC 2019 絕對與相對禁忌 |

## 分類邏輯

**ESC 2019**
- 高風險：心跳停止、阻塞性休克（低血壓合併器官低灌流）、持續低血壓。
- 中高風險：PESI III–V 或 sPESI ≥1，且 RV 功能不全與 troponin 上升兩者皆有。
- 中低風險：PESI III–V 或 sPESI ≥1，但未同時有兩者；或臨床分數低但有 RV 或 troponin 異常。
- 低風險：PESI I–II 或 sPESI 0，且 RV 與 troponin 正常。

**AHA/ACC 2026**
- **A**：無症狀、偶然發現。
- **B**：有症狀、低嚴重度（B1 次節段、B2 節段以上）。
- **C1–C3**：嚴重度分數升高；C1 RV 與 troponin 正常、C2 其中一項異常、C3 兩項皆異常。
- **D1**：短暫低血壓、輸液有反應、無低灌流。
- **D2**：血壓正常或短暫低血壓但有低灌流。
- **E1**：持續低血壓合併心因性休克。
- **E2**：難治性休克或心跳停止。
- **-R**：呼吸修飾，B–D 類為氧氣 >6 L/min、非再吸入面罩或 RR >25；E 類為需要 NIV 或插管。

## 處置提示重點

- **抗凝血**：DOAC 優於 VKA；需注射時 LMWH 優於 UFH；預期進階治療或腎功能嚴重不全時用 UFH。
- **全身性血栓溶解**：
  - ESC：高風險建議使用；中高風險不建議常規使用，惡化時才做救援性溶栓。
  - AHA/ACC：A–C2 類有害、不建議；C3、D 類可考慮；E1 類合理。
- **導管治療、機械取栓、外科取栓**：溶栓禁忌或失敗時使用；AHA/ACC E2 類不建議外科取栓，VA-ECMO 合理。
- **PERT**：AHA/ACC 建議 C–E 類啟動（Class 1）。

## 劑量

- **UFH**：80 U/kg 負荷，之後 18 U/kg/h。
- **Enoxaparin**：1 mg/kg q12h（CrCl <30 需調整）。
- **Fondaparinux**：依體重 5、7.5 或 10 mg qd。
- **DOAC**：apixaban、rivaroxaban、dabigatran、edoxaban 的起始方案。
- **Alteplase**：標準 100 mg 輸注 2 小時；加速方案 0.6 mg/kg（上限 50 mg）15 分鐘。

## 使用方式

直接用瀏覽器開啟 `index.html` 即可，不需安裝或建置。

## 在地化設定

| 項目 | 位置 |
|---|---|
| 床號 | 網頁下方「床號設定」 |
| 評估項目 | `<script>` 內 `HEMO`、`HYPO`、`RESP`、`SPESI`、`PESI`、`RV`、`CI_ABS`、`CI_REL` |
| 分類邏輯 | `calc()` |
| 處置建議 | `escPlan()`、`ahaPlan()` |

## 資料與隱私

- 所有資料只存在該瀏覽器的 `localStorage`，不會上傳。
- 只記錄床號，請勿輸入姓名或病歷號。

## 依據

1. Konstantinides SV, Meyer G, Becattini C, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism. *Eur Heart J* 2020;41:543–603.
2. 2026 AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/SVM/SVN Guideline for the Evaluation and Management of Acute Pulmonary Embolism in Adults. *Circulation* 2026. [doi:10.1161/CIR.0000000000001415](https://doi.org/10.1161/CIR.0000000000001415)；*J Am Coll Cardiol* 2026. [doi:10.1016/j.jacc.2025.11.005](https://doi.org/10.1016/j.jacc.2025.11.005)
3. Jiménez D, et al. Simplification of the pulmonary embolism severity index. *Arch Intern Med* 2010;170:1383–1389；Aujesky D, et al. *Am J Respir Crit Care Med* 2005;172:1041–1046.

## 授權

請依使用單位規定自行選擇授權方式（例如 MIT）。
