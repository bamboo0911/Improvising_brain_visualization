// js/sound.js
// 負責 Tone.js 合成器與效果器初始化、音樂序列生成與播放控制

// 全域播放狀態與序列
window.currentSequence = [];
window.currentIndex = 0;
window.playState = "stopped";  // 可能值："playing" 或 "stopped"
window.playTimeout = null;
window.noteStartTime = 0;       // 當前音符開始播放的時間（毫秒）
window.currentNoteInterval = 0; // 當前音符的播放間隔（毫秒）

// 新增全域變數用以控制節奏分組
window.currentRhythmFactor = null;
window.rhythmGroupRemaining = 0;

function initSound() {
  // 使用 Tone.Synth 作為主合成器，改用 triangle 波形與較短的 envelope
  synth = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.002,   // 非常短的起音
      decay: 0.1,      // 快速衰減
      sustain: 0.3,    // 中等持續
      release: 0.1     // 短釋放
    }
  }).toDestination();
  
  // 建立效果器設定：縮短 Reverb 時間，減少 Delay 反饋
  const reverb = new Tone.Reverb({ decay: 2, preDelay: 0.1 }).toDestination();
  const delay = new Tone.FeedbackDelay({ delayTime: "4n", feedback: 0.2 }).toDestination();
  
  synth.connect(reverb);
}

function chooseNextNode(current) {
    // 從控制面板取得 stepwiseProb 參數（值介於 0~1）
    let stepwiseProb = 0;
    let stepwiseProbSlider = select("#stepwiseProb");
    if (stepwiseProbSlider) {
      stepwiseProb = parseFloat(stepwiseProbSlider.value());
    }
    
    // 定義平滑因子 k，用於調整 1/(diff + k) 的曲線形狀
    let k = 2;
    // 定義一個很小的 epsilon，保證每條邊的權重至少有這個基礎值
    let epsilon = 0.001;
    
    // 計算所有邊的調整後權重，並加入 epsilon
    let total = 0;
    let adjustedWeights = [];
    for (let edge of current.edges) {
      let weight = edge.weight;
      if (!current.isRest && edge.target.note !== "rest") {
        let currentPitch = Tone.Frequency(current.note, "midi").toMidi();
        let targetPitch = Tone.Frequency(edge.target.note, "midi").toMidi();
        let diff = abs(currentPitch - targetPitch);
        let factor = stepwiseProb * (1 / (diff + k)) + (1 - stepwiseProb);
        weight *= factor;
      }
      // 加上 epsilon 確保 weight 不會為 0
      weight += epsilon;
      adjustedWeights.push(weight);
      total += weight;
    }
    
    // 如果總權重仍然小於某個極低值，則直接隨機選擇一條原始邊（備援方案）
    if (total <= epsilon * current.edges.length) {
      console.warn("Total adjusted weight is extremely low. Falling back to random selection.");
      let randomEdge = random(current.edges);
      return randomEdge.target;
    }
    
    let r = random(total);
    let cumulative = 0;
    for (let i = 0; i < current.edges.length; i++) {
      cumulative += adjustedWeights[i];
      if (r <= cumulative) {
        return current.edges[i].target;
      }
    }
    // 作為最終保險：如果迴圈仍未返回，則隨機返回一條邊
    return random(current.edges).target;
  }

function generateSequence(startNode) {
  if (!startNode) {
    console.error("generateSequence: startNode is null");
    return [];
  }
  let seq = [];
  let current = startNode;
  seq.push(current);
  
  // 從控制面板讀取序列長度，若無則預設為 12
  let maxSteps = 12;
  let seqLengthSlider = select("#seqLength");
  if (seqLengthSlider) {
    maxSteps = parseInt(seqLengthSlider.value());
  }
  
  let steps = 1;
  while (current && current.edges && current.edges.length > 0 && steps < maxSteps) {
    let next = chooseNextNode(current);
    if (!next) {
      console.warn("No valid next node from node", current.id);
      break;
    }
    seq.push(next);
    current = next;
    steps++;
  }
  console.log("Generated sequence length:", seq.length);
  return seq;
}

function playSequence(seq, index = 0) {
  if (index < seq.length && playState === "playing") {
    currentSequence = seq;
    currentIndex = index;
    let bpm = parseFloat(select("#bpmSlider").value());
    let baseInterval = (60 / bpm) * 1000; // 四分音符間隔，單位毫秒

    // 如果還在節奏分組內，繼續使用當前的 rhythm factor
    let factor;
    if (window.rhythmGroupRemaining > 0 && window.currentRhythmFactor !== null) {
      factor = window.currentRhythmFactor;
      window.rhythmGroupRemaining--;
    } else {
      // 定義可選的節奏乘數：1 = 四分音符, 0.5 = 八分音符, 0.66 = 三連音, 0.25 = 十六分音符
      let rhythmFactors = [1, 0.5, 1/3, 0.25];
      factor = random(rhythmFactors);
      // 根據選定的 factor 設定群組長度（包括當前節點）
      if (factor === 1) {
        window.rhythmGroupRemaining = 0;
      } else if (factor === 0.5) {
        window.rhythmGroupRemaining = 1; // 共2個節點
      } else if (factor === 1/3) {
        window.rhythmGroupRemaining = 2; // 共3個節點
      } else if (factor === 0.25) {
        window.rhythmGroupRemaining = 3; // 共4個節點
      }
      window.currentRhythmFactor = factor;
    }
    
    let interval = baseInterval * factor;
    window.currentNoteInterval = interval;
    window.noteStartTime = millis();
    
    let node = seq[index];
    // 如果此節點不是休止符，則播放聲音與產生粒子效果；若為休止符則跳過聲音
    if (!node.isRest) {
      let offset = parseInt(select("#pitchOffset").value());
      let midi = Tone.Frequency(node.note).toMidi() + offset;
      let newNote = Tone.Frequency(midi, "midi").toNote();
      
      let scheduledTime = Tone.now() + 0.05;
      synth.triggerAttackRelease(newNote, "4n", scheduledTime);
      
      let particleDensity = 30;
      let count = floor(random(particleDensity * 0.7, particleDensity * 1.3));
      for (let i = 0; i < count; i++) {
        let col = color(map(midi, 60, 80, 0, 360), 80, 100);
        particles.push(new Particle(node.x, node.y, col));
      }
    } else {
      console.log("Encountered rest node; skipping sound.");
    }
    
    playTimeout = setTimeout(() => {
      playSequence(seq, index + 1);
    }, interval);
  } else {
    // 播放結束後重置播放狀態與節奏分組
    playState = "stopped";
    currentSequence = [];
    currentIndex = 0;
    playTimeout = null;
    window.currentRhythmFactor = null;
    window.rhythmGroupRemaining = 0;
  }
}

function stopPlayback() {
  if (playTimeout) clearTimeout(playTimeout);
  playState = "stopped";
  currentSequence = [];
  currentIndex = 0;
  playTimeout = null;
  window.currentRhythmFactor = null;
  window.rhythmGroupRemaining = 0;
}