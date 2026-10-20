// 【GIF 路徑替換說明】請把 gifPath 改成相對於 index.html 的 GIF 路徑，例如 assets/animation.gif。
const gifPath = "assets/animation.gif"; // 設定可替換的動畫 GIF 路徑。
const correctOrder = ["createCanvas", "background", "fill", "ellipse", "draw", "mousePressed"]; // 設定六個步驟的正確順序。
const optionData = [ // 建立六個可拖曳選項的資料。
  { id: "createCanvas", code: "createCanvas()", description: "建立畫布，指定寬度與高度。" }, // 定義建立畫布的選項。
  { id: "background", code: "background()", description: "設定畫布的背景顏色。" }, // 定義背景顏色的選項。
  { id: "fill", code: "fill()", description: "設定圖形內部的填色色彩。" }, // 定義填色色彩的選項。
  { id: "ellipse", code: "ellipse()", description: "在畫布上繪製橢圓或圓形。" }, // 定義橢圓圖形的選項。
  { id: "draw", code: "draw()", description: "建立每一幀重複執行的動畫函式。" }, // 定義動畫迴圈的選項。
  { id: "mousePressed", code: "mousePressed()", description: "設定滑鼠或觸控按下時的事件。" } // 定義滑鼠事件的選項。
]; // 結束選項資料陣列。
let animationGif = null; // 保存 GIF 影像物件。
let gifLoaded = false; // 記錄 GIF 是否成功載入。
let gifLoadFailed = false; // 記錄 GIF 是否載入失敗。
let answerIds = []; // 保存答案區內的選項順序。
let submitted = false; // 記錄是否已經交卷。
let scoreCount = 0; // 保存答對的位置數量。
let percentage = 0; // 保存百分比成績。
let dragState = null; // 保存目前正在拖曳的卡片。
let lastTouchTime = -1000; // 保存最近一次觸控時間以避免重複事件。
let confetti = []; // 保存彩帶粒子資料。
const confettiColors = ["#ff6b6b", "#ffd166", "#06d6a0", "#4dabf7", "#c77dff", "#f72585"]; // 設定彩帶顏色。

function preload() { // 在初始化前嘗試載入 GIF。
  animationGif = loadImage(gifPath, function() { // 使用 p5.js API 載入 GIF。
    gifLoaded = true; // 載入成功時設定成功狀態。
  }, function() { // 載入失敗時執行錯誤回呼。
    gifLoadFailed = true; // 設定失敗狀態並改用文字備援。
  }); // 結束 GIF 載入呼叫。
} // 結束 preload 函式。

function setup() { // 執行 p5.js 初始化工作。
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的全螢幕畫布。
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2)); // 限制像素密度以避免手機效能負擔過大。
  textFont("sans-serif"); // 使用通用字體以支援中英文顯示。
  textAlign(LEFT, TOP); // 設定文字預設為左上對齊。
  rectMode(CORNER); // 設定矩形以左上角作為座標起點。
  imageMode(CORNER); // 設定影像以左上角作為座標起點。
  resetQuiz(); // 初始化測驗狀態。
} // 結束 setup 函式。

function draw() { // 每一幀執行主要繪圖工作。
  background("#f4f7fb"); // 清除畫面並繪製淺色背景。
  drawHeader(); // 繪製標題與操作說明。
  drawGifPanel(); // 繪製上方 GIF 或文字備援區。
  drawAnswerPanel(); // 繪製 GIF 下方的答案區。
  drawOptionPanel(); // 繪製六個可拖曳選項。
  drawControls(); // 繪製按鈕、狀態與成績資訊。
  drawDraggingCard(); // 將正在拖曳的卡片繪製在最上層。
  drawConfetti(); // 更新並繪製彩帶動畫。
} // 結束 draw 函式。

function windowResized() { // 處理瀏覽器視窗或手機方向改變。
  resizeCanvas(windowWidth, windowHeight); // 將畫布調整為最新視窗尺寸。
} // 結束 windowResized 函式。

