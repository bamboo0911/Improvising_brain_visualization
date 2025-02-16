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

function getNextRhythmFactor() {
  // 獲取所有節奏機率值
  const prob4n = parseFloat(select("#prob_4n").value());
  const prob8n = parseFloat(select("#prob_8n").value());
  const probTriplet = parseFloat(select("#prob_triplet").value());
  const prob16n = parseFloat(select("#prob_16n").value());

  // 計算總權重
  const totalWeight = prob4n + prob8n + probTriplet + prob16n;
  
  // 如果所有權重都是0，默認使用四分音符
  if (totalWeight === 0) {
    return 1;
  }

  // 生成隨機值
  const random = Math.random() * totalWeight;
  
  // 根據權重選擇節奏
  let accumWeight = 0;
  
  // 四分音符 (1)
  accumWeight += prob4n;
  if (random < accumWeight) {
    return 1;
  }
  
  // 八分音符 (0.5)
  accumWeight += prob8n;
  if (random < accumWeight) {
    return 0.5;
  }
  
  // 三連音 (1/3)
  accumWeight += probTriplet;
  if (random < accumWeight) {
    return 1/3;
  }
  
  // 十六分音符 (0.25)
  return 0.25;
}

function playSequence(seq, index = 0) {
  if (index >= seq.length) {
    // 序列結束，清理所有狀態
    stopPlayback();
    return;
  }

  if (playState === "playing") {
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
      // 使用新的節奏選擇邏輯
      factor = getNextRhythmFactor();
      
      // 設定群組長度
      if (factor === 1) {
        window.rhythmGroupRemaining = 0;  // 四分音符不需要分組
      } else if (factor === 0.5) {
        window.rhythmGroupRemaining = 1;  // 八分音符成對
      } else if (factor === 1/3) {
        window.rhythmGroupRemaining = 2;  // 三連音分三個
      } else if (factor === 0.25) {
        window.rhythmGroupRemaining = 3;  // 十六分音符分四個
      }
      window.currentRhythmFactor = factor;
    }
    
    let interval = baseInterval * factor;
    window.currentNoteInterval = interval;
    window.noteStartTime = millis();
    
    let node = seq[index];
    // 如果此節點不是休止符，則播放聲音與產生粒子效果
    if (!node.isRest) {
      let offset = parseInt(select("#pitchOffset").value());
      let midi = Tone.Frequency(node.note).toMidi() + offset;
      let newNote = Tone.Frequency(midi, "midi").toNote();
      
      let scheduledTime = Tone.now() + 0.05;
      // 設定音符持續時間為間隔的 80%，確保音符不會重疊
      let noteDuration = interval * 0.8;
      synth.triggerAttackRelease(newNote, noteDuration + "ms", scheduledTime);
      
      // 根據當前節奏調整粒子效果
      let particleDensity = 30 * (1 / factor);
      let count = floor(random(particleDensity * 0.7, particleDensity * 1.3));
      for (let i = 0; i < count; i++) {
        let col = color(map(midi, 60, 80, 0, 360), 80, 100);
        particles.push(new Particle(node.x, node.y, col));
      }
    }
    
    // 設置播放下一個音符的計時器
    playTimeout = setTimeout(() => {
      playSequence(seq, index + 1);
    }, interval);
  }
}

function stopPlayback() {
  // 立即停止當前正在播放的音符
  if (synth) {
    synth.triggerRelease();
  }
  
  // 清除計時器
  if (playTimeout) {
    clearTimeout(playTimeout);
    playTimeout = null;
  }
  
  // 重置所有播放狀態
  playState = "stopped";
  currentSequence = [];
  currentIndex = 0;
  window.currentRhythmFactor = null;
  window.rhythmGroupRemaining = 0;
  
  console.log('Playback stopped');
}