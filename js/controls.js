// js/controls.js
// 負責綁定控制面板 DOM 元件事件與參數更新

function initControls() {
  let bpmSlider = select("#bpmSlider");
  let pitchSlider = select("#pitchOffset");
  // let spreadSlider = select("#nodeSpread");
  // let particleSlider = select("#particleDensity");
  // let nodeJitterSlider = select("#nodeJitter");
  let nodeCountSlider = select("#nodeCount");
  let connectivitySlider = select("#connectivity");
  
  let bpmValSpan = select("#bpmVal");
  let pitchValSpan = select("#pitchVal");
  // let spreadValSpan = select("#spreadVal");
  // let particleValSpan = select("#particleVal");
  // let jitterValSpan = select("#jitterVal");
  let countValSpan = select("#countVal");
  let connValSpan = select("#connVal");
  
  // 新增「音階」控制項
  let scaleSelect = select("#scaleSelect");
  let scaleValSpan = select("#scaleVal");
  // 新增「調性」控制項
  let tonicSelect = select("#tonicSelect");
  let tonicValSpan = select("#tonicVal");

  // 新增「非音階機率」控制項
  let outOfScaleProbSlider = select("#outOfScaleProb");
  let outOfScaleProbValSpan = select("#outOfScaleProb_val");

  // 新增「休止符機率」控制項
  let restProbSlider = select("#restProb");
  let restProbValSpan = select("#restProbVal");

  let stepwiseProbSlider = select("#stepwiseProb");
  let stepwiseProbValSpan = select("#stepwiseProb_val");
  
  let seqLengthSlider = select("#seqLength");
  let seqLengthValSpan = select("#seqLength_val");
 

    // 新增「節奏機率分布」控制項
    let prob4n = select("#prob_4n");
    let prob8n = select("#prob_8n");
    let probTriplet = select("#prob_triplet");
    let prob16n = select("#prob_16n");
    
    let prob4nVal = select("#prob_4n_val");
    let prob8nVal = select("#prob_8n_val");
    let probTripletVal = select("#prob_triplet_val");
    let prob16nVal = select("#prob_16n_val");
    
    prob4n.input(() => { 
      prob4nVal.html(prob4n.value()); 
      // 此處僅更新顯示，不調用 createGraph() 以免自動觸發播放
    });
    prob8n.input(() => { 
      prob8nVal.html(prob8n.value()); 
    });
    probTriplet.input(() => { 
      probTripletVal.html(probTriplet.value()); 
    });
    prob16n.input(() => { 
      prob16nVal.html(prob16n.value()); 
    });
  
  bpmSlider.input(() => { bpmValSpan.html(bpmSlider.value()); });
  pitchSlider.input(() => { pitchValSpan.html(pitchSlider.value()); });
   // spreadSlider.input(() => { 
   //  spreadValSpan.html(spreadSlider.value());
   //  createGraph();
   // });
  // particleSlider.input(() => { particleValSpan.html(particleSlider.value()); });
  // nodeJitterSlider.input(() => { jitterValSpan.html(nodeJitterSlider.value()); });
  nodeCountSlider.input(() => { 
    countValSpan.html(nodeCountSlider.value());
    createGraph();
  });
  connectivitySlider.input(() => {
    connValSpan.html(connectivitySlider.value());
    createGraph();
  });
  
  if (scaleSelect) {
    scaleSelect.input(() => {
      if (scaleValSpan) {
        scaleValSpan.html(scaleSelect.value());
      }
      createGraph();
    });
  }
  
  if (tonicSelect) {
    tonicSelect.input(() => {
      if (tonicValSpan) {
        tonicValSpan.html(tonicSelect.value());
      }
      createGraph();
    });
  }
  
  if (restProbSlider) {
    restProbSlider.input(() => {
      if (restProbValSpan) {
        restProbValSpan.html(restProbSlider.value());
      }
      createGraph();
    });
  }

  if (outOfScaleProbSlider) {
    outOfScaleProbSlider.input(() => {
      if (outOfScaleProbValSpan) {
        outOfScaleProbValSpan.html(outOfScaleProbSlider.value());
      }
      createGraph();
    });
  }
  
  if (stepwiseProbSlider) {
    stepwiseProbSlider.input(() => {
      if (stepwiseProbValSpan) {
        stepwiseProbValSpan.html(stepwiseProbSlider.value());
      }
      // 此處僅更新顯示，不調用 createGraph()，以免改變此參數時觸發播放
    });
  }
  
  
  let togglePanelBtn = select("#togglePanel");
  let fullScreenBtn = select("#fullScreenBtn");

  togglePanelBtn.mousePressed(() => {
    let panel = select("#controlPanel");
    if (panel.style("display") === "none") {
      panel.style("display", "block");
      togglePanelBtn.html("隱藏面板");
    } else {
      panel.style("display", "none");
      togglePanelBtn.html("顯示面板");
    }
  });

  if (seqLengthSlider) {
    seqLengthSlider.input(() => {
      if (seqLengthValSpan) {
        seqLengthValSpan.html(seqLengthSlider.value());
      }
      // 這個參數影響序列生成，因此可以呼叫 createGraph() 或等待下次點擊時生效
      // createGraph();  // 可視需求是否立即更新圖形
    });
  }

  fullScreenBtn.mousePressed(() => {
    fullscreen(!fullscreen());
  });
}