function getLayout() { // 計算響應式介面區塊的位置與尺寸。
  const margin = Math.max(12, Math.min(width, height) * 0.025); // 依畫布短邊計算邊界距離。
  const headerH = constrain(height * 0.105, 70, 108); // 計算標題區高度。
  const gifY = headerH + margin * 0.45; // 計算 GIF 區域的垂直位置。
  const gifH = constrain(height * 0.18, 108, 188); // 計算 GIF 區域高度。
  const answerY = gifY + gifH + margin * 0.55; // 計算答案區的垂直位置。
  const answerH = constrain(height * 0.185, 118, 198); // 計算答案區高度。
  const controlH = submitted ? constrain(height * 0.155, 112, 156) : constrain(height * 0.11, 76, 108); // 計算底部控制區高度。
  const optionY = answerY + answerH + margin * 0.55; // 計算選項區的垂直位置。
  const controlY = height - controlH; // 計算底部控制區的垂直位置。
  const optionH = Math.max(92, controlY - optionY - margin * 0.45); // 計算選項區高度並保留最小空間。
  return { margin, headerH, gifY, gifH, answerY, answerH, optionY, optionH, controlY, controlH }; // 回傳版面資料。
} // 結束 getLayout 函式。

function drawHeader() { // 繪製標題與說明文字。
  const layout = getLayout(); // 取得響應式版面資料。
  fill("#17324d"); // 設定標題顏色。
  textStyle(BOLD); // 將標題設定為粗體。
  textSize(constrain(width * 0.036, 20, 32)); // 依寬度設定標題大小。
  text("p5.js 程式設計拖曳測驗", layout.margin, layout.margin * 0.55); // 顯示中文標題。
  fill("#52708b"); // 設定說明文字顏色。
  textStyle(NORMAL); // 將文字恢復為一般樣式。
  textSize(constrain(width * 0.016, 12, 16)); // 設定說明文字大小。
  text("請將六個步驟拖到 GIF 下方，並依照執行概念重新排序。", layout.margin, layout.margin * 0.55 + 38); // 顯示操作說明。
} // 結束 drawHeader 函式。

function drawGifPanel() { // 繪製動畫 GIF 區域。
  const layout = getLayout(); // 取得響應式版面資料。
  drawPanel(layout.margin, layout.gifY, width - layout.margin * 2, layout.gifH, "#ffffff"); // 繪製白色 GIF 面板。
  fill("#17324d"); // 設定區域標題顏色。
  textStyle(BOLD); // 將區域標題設定為粗體。
  textSize(constrain(width * 0.018, 14, 18)); // 設定區域標題大小。
  text("動畫示範區", layout.margin + 14, layout.gifY + 10); // 顯示 GIF 區域標題。
  const imageX = layout.margin + 12; // 計算影像區左側位置。
  const imageY = layout.gifY + 36; // 計算影像區上方位置。
  const imageW = width - layout.margin * 2 - 24; // 計算影像區寬度。
  const imageH = layout.gifH - 48; // 計算影像區高度。
  if (gifLoaded && animationGif) { // 判斷 GIF 是否已成功載入。
    drawContainedImage(animationGif, imageX, imageY, imageW, imageH); // 將 GIF 等比例置中繪製。
  } else { // GIF 尚未載入或載入失敗時顯示備援。
    fill("#edf4fa"); // 設定備援區背景顏色。
    rect(imageX, imageY, imageW, imageH, 12); // 繪製備援區圓角矩形。
    fill("#52708b"); // 設定備援文字顏色。
    textAlign(CENTER, CENTER); // 將備援文字置中。
    textSize(constrain(width * 0.018, 14, 18)); // 設定備援文字大小。
    text(gifLoadFailed ? "GIF 載入失敗，請檢查 gifPath；測驗仍可進行。" : "GIF 載入中，請稍候……", imageX + imageW / 2, imageY + imageH / 2); // 顯示友善備援訊息。
    textAlign(LEFT, TOP); // 還原文字預設對齊方式。
  } // 結束 GIF 顯示判斷。
} // 結束 drawGifPanel 函式。

