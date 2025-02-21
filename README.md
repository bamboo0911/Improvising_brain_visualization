# Improvising Brain Visualization

<img width="1280" alt="image" src="https://github.com/user-attachments/assets/5422e70e-2168-4569-ad19-a008c0f05aad" />

</br>
</br>
</br>

<< DEMO Link >>: https://improvising-brain-visualization-git-main-bamboo0911s-projects.vercel.app/

一個基於 JavaScript 的音樂即興互動介面專案。透過 p5.js 和 Tone.js，本專案以隨機走訪的圖形結構為基礎生成音樂序列，並結合多項控制參數（如 BPM、音階、調性、休止符機率、非音階機率、步進（小跳）機率、節奏分布、序列長度等）讓使用者可以即時干預，進而引導後續節點的音高生成與和聲走向。

## 目錄

- [簡介](#簡介)
- [功能特點](#功能特點)
- [技術架構](#技術架構)
- [控制面板參數說明](#控制面板參數說明)
- [安裝與使用](#安裝與使用)
- [未來發展方向](#未來發展方向)
- [授權條款](#授權條款)

## 簡介

本專案以隨機圖走訪（Random Walk on Graph）為生成音樂序列的核心演算法，結合傳統音樂理論中的音階、調性與和弦概念，實現了一個既具有隨機性又不失音樂性結構的互動生成系統。使用者透過控制面板調整各項參數後，點擊畫布觸發生成與播放，系統會依據現有節點及其連結動態生成音樂序列，同時搭配視覺化的節點、邊與粒子效果，形成聲音與視覺互動的多感官體驗。

## 功能特點

- **隨機生成的圖形結構**  
  使用隨機走訪演算法，在節點間進行連結與選擇，形成一個動態的圖形網絡。每個節點代表一個音符（或休止符），而節點之間的邊根據連結密度及權重調整確定走訪路徑。

- **多參數控制**  
  使用者可調整包括 BPM、音高偏移、節點數量、連結密度、序列長度、音階（Major/Minor/Chromatic）、調性（主音選擇）、休止符機率、非音階機率，以及步進機率（小跳／大跳傾向）和節奏機率分布等參數，進而影響生成序列的特性。

- **和弦與音高生成擴展**  
  根據調性與音階的設定，節點音高的生成既可以屬於所選音階，也可根據設定以較低的機率生成非音階音符，進而豐富音樂表現。未來可進一步擴充生成和弦及和弦進行的功能。

- **節奏分組與動態演奏**  
  在播放序列時，系統根據 BPM 與節奏乘數（例如四分、八分、三連、十六分音符）來控制音符的播放間隔；並透過節奏分組機制使連續音符採用相同節奏值，進一步塑造出音樂中的節奏感。

- **互動視覺呈現**  
  使用 p5.js 呈現節點與邊的動態動畫，同時加入粒子效果（預設粒子密度固定為 20），讓音樂生成的過程具有視覺化反饋，增強互動體驗。

- **實時和弦引導（未來擴展）**  
  未來計劃增加一個控制面板，在生成序列過程中可實時選擇和弦，讓後續節點的生成傾向於使用所選和弦內的音符，從而實現和弦進行的引導功能。

## 技術架構

本專案主要由以下幾個模組組成，每個模組皆遵循封裝、高內聚、低耦合的原則：

- **js/graph.js**  
  定義圖形資料結構（GraphNode、GraphEdge、Particle），並根據控制參數生成節點及其連結。生成的節點音高根據調性、音階以及隨機八度移位、非音階機率等多重因素決定。

- **js/visuals.js**  
  負責畫面更新與動畫呈現，包括背景漸層、節點位置更新、邊連結繪製及粒子效果等。

- **js/sound.js**  
  負責 Tone.js 合成器與效果器的初始化，以及根據隨機走訪與節奏分組生成音樂序列。包含播放音符、休止符處理及調整節奏（小跳／大跳）權重等邏輯。

- **js/controls.js**  
  負責控制面板的 DOM 元件綁定與參數更新，當使用者調整參數時（例如 BPM、節奏、調性、音階、休止符機率、非音階機率、步進機率、序列長度等）更新相應顯示並在必要時重新生成圖形，但不自動觸發播放。

- **js/main.js**  
  作為主入口，負責初始化 p5.js 的畫布與色彩模式，調用上述各模組的初始化函式，並在使用者點擊畫布時觸發音樂序列生成與播放。

## 控制面板參數說明

- **BPM**：控制播放速度。
- **音高偏移**：用於調整生成的每個音符在原始音高基礎上的移動量（以半音計）。
- **節點數量**：圖形中節點（音符）的總數。
- **連結密度**：控制圖形中節點之間生成連結的機率，影響隨機走訪路徑。
- **序列長度**：生成音樂序列時的最大步數。
- **音階**：選擇 Major、Minor 或 Chromatic 音階，決定允許的音程間隔。
- **調性**：選擇主音（例如 C、D、E...），作為生成節點音高的基準。
- **非音階機率**：決定生成的節點中有多少比例的音符不屬於所選音階，增加變化性。
- **步進可能性**：控制生成序列時，是否傾向於選擇音高差距較小（小跳）的節點，範圍 0~1；1 表示完全小跳、0 表示完全隨機（大跳可能性更高）。
- **休止符機率**：控制生成的節點中休止符（不發出聲音的節點）出現的比例。
- **節奏機率分布**：四個滑桿用於設定不同節奏符值（四分、八分、三連、十六分音符）的權重，進而影響每個音符的播放間隔。

## 安裝與使用

1. **依賴環境**  
   - 本專案使用 [p5.js](https://p5js.org/) 和 [Tone.js](https://tonejs.github.io/)，均從 CDN 載入。  
   - 建議使用本地伺服器（例如 VS Code 的 Live Server 或 Python 的 http.server）來啟動專案，避免跨域問題。

2. **檔案結構**  
   專案目錄結構如下：

```
SonicFlowOfElements/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── graph.js
    ├── visuals.js
    ├── sound.js
    ├── controls.js
    └── main.js
```
3. **啟動專案**  
- 使用本地伺服器打開 index.html。  
- 在控制面板中調整各項參數，然後點擊畫布（或節點）以觸發音樂序列生成與播放。

## 未來發展方向

- **和弦進行引導模式**：允許使用者在播放序列過程中實時選擇和弦，從而引導後續節點以和弦內音符為主進行生成。  
- **擴充視覺互動**：例如加入 3D 或 VR 模式，讓使用者能夠從多角度觀察與操控生成式音樂網絡。  
- **進階生成算法**：加入更多生成模型（例如 Markov Chain、神經網絡）來提高序列生成的多樣性與創新性。  
- **多感官互動**：結合觸覺反饋或其他感官輸出，增強作品的沉浸感。

## 授權條款

本專案採用 [MIT License](LICENSE)。歡迎自由使用、修改與分發，但請保留原作者資訊與授權條款。

---

這份 README.md 詳細介紹了專案的背景、功能、技術架構與使用方式，適合作為 GitHub 上的項目介紹。你可以根據實際情況進一步調整內容與格式，讓讀者更容易理解你這個生成式音樂與視覺互動系統的核心概念與設計理念。
