// main.js
window.bgImage = null;

function createSVGBackground() {
    // SVG 字串（使用修改後的 SVG 內容）
    const svgString = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     viewBox="0 0 491.255 491.256">
     <defs>
    <!-- 添加漸層效果 -->
    <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2C3E50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3498DB;stop-opacity:1" />
    </linearGradient>
    <!-- 添加發光效果 -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <g filter="url(#glow)" opacity="0.8">
    <g fill="url(#mainGradient)">
      <path d="M109.041,134.176l-40.443-24.312l59.576-0.8V56.226L41.051,90.077l-17.772,30.618l58.812,25.725c0,0-71.067,0-74.734,0
        C3.672,146.419,0,207.677,0,207.677h71.049L109.041,134.176z"/>
      <polygon points="53.662,222.98 1.6,222.98 78.178,286.428 121.056,269.273"/>
      <polygon points="400.594,275.043 428.784,288.529 388.357,283.625 403.059,245.651 491.255,239.533 454.497,177.054 
        385.881,227.271 320.968,207.677 256.043,245.651 182.542,243.199 178.858,276.28 227.861,295.268 222.968,314.266 
        184.995,302.005 123.736,276.28 99.232,289.756 99.232,331.408 137.211,357.133 254.818,357.133 276.864,308.136 251.758,276.748 
        322.195,279.959 290.807,309.816 327.099,311.195 373.656,293.434 406.562,321.763 479.322,321.33 485.534,252.833 
        406.737,255.448"/>
      <path d="M219.167,379.18l66.326,69.221l36.759-17.142l-56.528-63.103C265.724,368.156,227.739,379.18,219.167,379.18z"/>
      <polygon points="275.031,356.678 311.779,389.746 394.616,371.215 394.616,323.596 288.04,323.596"/>
      <polygon points="302.904,131.963 300.148,186.845 321.003,194.617 352.847,146.834 356.502,55.77 295.244,45.879 249.3,115.183"/>
      <polygon points="356.502,168.466 356.502,201.541 390.809,201.541 452.043,150.086 390.809,85.173 373.656,101.41 376.096,143.36"/>
      <polygon points="130.013,143.36 118.832,164.799 135.057,177.054 129.855,195.417 99.232,185.018 77.792,222.98 128.173,259.127 
        165.383,244.507 179.291,201.541 193.565,207.677 193.565,221.153 269.519,216.249 281.768,181.953 281.768,144.002 
        222.968,125.587 242.568,97.737 266.459,60.05 229.233,43.515 150.232,42.855 149.297,118.546 212.552,156.222 193.565,164.799"/>
    </g>
  </g>
     
     
     </svg>`;
    
    // 創建 Blob 和 URL
    const blob = new Blob([svgString], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    
    // 載入圖片
    loadImage(url, 
        img => {
            console.log('SVG背景載入成功');
            window.bgImage = img;
            URL.revokeObjectURL(url);
        },
        event => {
            console.error('SVG背景載入失敗:', event);
            URL.revokeObjectURL(url);
        }
    );
}

function setup() {
    // 創建畫布並設置顏色模式
    cnv = createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 255);
    
    // 初始化背景
    createSVGBackground();
    
    // 初始化其他組件
    initControls();
    initSound();
    createGraph();
    
    console.log('Canvas size:', windowWidth, windowHeight);
}

function draw() {
    updateVisuals();
}

// 更新視覺效果的函數修改
function updateVisuals() {
    // 清除背景
    clear();
    
    // 計算可用空間和中心點
    let availableWidth = windowWidth - 360;  // 扣除控制面板寬度
    let centerX = availableWidth * 0.5;
    let centerY = height/2;
    
    // 繪製背景圖像
    if (window.bgImage) {
        push();
        imageMode(CENTER);
        
        // 計算縮放比例，保持圖像比例
        let imgAspect = window.bgImage.width / window.bgImage.height;
        let canvasAspect = width / height;
        let scale;
        
        if (canvasAspect > imgAspect) {
            // 使用更大的縮放係數，讓圖像更大
            scale = width / window.bgImage.width * 0.7;
        } else {
            scale = height / window.bgImage.height * 0.7;
        }
        
        // 應用縮放和繪製圖像
        let newWidth = window.bgImage.width * scale;
        let newHeight = window.bgImage.height * scale;
        
        // 移除模糊效果，使圖像更清晰
        drawingContext.filter = 'none';
        
        // 調整背景圖層的透明度
        tint(255, 220);  // 設置較高的不透明度
        image(window.bgImage, centerX, centerY, newWidth, newHeight);
        noTint();  // 重置透明度設置
        
        // 添加較淺的半透明遮罩，讓背景更明顯
        noStroke();
        fill(0, 0, 0, 150);  // 降低遮罩的不透明度
        rect(0, 0, width, height);
        pop();
    } else {
        background(20);
    }
    
    // 繪製其他視覺元素，保持它們的visibility
    // 增加邊的可見度
    let edgeAlpha = 120;  // 提高邊的不透明度
    strokeWeight(2.5);    // 增加邊的寬度
    
    for (let node of nodes) {
        node.update();
        for (let edge of node.edges) {
            stroke(0, 0, 100, edgeAlpha);
            line(node.x, node.y, edge.target.x, edge.target.y);
        }
    }
    
    // 繪製節點，確保它們在背景之上清晰可見
    for (let node of nodes) {
        let isActive = (playState === "playing") && (currentSequence[currentIndex] === node);
        node.draw(isActive);
    }
    
    // 更新粒子效果
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
    
    // 底部提示文字，使用更明顯的樣式
    noStroke();
    fill(0, 0, 100, 255);  // 使用完全不透明的白色
    textSize(18);          // 增加文字大小
    textAlign(CENTER, CENTER);
    text("點擊背景或節點生成音樂", width / 2, height - 30);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    createGraph();
}

// 使用者點擊畫布觸發新的播放序列
function mousePressed(event) {
    if (event.target !== cnv.elt) {
        return;
    }
    
    Tone.start().then(() => {
        console.log("mousePressed() executed");
        stopPlayback();
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