function drawAnswerPanel() { // 繪製答案區與答案卡片。
  const layout = getLayout(); // 取得響應式版面資料。
  drawPanel(layout.margin, layout.answerY, width - layout.margin * 2, layout.answerH, "#ffffff"); // 繪製答案區白色面板。
  fill("#17324d"); // 設定答案區標題顏色。
  textStyle(BOLD); // 將答案區標題設定為粗體。
  textSize(constrain(width * 0.018, 14, 18)); // 設定答案區標題大小。
  text("答案區", layout.margin + 14, layout.answerY + 9); // 顯示答案區標題。
  fill(submitted ? "#a23e48" : "#52708b"); // 依交卷狀態設定提示顏色。
  textStyle(NORMAL); // 將狀態文字設定為一般樣式。
  textSize(constrain(width * 0.014, 11, 14)); // 設定狀態文字大小。
  text(submitted ? "已交卷，答案已鎖定。" : "可將卡片拖入格子，也能在答案區內重新排序。", layout.margin + 96, layout.answerY + 11); // 顯示答案區操作狀態。
  const boxes = getAnswerRects(); // 取得六個答案位置的矩形資料。
  for (let i = 0; i < boxes.length; i += 1) { // 逐一繪製答案位置。
    const hidden = dragState && dragState.from === "answer" && dragState.answerIndex === i; // 判斷目前格子是否正在拖曳。
    if (answerIds[i] && !hidden) { // 有答案且不是拖曳中的卡片時繪製答案卡。
      drawAnswerCard(getOption(answerIds[i]), boxes[i], i); // 繪製已放入的答案卡片。
    } else { // 沒有答案或卡片正在移動時繪製空白格。
      drawEmptySlot(boxes[i], i); // 繪製空白答案位置。
    } // 結束答案卡片判斷。
  } // 結束答案位置迴圈。
} // 結束 drawAnswerPanel 函式。

function drawOptionPanel() { // 繪製下方六個選項卡片。
  const layout = getLayout(); // 取得響應式版面資料。
  fill("#17324d"); // 設定選項區標題顏色。
  textStyle(BOLD); // 將選項區標題設定為粗體。
  textSize(constrain(width * 0.018, 14, 18)); // 設定選項區標題大小。
  text("可拖曳的 p5.js 步驟", layout.margin, layout.optionY - 4); // 顯示選項區標題。
  const boxes = getSourceRects(); // 取得六個來源卡片的位置。
  for (let i = 0; i < optionData.length; i += 1) { // 逐一繪製來源卡片。
    const moving = dragState && dragState.from === "source" && dragState.id === optionData[i].id; // 判斷卡片是否正在拖曳。
    if (!moving) { // 非拖曳中的卡片才繪製在原位置。
      drawSourceCard(optionData[i], boxes[i]); // 繪製選項卡片與中文說明。
    } // 結束非拖曳卡片判斷。
  } // 結束來源卡片迴圈。
} // 結束 drawOptionPanel 函式。

function drawControls() { // 繪製狀態提示與功能按鈕。
  const layout = getLayout(); // 取得響應式版面資料。
  const buttonH = constrain(layout.controlH * 0.42, 38, 48); // 計算按鈕高度。
  const buttonY = height - buttonH - layout.margin * 0.42; // 計算按鈕垂直位置。
  if (submitted) { // 交卷後才顯示總分、百分比與鼓勵文字。
    fill("#17324d"); // 設定成績文字顏色。
    textStyle(BOLD); // 將成績文字設定為粗體。
    textSize(constrain(width * 0.021, 16, 22)); // 設定成績文字大小。
    text(`總成績：${scoreCount} / ${correctOrder.length}　百分比：${percentage.toFixed(1)}%`, layout.margin, layout.controlY + 7); // 顯示總成績與百分比。
    fill(percentage > 60 ? "#16805b" : "#b06b18"); // 依是否高於百分之六十設定鼓勵文字顏色。
    textStyle(NORMAL); // 將鼓勵文字恢復為一般樣式。
    textSize(constrain(width * 0.015, 12, 15)); // 設定鼓勵文字大小。
    text(percentage > 60 ? "表現很好！彩帶正在為你慶祝！" : "再試一次吧！確認程式的建立、設定、繪圖與事件順序。", layout.margin, layout.controlY + 35); // 顯示鼓勵或慶祝訊息。
    drawButton(layout.margin, buttonY, width - layout.margin * 2, buttonH, "重新測驗", true, true); // 顯示重新測驗按鈕。
  } else { // 交卷前只顯示進度與操作按鈕。
    fill("#52708b"); // 設定進度文字顏色。
    textStyle(NORMAL); // 將進度文字設定為一般樣式。
    textSize(constrain(width * 0.015, 12, 15)); // 設定進度文字大小。
    text(`目前已放置 ${answerIds.length} / ${correctOrder.length} 個選項${answerIds.length === correctOrder.length ? "，可以交卷！" : "，請完成六個位置。"}`, layout.margin, layout.controlY + 8); // 顯示目前作答進度。
    const gap = Math.max(8, layout.margin * 0.7); // 計算按鈕間距。
    const buttonW = (width - layout.margin * 2 - gap) / 2; // 計算兩個按鈕的寬度。
    drawButton(layout.margin, buttonY, buttonW, buttonH, "清除答案", false, true); // 顯示清除答案按鈕。
    drawButton(layout.margin + buttonW + gap, buttonY, buttonW, buttonH, "交卷看成績", true, answerIds.length === correctOrder.length); // 顯示交卷按鈕並依完成度啟用。
  } // 結束交卷前後的介面判斷。
} // 結束 drawControls 函式。

