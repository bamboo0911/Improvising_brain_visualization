// js/visuals.js
// 負責畫面更新與動畫繪製（背景、節點、邊與粒子效果）

// js/visuals.js

function updateVisuals() {
    // 清除背景
    clear();
    
    // 水平中心點計算（與粒子系統一致）
    let availableWidth = windowWidth - 360; // 扣除控制面板寬度
    let centerX = availableWidth * 0.5;     // 使用可用寬度的 40%
    
    // 垂直偏移計算
    let verticalOffset = 100; // 負值向上移動，正值向下移動，可以調整這個值
    let centerY = height/2 + verticalOffset;
    
    // 檢查全域的 bgImage
    if (window.bgImage) {
        push();
        imageMode(CENTER);
        
        // 計算縮放比例
        let imgWidth = window.bgImage.width;
        let imgHeight = window.bgImage.height;
        let scale = max(width / imgWidth, height / imgHeight);
        let newWidth = imgWidth * scale;
        let newHeight = imgHeight * scale;
        
        // 使用更新後的中心點繪製圖片
        image(window.bgImage, centerX, centerY, newWidth, newHeight);
        
        // 添加半透明遮罩
        noStroke();
        fill(0, 0, 0, 200);
        rect(0, 0, width, height);
        pop();
        
        // 除錯資訊（可以註解掉）
        console.log('Background position:', {
            centerX,
            centerY,
            verticalOffset,
            scale,
            newSize: `${newWidth}x${newHeight}`
        });
    } else {
        background(20);
    }
    
    // 更新背景：使用噪聲與漸層混合
    let bgHue = map(noise(frameCount * 0.005), 0, 1, 180, 240);
    fill(bgHue, 30, 15, 100);
    rect(0, 0, width, height);
    
    // 更新每個節點位置
    for (let node of nodes) {
        node.update();
    }
    
    // 繪製所有邊
    let edgeAlpha = 80;
    strokeWeight(2);
    for (let node of nodes) {
        for (let edge of node.edges) {
            stroke(0, 0, 100, edgeAlpha);
            line(node.x, node.y, edge.target.x, edge.target.y);
        }
    }
    
    // 繪製所有節點
    for (let node of nodes) {
        let isActive = (playState === "playing") && (currentSequence[currentIndex] === node);
        node.draw(isActive);
    }
    
    // 更新並繪製粒子效果
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
    
    // 底部提示文字
    noStroke();
    fill(0, 0, 100);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("點擊背景或節點生成音樂", width / 2, height - 30);
}