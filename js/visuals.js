// js/visuals.js
// 負責畫面更新與動畫繪製（背景、節點、邊與粒子效果）

function updateVisuals() {
    // 更新背景：使用噪聲與漸層混合
    // 使用噪聲函數和map函數將時間轉換為背景顏色的色相
    let bgHue = map(noise(frameCount * 0.005), 0, 1, 180, 240);
    // 設定背景顏色，色相為bgHue，飽和度為30，亮度為15
    background(bgHue, 30, 15);
    // 使用map函數將鼠標的水平位置轉換為飽和度
    let sat = map(mouseX, 0, width, 20, 80);
    // 使用map函數將鼠標的垂直位置轉換為亮度
    let bri = map(mouseY, 0, height, 10, 60);
    // 設定填充顏色，色相為bgHue，飽和度為sat，亮度為bri，透明度為50
    fill(bgHue, sat, bri, 50);
    // 使用rect函數繪製一個填充顏色的矩形，覆蓋整個畫布
    rect(0, 0, width, height);
    
    // 更新每個節點位置
    for (let node of nodes) {
      node.update();
    }
    
    // 繪製所有邊，根據控制面板透明度設定
    let edgeAlpha = 80
    strokeWeight(2);
    for (let node of nodes) {
      for (let edge of node.edges) {
        stroke(0, 0, 100, edgeAlpha);
        line(node.x, node.y, edge.target.x, edge.target.y);
      }
    }
    
    // 繪製所有節點，若播放中則以發光效果呈現
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
    text("點擊背景或節點生成音樂路徑", width / 2, height - 30);
  }