function drawSourceCard(option, box) { // 繪製來源選項卡片。
  drawPanel(box.x, box.y, box.w, box.h, "#e8f2fb"); // 繪製淺藍色卡片背景。
  fill("#175b8c"); // 設定程式碼文字顏色。
  textStyle(BOLD); // 將程式碼文字設定為粗體。
  textSize(constrain(Math.min(box.w, box.h) * 0.13, 13, 20)); // 依卡片尺寸設定程式碼大小。
  text(option.code, box.x + 10, box.y + 9); // 顯示 p5.js 程式碼名稱。
  fill("#49677e"); // 設定中文說明文字顏色。
  textStyle(NORMAL); // 將說明文字設定為一般樣式。
  textSize(constrain(Math.min(box.w, box.h) * 0.085, 10, 14)); // 依卡片尺寸設定說明大小。
  text(option.description, box.x + 10, box.y + box.h * 0.48, box.w - 20, box.h * 0.42); // 顯示易懂的中文說明。
} // 結束 drawSourceCard 函式。

function drawAnswerCard(option, box, index) { // 繪製答案區卡片與交卷後結果。
  const correct = submitted && answerIds[index] === correctOrder[index]; // 判斷目前位置是否答對。
  const cardColor = submitted ? (correct ? "#dff5e9" : "#fde5e5") : "#f1f7fc"; // 依狀態決定卡片背景色。
  const accent = submitted ? (correct ? "#16805b" : "#b23a48") : "#175b8c"; // 依狀態決定強調色。
  drawPanel(box.x, box.y, box.w, box.h, cardColor); // 繪製答案卡片背景。
  fill(accent); // 設定答案卡片文字顏色。
  textStyle(BOLD); // 將答案文字設定為粗體。
  textSize(constrain(Math.min(box.w, box.h) * 0.105, 10, 15)); // 設定答案位置文字大小。
  text(`第 ${index + 1} 位 ${submitted ? (correct ? "✓" : "✕") : "↕"}`, box.x + 8, box.y + 6); // 顯示位置與交卷後的對錯符號。
  textSize(constrain(Math.min(box.w, box.h) * 0.12, 11, 18)); // 設定程式碼名稱大小。
  text(option.code, box.x + 8, box.y + box.h * 0.32); // 顯示答案中的程式碼。
  fill("#49677e"); // 設定中文說明顏色。
  textStyle(NORMAL); // 將說明文字設定為一般樣式。
  textSize(constrain(Math.min(box.w, box.h) * 0.075, 9, 12)); // 設定說明文字大小。
  text(option.description, box.x + 8, box.y + box.h * 0.58, box.w - 16, box.h * 0.30); // 顯示答案卡片說明。
  if (submitted && !correct) { // 交卷後答錯時顯示該位置正解。
    fill("#b23a48"); // 設定正解提示顏色。
    textSize(constrain(Math.min(box.w, box.h) * 0.07, 8, 11)); // 設定正解提示文字大小。
    text(`正解：${getOption(correctOrder[index]).code}`, box.x + 8, box.y + box.h - 15); // 顯示該位置的正確選項。
  } // 結束正解提示判斷。
} // 結束 drawAnswerCard 函式。

function drawEmptySlot(box, index) { // 繪製空白答案位置。
  stroke("#aac2d5"); // 設定空白格外框顏色。
  strokeWeight(1.5); // 設定空白格外框粗細。
  fill("#f8fbfd"); // 設定空白格背景色。
  rect(box.x, box.y, box.w, box.h, 10); // 繪製空白答案格。
  noStroke(); // 關閉後續繪圖的外框。
  fill("#86a0b5"); // 設定空白格提示文字顏色。
  textStyle(NORMAL); // 將提示文字設定為一般樣式。
  textSize(constrain(Math.min(box.w, box.h) * 0.1, 10, 14)); // 設定提示文字大小。
  textAlign(CENTER, CENTER); // 將提示文字置中。
  text(`第 ${index + 1} 位`, box.x + box.w / 2, box.y + box.h / 2); // 顯示答案位置編號。
  textAlign(LEFT, TOP); // 恢復文字預設對齊方式。
} // 結束 drawEmptySlot 函式。

