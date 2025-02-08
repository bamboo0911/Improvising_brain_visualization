// js/main.js
// 主入口：初始化畫布、顏色模式，並調用各模組初始化函式

// 將 bgImage 設為全域變數
window.bgImage = null;

// 在 setup 之前加載圖片
function preload() {
    // 添加載入成功和失敗的回調
    loadImage('./images/Brain_background.png', 
        // 成功回調
        img => {
            console.log('圖片載入成功');
            window.bgImage = img;  // 使用 window.bgImage
            console.log('設置全域 bgImage:', window.bgImage ? '成功' : '失敗');
        },
        // 失敗回調
        event => {
            console.log('圖片載入失敗:', event);
        }
    );
}

function setup() {
    cnv = createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 255);
    console.log('Canvas size:', windowWidth, windowHeight);
    console.log('Background image loaded:', window.bgImage ? 'yes' : 'no');
    
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