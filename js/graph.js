// js/graph.js
// 定義圖形資料結構：GraphEdge、GraphNode、Particle
// 以及隨機生成圖形的功能

class GraphEdge {
  constructor(target, weight) {
    this.target = target;
    this.weight = weight;
  }
  update() {
    // 讓邊的權重隨時間微調
    this.weight += random(-0.005, 0.005);
    this.weight = constrain(this.weight, 0.1, 1);
  }
}

class GraphNode {
  constructor(id, note, x, y) {
    this.id = id;             // 節點編號
    this.note = note;         // 音符（例如 "C4" 或 "rest"）
    this.baseX = x;           // 固定基礎位置
    this.baseY = y;
    this.x = x;               // 當前位置
    this.y = y;
    this.edges = [];          // 與其他節點的連結（GraphEdge 物件）
    this.phase = random(TWO_PI);  // 用於計算呼吸動畫的相位
    this.jitter = 20;         // 初始抖動強度
    this.offset = createVector(random(-this.jitter, this.jitter), random(-this.jitter, this.jitter));
    this.isRest = false;      // 預設不是休止符
  }
  addEdge(target, weight) {
    this.edges.push(new GraphEdge(target, weight));
  }
  update() {
    let t = millis() / 1000;
    // 呼吸效果：節點半徑在 25~35 之間變化
    this.currentRadius = map(sin(t + this.phase), -1, 1, 25, 35);
    // 根據控制面板 "#nodeJitter" 的值更新抖動
    let jitterVal = 35;
    let nx = noise(this.baseX * 0.01, t * 0.2);
    let ny = noise(this.baseY * 0.01, t * 0.2);
    this.offset.x = map(nx, 0, 1, -jitterVal, jitterVal);
    this.offset.y = map(ny, 0, 1, -jitterVal, jitterVal);
    this.x = this.baseX + this.offset.x;
    this.y = this.baseY + this.offset.y;
    // 更新所有連結邊
    for (let edge of this.edges) {
      edge.update();
    }
  }
  draw(isActive) {
    stroke(0);
    strokeWeight(2);
    // 若是休止符，則以灰色顯示（也可以自行修改顏色）
    if (this.isRest) {
      fill(200);
    } else {
      fill(isActive ? color(255, 120, 120) : 255);
    }
    ellipse(this.x, this.y, this.currentRadius * 2, this.currentRadius * 2);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    // 如果是休止符，顯示 "rest"，否則顯示音符
    text(this.isRest ? "rest" : this.note, this.x, this.y);
  }
}

class Particle {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.acc = createVector(0, 0);
    this.lifespan = 255;
    this.col = col;
  }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifespan -= 4;
  }
  isDead() {
    return this.lifespan <= 0;
  }
  draw() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.lifespan);
    ellipse(this.pos.x, this.pos.y, 8);
  }
}

// 全域變數（供其他模組使用）
window.nodes = [];
window.rootNode = null;
window.particles = [];

// 隨機生成圖形的函式
function createGraph() {
  let spread = 520; // 固定節點散佈範圍為 520
  let count = parseInt(select("#nodeCount").value());
  let connectivity = parseFloat(select("#connectivity").value());
  
  // 讀取音階控制項，預設為 "major"
  let scale = "major";
  let scaleSelect = select("#scaleSelect");
  if (scaleSelect) {
    scale = scaleSelect.value();
  }
  
  // 讀取調性控制項，預設為 "C"
  let tonic = "C";
  let tonicSelect = select("#tonicSelect");
  if (tonicSelect) {
    tonic = tonicSelect.value();
  }
  // 將主音轉換為 MIDI 數值，例如 "C4" 的 MIDI 值約為 60
  let tonicMidi = Tone.Frequency(tonic + "4").toMidi();
  
  // 根據所選音階，定義允許的音程間隔（屬於音階內的間隔）
  let allowedIntervals;
  if (scale === "major") {
    allowedIntervals = [0, 2, 4, 5, 7, 9, 11];
  } else if (scale === "minor") {
    allowedIntervals = [0, 2, 3, 5, 7, 8, 10];
  } else if (scale === "chromatic") {
    allowedIntervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  } else {
    allowedIntervals = [0, 2, 4, 5, 7, 9, 11]; // 預設 major
  }
  
  // 定義非音階的音程間隔
  let outOfScaleIntervals;
  if (scale === "major") {
    outOfScaleIntervals = [1, 3, 6, 8, 10];
  } else if (scale === "minor") {
    // 可自行調整，這裡僅作示例
    outOfScaleIntervals = [1, 4, 6, 11];
  } else if (scale === "chromatic") {
    // 若使用 chromatic，所有音都屬於音階，所以沒有非音階
    outOfScaleIntervals = [];
  } else {
    let allIntervals = [0,1,2,3,4,5,6,7,8,9,10,11];
    outOfScaleIntervals = allIntervals.filter(i => !allowedIntervals.includes(i));
  }
  
  // 讀取休止符機率，若無控制項則預設為 0
  let restProb = 0;
  let restProbElement = select("#restProb");
  if (restProbElement) {
    restProb = parseFloat(restProbElement.value());
  }
  
  // 讀取非音階機率控制項，若無則預設為 0.1（10%）
  let outOfScaleProb = 0.1;
  let outOfScaleElement = select("#outOfScaleProb");
  if (outOfScaleElement) {
    outOfScaleProb = parseFloat(outOfScaleElement.value());
  }
  
  nodes = [];
  for (let i = 0; i < count; i++) {
    let x = random(width / 2 - spread, width / 2 + spread);
    let y = random(height * 0.1, height * 0.9);
    
    // 判斷是否產生休止符
    let isRest = (random(1) < restProb);
    let note;
    if (isRest) {
      note = "rest";
    } else {
      // 決定是否產生非音階的音：若隨機數小於 outOfScaleProb，則從非音階間隔中選取
      let isOutOfScale = (random(1) < outOfScaleProb);
      let randomInterval;
      if (isOutOfScale && outOfScaleIntervals.length > 0) {
        randomInterval = outOfScaleIntervals[floor(random(outOfScaleIntervals.length))];
      } else {
        randomInterval = allowedIntervals[floor(random(allowedIntervals.length))];
      }
      // 新增隨機的八度移位：從 -12（下移一個八度）、0（原位）、+12（上移一個八度）中隨機選取
      let octaveShifts = [-12, 0, 12];
      let octaveShift = octaveShifts[floor(random(octaveShifts.length))];
      
      let midiValue = tonicMidi + octaveShift + randomInterval;
      note = Tone.Frequency(midiValue, "midi").toNote();
    }
    
    let node = new GraphNode("" + (i + 1), note, x, y);
    node.isRest = isRest;
    nodes.push(node);
  }
  
  // 為每對節點根據連結密度生成連結
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (random(1) < connectivity) {
        let weight = random(0.3, 1);
        nodes[i].addEdge(nodes[j], weight);
        nodes[j].addEdge(nodes[i], weight);
      }
    }
  }
  
  rootNode = nodes[0];
}