function drawDraggingCard() { // 繪製跟隨游標或手指的拖曳卡片。
  if (!dragState) { // 沒有拖曳狀態時不繪製卡片。
    return; // 離開函式以節省效能。
  } // 結束無拖曳狀態判斷。
  const option = getOption(dragState.id); // 取得目前拖曳的選項資料。
  const box = { x: mouseX - dragState.offsetX, y: mouseY - dragState.offsetY, w: dragState.w, h: dragState.h }; // 計算拖曳卡片位置。
  drawPanel(box.x + 4, box.y + 5, box.w, box.h, "rgba(23,50,77,0.16)"); // 繪製卡片陰影。
  drawSourceCard(option, box); // 以來源卡片樣式繪製拖曳卡片。
} // 結束 drawDraggingCard 函式。

function drawPanel(x, y, panelW, panelH, panelColor) { // 繪製統一樣式的圓角面板。
  noStroke(); // 關閉面板外框。
  fill(panelColor); // 設定面板填滿顏色。
  rect(x, y, panelW, panelH, 14); // 繪製圓角面板。
} // 結束 drawPanel 函式。

function drawButton(x, y, buttonW, buttonH, label, primary, enabled) { // 繪製可啟用或停用的按鈕。
  const buttonColor = !enabled ? "#c6d2dc" : (primary ? "#176b9e" : "#dce8f0"); // 依狀態選擇按鈕背景色。
  const labelColor = !enabled ? "#7e93a3" : (primary ? "#ffffff" : "#31536d"); // 依狀態選擇按鈕文字色。
  noStroke(); // 關閉按鈕外框。
  fill(buttonColor); // 設定按鈕背景顏色。
  rect(x, y, buttonW, buttonH, 12); // 繪製圓角按鈕。
  fill(labelColor); // 設定按鈕文字顏色。
  textStyle(BOLD); // 將按鈕文字設定為粗體。
  textSize(constrain(width * 0.016, 13, 16)); // 設定按鈕文字大小。
  textAlign(CENTER, CENTER); // 將按鈕文字置中。
  text(label, x + buttonW / 2, y + buttonH / 2); // 顯示按鈕文字。
  textAlign(LEFT, TOP); // 恢復文字預設對齊方式。
} // 結束 drawButton 函式。

function drawContainedImage(imageObject, x, y, boxW, boxH) { // 將 GIF 等比例置中放入容器。
  const ratio = imageObject.width / imageObject.height; // 計算 GIF 原始寬高比。
  const boxRatio = boxW / boxH; // 計算容器寬高比。
  let drawW = boxW; // 預設使用容器寬度。
  let drawH = boxH; // 預設使用容器高度。
  if (ratio > boxRatio) { // 影像較寬時依寬度縮放。
    drawH = drawW / ratio; // 依比例計算影像高度。
  } else { // 影像較高時依高度縮放。
    drawW = drawH * ratio; // 依比例計算影像寬度。
  } // 結束影像縮放判斷。
  image(imageObject, x + (boxW - drawW) / 2, y + (boxH - drawH) / 2, drawW, drawH); // 繪製等比例置中的 GIF。
} // 結束 drawContainedImage 函式。

function getGridRects(x, y, gridW, gridH, count) { // 計算響應式網格卡片位置。
  const columns = width < 600 ? 2 : 3; // 手機使用兩欄，桌面使用三欄。
  const rows = Math.ceil(count / columns); // 計算所需列數。
  const gap = Math.max(7, Math.min(width, height) * 0.012); // 計算卡片間距。
  const cellW = (gridW - gap * (columns - 1)) / columns; // 計算卡片寬度。
  const cellH = (gridH - gap * (rows - 1)) / rows; // 計算卡片高度。
  const result = []; // 建立保存矩形資料的陣列。
  for (let i = 0; i < count; i += 1) { // 逐一計算每張卡片的位置。
    const column = i % columns; // 計算卡片所在欄位。
    const row = Math.floor(i / columns); // 計算卡片所在列位。
    result.push({ x: x + column * (cellW + gap), y: y + row * (cellH + gap), w: cellW, h: cellH }); // 加入目前卡片的矩形資料。
  } // 結束卡片位置計算迴圈。
  return result; // 回傳所有卡片矩形。
} // 結束 getGridRects 函式。

function getSourceRects() { // 取得來源選項卡片的位置。
  const layout = getLayout(); // 取得響應式版面資料。
  return getGridRects(layout.margin, layout.optionY + 24, width - layout.margin * 2, layout.optionH - 24, optionData.length); // 回傳來源卡片矩形。
} // 結束 getSourceRects 函式。

