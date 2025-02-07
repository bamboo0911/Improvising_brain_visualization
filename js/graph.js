// js/graph.js

// 定義圖的邊 (GraphEdge) 類別，代表節點間的連結及其權重
class GraphEdge { // 定義 GraphEdge 類別
  constructor(target, weight) { // 建構子：傳入目標節點與權重
      this.target = target; // 設定目標節點
      this.weight = weight; // 設定邊的權重
  }
  update() { // 更新邊權重的方法
      this.weight += random(-0.005, 0.005); // 隨機調整權重值，介於 -0.005 與 0.005 之間
      this.weight = constrain(this.weight, 0.1, 1); // 限制權重在 0.1 至 1 的區間內
  }
}

// 定義圖的節點 (GraphNode) 類別，每個節點代表一個音符及其動畫
class GraphNode { // 定義 GraphNode 類別
  constructor(id, note, x, y) { // 建構子：初始化節點的 ID、音符及位置 (x, y)
      this.id = id; // 設定節點的唯一識別碼
      this.note = note; // 設定節點所代表的音符
      this.baseX = x; // 記錄節點的基礎 x 座標
      this.baseY = y; // 記錄節點的基礎 y 座標
      this.x = x; // 當前 x 座標（初始為基礎座標）
      this.y = y; // 當前 y 座標（初始為基礎座標）
      this.edges = []; // 初始化與此節點連接的邊集合
      this.phase = random(TWO_PI); // 隨機設定相位，用於動畫中正弦變化
      this.jitter = 20; // 定義初始抖動值，用於位置隨機偏移
      // 建立一個向量，代表初始隨機偏移量（在 -jitter 到 jitter 之間）
      this.offset = createVector(random(-this.jitter, this.jitter), random(-this.jitter, this.jitter));
      this.isRest = false; // 預設節點不是休止符
  }
  addEdge(target, weight) { // 新增邊連結到其他節點的方法
      this.edges.push(new GraphEdge(target, weight)); // 將新的 GraphEdge 實例加入邊陣列
  }
  update() { // 更新節點狀態（位置和大小）的函數
      let t = millis() / 1000; // 取得經過的時間（以秒計）
      // 利用正弦函數根據時間與相位計算當前節點半徑，範圍從 25 至 35
      this.currentRadius = map(sin(t + this.phase), -1, 1, 25, 35);
      let jitterVal = 35; // 設定抖動計算的最大值
      let nx = noise(this.baseX * 0.01, t * 0.2); // 依據 x 座標與時間產生噪聲值（x方向）
      let ny = noise(this.baseY * 0.01, t * 0.2); // 依據 y 座標與時間產生噪聲值（y方向）
      // 將噪聲值 map 到 -jitterVal 至 jitterVal 的範圍，更新水平偏移
      this.offset.x = map(nx, 0, 1, -jitterVal, jitterVal);
      // 將噪聲值 map 到 -jitterVal 至 jitterVal 的範圍，更新垂直偏移
      this.offset.y = map(ny, 0, 1, -jitterVal, jitterVal);
      this.x = this.baseX + this.offset.x; // 更新當前 x 座標，基礎位置加上偏移
      this.y = this.baseY + this.offset.y; // 更新當前 y 座標，基礎位置加上偏移
      // 遍歷所有與該節點相連接的邊，並呼叫各邊的更新函數
      for (let edge of this.edges) {
          edge.update(); // 更新邊的權重
      }
  }
  draw(isActive) { // 繪製節點，根據是否為活動節點決定填充色彩
      stroke(0); // 設定繪製邊框的顏色為黑色
      strokeWeight(2); // 設定邊框線條的粗細
      if (this.isRest) { // 檢查節點是否標記為休止符
          fill(200); // 若為休止符，使用灰色填充
      } else {
          fill(isActive ? color(255, 120, 120) : 255); // 如果為活動節點，使用淡紅色；否則使用白色
      }
      ellipse(this.x, this.y, this.currentRadius * 2, this.currentRadius * 2); // 繪製代表節點的圓形
      fill(0); // 設定文字顏色為黑色
      noStroke(); // 關閉文字描邊
      textAlign(CENTER, CENTER); // 將文字對齊設定為水平與垂直置中
      // 顯示節點中的文字：若休止符則顯示 "rest"，否則顯示音符
      text(this.isRest ? "rest" : this.note, this.x, this.y);
  }
}

