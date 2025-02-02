// js/main.js
// 主入口：初始化畫布、顏色模式，並調用各模組初始化函式

// 為了讓 mousePressed() 能夠判斷點擊位置，將 canvas 存入全域變數 cnv
let cnv;

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 255);
  console.log("setup() executed");
  
  // 初始化控制面板與事件綁定
  initControls();
  // 初始化 Tone.js 聲音系統
  initSound();
  // 生成初始圖形
  createGraph();
}

function draw() {
  console.log("draw() executed");
  updateVisuals();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createGraph();
}

// 使用者點擊畫布觸發新的播放序列
// 修改處：先檢查 event.target 是否為 canvas，如果不是則直接 return
function mousePressed(event) {
  // event.target 為觸發事件的 DOM 元素，若不是 canvas，則忽略此點擊
  if (event.target !== cnv.elt) {
    return;
  }
  
  Tone.start().then(() => {
    console.log("mousePressed() executed");
    // 先中斷現有播放
    stopPlayback();
    // 檢查點擊位置是否在某個節點內
    let clickedNode = null;
    for (let node of nodes) {
      let d = dist(mouseX, mouseY, node.x, node.y);
      if (d < node.currentRadius) {
        clickedNode = node;
        break;
      }
    }
    let seq;
    if (clickedNode) {
      seq = generateSequence(clickedNode);
      console.log("從節點 " + clickedNode.id + " 生成序列：", seq.map(n => n.note));
    } else {
      seq = generateSequence(rootNode);
      console.log("從根節點生成序列：", seq.map(n => n.note));
    }
    currentSequence = seq;
    currentIndex = 0;
    playState = "playing";
    playSequence(seq, 0);
  });
}