function getAnswerRects() { // 取得答案位置卡片的矩形。
  const layout = getLayout(); // 取得響應式版面資料。
  return getGridRects(layout.margin + 12, layout.answerY + 36, width - layout.margin * 2 - 24, layout.answerH - 45, correctOrder.length); // 回傳答案格矩形。
} // 結束 getAnswerRects 函式。

function getOption(id) { // 依 ID 找到選項完整資料。
  return optionData.find(function(option) { return option.id === id; }); // 回傳符合 ID 的選項物件。
} // 結束 getOption 函式。

function pointInRect(px, py, box) { // 判斷座標是否在矩形內。
  return px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h; // 回傳碰撞判斷結果。
} // 結束 pointInRect 函式。

function findSourceIndex(px, py) { // 找到指標碰到的來源卡片索引。
  const boxes = getSourceRects(); // 取得所有來源卡片矩形。
  for (let i = boxes.length - 1; i >= 0; i -= 1) { // 從後往前檢查來源卡片。
    if (pointInRect(px, py, boxes[i])) { // 判斷指標是否在目前來源卡片內。
      return i; // 回傳來源卡片索引。
    } // 結束來源卡片碰撞判斷。
  } // 結束來源卡片搜尋。
  return -1; // 沒有找到來源卡片時回傳無效索引。
} // 結束 findSourceIndex 函式。

function findAnswerIndex(px, py) { // 找到指標碰到的答案卡片索引。
  const boxes = getAnswerRects(); // 取得所有答案卡片矩形。
  for (let i = 0; i < boxes.length; i += 1) { // 逐一檢查答案卡片。
    if (answerIds[i] && pointInRect(px, py, boxes[i])) { // 只檢查目前有卡片的位置。
      return i; // 回傳答案卡片索引。
    } // 結束答案卡片碰撞判斷。
  } // 結束答案卡片搜尋。
  return -1; // 沒有找到答案卡片時回傳無效索引。
} // 結束 findAnswerIndex 函式。

function getAnswerInsertIndex(px, py) { // 依放開位置取得答案插入索引。
  const boxes = getAnswerRects(); // 取得六個答案格矩形。
  let bestIndex = 0; // 預設插入第一個位置。
  let bestDistance = Infinity; // 設定最短距離初始值。
  for (let i = 0; i < boxes.length; i += 1) { // 逐一計算指標到答案格中心的距離。
    const centerX = boxes[i].x + boxes[i].w / 2; // 計算答案格中心的水平座標。
    const centerY = boxes[i].y + boxes[i].h / 2; // 計算答案格中心的垂直座標。
    const distance = dist(px, py, centerX, centerY); // 計算指標與格子中心的距離。
    if (distance < bestDistance) { // 找到更近的格子時更新結果。
      bestDistance = distance; // 保存目前最短距離。
      bestIndex = i; // 保存目前最接近的索引。
    } // 結束最近格子判斷。
  } // 結束答案格搜尋迴圈。
  return Math.min(bestIndex, answerIds.length); // 限制插入位置不超過目前陣列長度。
} // 結束 getAnswerInsertIndex 函式。

function beginDrag(px, py) { // 開始處理來源卡片或答案卡片拖曳。
  if (submitted) { // 交卷後禁止繼續拖曳。
    return; // 直接結束拖曳開始流程。
  } // 結束交卷鎖定判斷。
  const answerIndex = findAnswerIndex(px, py); // 先檢查是否按到答案區卡片。
  if (answerIndex >= 0) { // 按到答案卡片時準備重新排序。
    const box = getAnswerRects()[answerIndex]; // 取得被按到的答案卡片矩形。
    dragState = { id: answerIds[answerIndex], from: "answer", answerIndex, offsetX: px - box.x, offsetY: py - box.y, w: box.w, h: box.h }; // 保存答案卡片拖曳狀態。
    return; // 開始答案拖曳後不再檢查來源卡片。
  } // 結束答案卡片判斷。
  const sourceIndex = findSourceIndex(px, py); // 檢查是否按到下方來源卡片。
  if (sourceIndex >= 0) { // 按到來源卡片時開始新增答案拖曳。
    const box = getSourceRects()[sourceIndex]; // 取得被按到的來源卡片矩形。
    dragState = { id: optionData[sourceIndex].id, from: "source", answerIndex: -1, offsetX: px - box.x, offsetY: py - box.y, w: box.w, h: box.h }; // 保存來源卡片拖曳狀態。
  } // 結束來源卡片判斷。
} // 結束 beginDrag 函式。