// 定義粒子 (Particle) 類別，用於繪製視覺動畫效果
class Particle { // 定義 Particle 類別
  constructor(x, y, col) { // 建構子：初始化粒子位置、顏色
      this.pos = createVector(x, y); // 設定粒子的位置向量
      // 生成一個隨機方向的速度向量，並依據隨機倍數調整速度 (範圍: 1 到 3)
      this.vel = p5.Vector.random2D().mult(random(1, 3));
      this.acc = createVector(0, 0); // 初始化加速度向量為零
      this.lifespan = 255; // 設定粒子的初始壽命 (用於透明度控制)
      this.col = col; // 儲存粒子的顏色
  }
  update() { // 更新粒子位置及狀態的函數
      this.vel.add(this.acc); // 將加速度累加到速度上
      this.pos.add(this.vel); // 根據速度更新粒子的位置
      this.acc.mult(0); // 重設加速度（歸零）
      this.lifespan -= 4; // 逐步降低粒子的生命週期 (透明度)
  }
  isDead() { // 檢查粒子是否已經消失的函數
      return this.lifespan <= 0; // 當生命週期小於或等於零時，粒子被視為死亡
  }
  draw() { // 繪製粒子的函數
      noStroke(); // 不繪製邊框
      // 根據粒子的顏色及剩餘壽命設定填充色（含透明度）
      fill(red(this.col), green(this.col), blue(this.col), this.lifespan);
      ellipse(this.pos.x, this.pos.y, 8); // 繪製粒子，形狀為直徑 8 的圓形
  }
}

// 全域變數，用於儲存節點、根節點及粒子集合
window.nodes = []; // 全域陣列 nodes：儲存所有圖節點
window.rootNode = null; // 全域變數 rootNode：指向主要或第一個節點
window.particles = []; // 全域陣列 particles：儲存所有粒子，用於動畫效果

// 定義輔助函數，檢查指定位置是否與現有節點重疊
function checkOverlap(x, y, radius, existingNodes) { // 函數：檢查節點重疊
  const minDistance = radius * 2 + 20; // 設定兩節點之間的最小距離 (直徑加額外間隔20)
  for (let node of existingNodes) { // 遍歷所有現有節點
      let d = dist(x, y, node.x, node.y); // 計算新位置與現有節點之間的距離
      if (d < minDistance) { // 如果距離小於最小距離
          return true; // 則表示有重疊，回傳 true
      }
  }
  return false; // 若無重疊，回傳 false
}

// 定義函數，用於生成一個有效的位置，避免與其他節點重疊
function generateValidPosition(centerX, spread, existingNodes, radius) { // 函數：生成有效位置
  const maxAttempts = 50; // 設定最大嘗試次數為 50
  let attempts = 0; // 初始化嘗試計數

  while (attempts < maxAttempts) { // 當嘗試次數尚未達到上限
      let x = random(centerX - spread/4, centerX + spread/2); // 隨機生成 x 座標 (在中心附近)
      let y = random(height * 0.2, height * 0.8); // 隨機生成 y 座標 (畫面垂直範圍內)

      if (!checkOverlap(x, y, radius, existingNodes)) { // 如果該位置不會與現有節點重疊
          return { x, y }; // 回傳此有效位置
      }
      attempts++; // 增加嘗試次數
  }
  
  // 若在多次嘗試後仍未找到無重疊位置，則透過網格方式生成位置
  return generateGridPosition(existingNodes.length, centerX, spread);
}

// 定義函數，根據索引值通過網格方式生成位置
function generateGridPosition(index, centerX, spread) { // 函數：透過網格生成位置
  const cols = Math.ceil(Math.sqrt(index + 1)); // 根據節點數量計算列數 (向上取整)
  const rows = Math.ceil((index + 1) / cols); // 計算所需的行數

  const cellWidth = spread / cols; // 每個網格單元的寬度
  const cellHeight = (height * 0.6) / rows; // 每個網格單元的高度 (基於畫面垂直範圍)

  const col = index % cols; // 根據索引計算所在的列
  const row = Math.floor(index / cols); // 根據索引計算所在的行
  
  const x = centerX - spread/2 + cellWidth * (col + 0.5); // 計算 x 座標：網格位置加上單元寬度的一半
  const y = height * 0.2 + cellHeight * (row + 0.5); // 計算 y 座標：網格位置加上單元高度的一半
  
  return { x, y }; // 回傳網格計算後的位置物件
}