function finishDrag(px, py) { // 放開卡片時處理新增或排序。
  if (!dragState) { // 沒有拖曳卡片時不執行放置。
    return; // 直接離開函式。
  } // 結束無拖曳狀態判斷。
  const state = dragState; // 保存目前拖曳狀態。
  const layout = getLayout(); // 取得版面資料。
  const inAnswerArea = pointInRect(px, py, { x: layout.margin, y: layout.answerY, w: width - layout.margin * 2, h: layout.answerH }); // 判斷是否放在答案區。
  if (inAnswerArea && state.from === "source" && !answerIds.includes(state.id)) { // 來源卡片放入答案區且尚未重複時加入答案。
    answerIds.splice(getAnswerInsertIndex(px, py), 0, state.id); // 將來源選項插入答案陣列。
  } else if (inAnswerArea && state.from === "answer") { // 答案卡片在答案區內放開時進行排序。
    const oldIndex = answerIds.indexOf(state.id); // 找出答案卡片原本的索引。
    answerIds.splice(oldIndex, 1); // 先從原位置移除答案卡片。
    let newIndex = getAnswerInsertIndex(px, py); // 依放開位置計算新索引。
    if (oldIndex < newIndex) { newIndex -= 1; } // 修正向後移動時的索引偏移。
    answerIds.splice(constrain(newIndex, 0, answerIds.length), 0, state.id); // 將卡片插入新的排序位置。
  } // 結束新增或排序判斷。
  dragState = null; // 放開卡片後清除拖曳狀態。
} // 結束 finishDrag 函式。

function handlePress(px, py) { // 統一處理滑鼠與觸控按下。
  if (submitted) { // 交卷後只接受重新測驗按鈕。
    if (pointInRect(px, py, getRestartRect())) { resetQuiz(); } // 按下重新測驗時重置所有資料。
    return; // 交卷後不處理拖曳。
  } // 結束交卷後處理。
  if (pointInRect(px, py, getClearRect())) { answerIds = []; return; } // 按下清除答案時清空答案並結束本次操作。
  if (answerIds.length === correctOrder.length && pointInRect(px, py, getSubmitRect())) { submitQuiz(); return; } // 完成六格後按下交卷才計分。
  beginDrag(px, py); // 其他位置嘗試開始拖曳卡片。
} // 結束 handlePress 函式。

function mousePressed() { // 處理桌面滑鼠按下。
  if (millis() - lastTouchTime < 500) { return false; } // 忽略觸控後瀏覽器模擬的滑鼠事件。
  handlePress(mouseX, mouseY); // 使用 p5.js 滑鼠座標開始操作。
  return false; // 阻止瀏覽器預設行為。
} // 結束 mousePressed 函式。

function mouseReleased() { // 處理桌面滑鼠放開。
  if (millis() - lastTouchTime < 500) { return false; } // 忽略觸控後瀏覽器模擬的滑鼠事件。
  finishDrag(mouseX, mouseY); // 使用 p5.js 滑鼠座標完成放置。
  return false; // 阻止瀏覽器預設行為。
} // 結束 mouseReleased 函式。

function touchStarted() { // 處理手機觸控按下。
  lastTouchTime = millis(); // 記錄觸控時間以避免滑鼠事件重複。
  handlePress(mouseX, mouseY); // 使用 p5.js 指標座標開始操作。
  return false; // 阻止頁面捲動。
} // 結束 touchStarted 函式。

function touchMoved() { // 處理手機觸控移動。
  lastTouchTime = millis(); // 持續記錄觸控時間。
  return false; // 阻止頁面捲動以維持拖曳。
} // 結束 touchMoved 函式。

function touchEnded() { // 處理手機觸控放開。
  lastTouchTime = millis(); // 記錄觸控結束時間。
  finishDrag(mouseX, mouseY); // 使用 p5.js 指標座標完成放置。
  return false; // 阻止瀏覽器預設觸控行為。
} // 結束 touchEnded 函式。