// 定義函數，用於建立整個圖形結構（包含節點與其連結）
function createGraph() { // 函數：建立圖形
  let spread = 1000; // 設定節點分佈的橫向跨度
  let count = parseInt(select("#nodeCount").value()); // 從介面取得節點數量，並轉換成整數
  let connectivity = parseFloat(select("#connectivity").value()); // 從介面取得連接機率，並轉換成浮點數
  
  // 計算可用的畫面區域
  let availableWidth = windowWidth - 360; // 扣除側邊控制區後的可用寬度
  let centerX = availableWidth * 0.4; // 計算節點分布區的中心 x 座標
  
  // 讀取音階設定，包括調性與主音
  let scale = select("#scaleSelect").value() || "major"; // 從介面取得音階設定，預設為大調
  let tonic = select("#tonicSelect").value() || "C"; // 從介面取得主音設定，預設為 C
  let tonicMidi = Tone.Frequency(tonic + "4").toMidi(); // 將主音轉換為 MIDI 數值 (以第四個八度為基準)
  
  // 定義在選定音階中的允許音程及非音階音程
  let allowedIntervals; // 允許的音程間隔
  let outOfScaleIntervals; // 非音階的音程間隔
  
  if (scale === "major") { // 如果選擇大調
      allowedIntervals = [0, 2, 4, 5, 7, 9, 11]; // 大調允許的音程間隔
      outOfScaleIntervals = [1, 3, 6, 8, 10]; // 大調下非音階間隔
  } else if (scale === "minor") { // 如果選擇小調
      allowedIntervals = [0, 2, 3, 5, 7, 8, 10]; // 小調允許的音程間隔
      outOfScaleIntervals = [1, 4, 6, 9, 11]; // 小調下非音階間隔
  } else if (scale === "chromatic") { // 如果選擇全音階
      allowedIntervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // 全音階包含所有音程間隔
      outOfScaleIntervals = []; // 非音階間隔為空
  }
  
  // 讀取其他參數，包括休止符機率和非音階機率
  let restProb = parseFloat(select("#restProb").value() || "0"); // 取得休止符出現機率
  let outOfScaleProb = parseFloat(select("#outOfScaleProb").value() || "0.1"); // 取得非音階機率
  
  const nodeRadius = 25; // 設定節點的半徑
  nodes = []; // 重置全域節點陣列
  
  // 透過迴圈建立每個節點
  for (let i = 0; i < count; i++) { // 循環 count 次以創建所有節點
      let position = generateValidPosition(centerX, spread, nodes, nodeRadius); // 取得一個不重疊的有效位置
      
      let isRest = (random(1) < restProb); // 根據機率決定此節點是否為休止符
      let note; // 宣告變數以儲存節點的音符
      
      if (isRest) { // 如果此節點為休止符
          note = "rest"; // 將音符設定為 "rest"
      } else {
          let isOutOfScale = (random(1) < outOfScaleProb); // 根據機率決定是否選擇非音階音程
          let randomInterval; // 宣告變數以儲存隨機選取的音程間隔
          
          if (isOutOfScale && outOfScaleIntervals.length > 0) { // 如果選取非音階且存在非音階間隔選項
              randomInterval = outOfScaleIntervals[floor(random(outOfScaleIntervals.length))]; // 隨機從非音階間隔中選取一個
          } else { // 否則
              randomInterval = allowedIntervals[floor(random(allowedIntervals.length))]; // 從允許的音程間隔中隨機選取一個
          }
          
          let octaveShifts = [-12, 0, 12]; // 定義可用的八度移動（降一個八度、不移動、升一個八度）
          let octaveShift = octaveShifts[floor(random(octaveShifts.length))]; // 隨機選取一個八度移動值
          let midiValue = tonicMidi + octaveShift + randomInterval; // 計算最終 MIDI 數值
          note = Tone.Frequency(midiValue, "midi").toNote(); // 將 MIDI 數值轉換為音符表示
      }
      
      let node = new GraphNode("" + (i + 1), note, position.x, position.y); // 建立新節點，傳入 ID、音符以及位置
      node.isRest = isRest; // 設定節點是否為休止符
      nodes.push(node); // 將新節點加入全域的 nodes 陣列
  }
  
  // 生成節點彼此之間的連結 (邊)
  for (let i = 0; i < nodes.length; i++) { // 遍歷所有節點 (外層迴圈)
      for (let j = i + 1; j < nodes.length; j++) { // 遍歷所有節點 (內層迴圈)，避免重複連結
          if (random(1) < connectivity) { // 根據連接機率決定是否建立連結
              let weight = random(0.3, 1); // 隨機生成連結的權重，範圍介於 0.3 到 1
              nodes[i].addEdge(nodes[j], weight); // 為節點 i 加入指向節點 j 的邊
              nodes[j].addEdge(nodes[i], weight); // 為節點 j 加入指向節點 i 的邊 (雙向連結)
          }
      }
  }
  
  rootNode = nodes[0]; // 將第一個節點設為根節點
}