function getButtonRect(kind) { // 計算底部按鈕的響應式矩形。
  const layout = getLayout(); // 取得版面資料。
  const buttonH = constrain(layout.controlH * 0.42, 38, 48); // 計算按鈕高度。
  const buttonY = height - buttonH - layout.margin * 0.42; // 計算按鈕垂直位置。
  const gap = Math.max(8, layout.margin * 0.7); // 計算按鈕間距。
  const halfW = (width - layout.margin * 2 - gap) / 2; // 計算左右按鈕寬度。
  if (kind === "restart") { return { x: layout.margin, y: buttonY, w: width - layout.margin * 2, h: buttonH }; } // 回傳重新測驗按鈕矩形。
  if (kind === "clear") { return { x: layout.margin, y: buttonY, w: halfW, h: buttonH }; } // 回傳清除按鈕矩形。
  return { x: layout.margin + halfW + gap, y: buttonY, w: halfW, h: buttonH }; // 回傳交卷按鈕矩形。
} // 結束 getButtonRect 函式。

function getClearRect() { // 取得清除按鈕位置。
  return getButtonRect("clear"); // 回傳清除按鈕矩形。
} // 結束 getClearRect 函式。

function getSubmitRect() { // 取得交卷按鈕位置。
  return getButtonRect("submit"); // 回傳交卷按鈕矩形。
} // 結束 getSubmitRect 函式。

function getRestartRect() { // 取得重新測驗按鈕位置。
  return getButtonRect("restart"); // 回傳重新測驗按鈕矩形。
} // 結束 getRestartRect 函式。

function submitQuiz() { // 計算分數並鎖定測驗。
  scoreCount = 0; // 交卷時計分器歸零。
  for (let i = 0; i < correctOrder.length; i += 1) { // 逐一檢查六個答案位置。
    if (answerIds[i] === correctOrder[i]) { scoreCount += 1; } // 答案與正確順序相同時增加一分。
  } // 結束計分迴圈。
  percentage = scoreCount / correctOrder.length * 100; // 將分數換算為百分比。
  submitted = true; // 設定交卷狀態以禁止後續拖曳。
  if (percentage > 60) { createConfetti(); } // 成績高於百分之六十時建立彩帶。
} // 結束 submitQuiz 函式。

function resetQuiz() { // 初始化或重新開始測驗。
  answerIds = []; // 清空答案陣列。
  submitted = false; // 解除交卷鎖定。
  scoreCount = 0; // 清除分數。
  percentage = 0; // 清除百分比。
  dragState = null; // 清除拖曳狀態。
  confetti = []; // 清除彩帶粒子。
} // 結束 resetQuiz 函式。

function createConfetti() { // 建立彩帶粒子。
  confetti = []; // 建立新彩帶前先清除舊粒子。
  const count = Math.min(110, Math.max(60, Math.floor(width / 8))); // 依畫布寬度限制彩帶數量。
  for (let i = 0; i < count; i += 1) { // 逐一建立彩帶。
    confetti.push({ x: random(width), y: random(-height * 0.35, 0), vx: random(-1.4, 1.4), vy: random(1.2, 4.2), gravity: random(0.035, 0.085), size: random(5, 11), rotation: random(TWO_PI), spin: random(-0.12, 0.12), color: random(confettiColors), life: random(240, 420) }); // 保存彩帶位置、速度、重力與旋轉資料。
  } // 結束彩帶建立迴圈。
} // 結束 createConfetti 函式。

function drawConfetti() { // 更新、繪製並清除彩帶。
  for (let i = confetti.length - 1; i >= 0; i -= 1) { // 從陣列尾端往前更新粒子。
    const piece = confetti[i]; // 取得目前彩帶粒子。
    piece.vy += piece.gravity; // 套用重力使彩帶加速下落。
    piece.x += piece.vx; // 更新彩帶水平位置。
    piece.y += piece.vy; // 更新彩帶垂直位置。
    piece.rotation += piece.spin; // 更新彩帶旋轉角度。
    piece.life -= 1; // 減少彩帶生命值。
    push(); // 保存目前繪圖狀態。
    translate(piece.x, piece.y); // 移動到彩帶位置。
    rotate(piece.rotation); // 旋轉彩帶。
    noStroke(); // 關閉彩帶外框。
    fill(piece.color); // 使用彩帶自己的顏色。
    rectMode(CENTER); // 將彩帶矩形改為中心定位。
    rect(0, 0, piece.size, piece.size * 0.55, 2); // 繪製彩帶小矩形。
    pop(); // 還原繪圖狀態。
    if (piece.y > height + 30 || piece.life <= 0) { confetti.splice(i, 1); } // 離開畫布或生命結束時自動清除。
  } // 結束彩帶更新迴圈。
} // 結束 drawConfetti 函式。
