// 宣告氣球陣列，用來儲存畫布中的所有氣球。
let balloons = [];

// 宣告爆破粒子陣列，用來儲存爆破後的粒子。
let burstParticles = [];

// 宣告背景音樂物件。
let backgroundMusic;

// 宣告氣球爆破音效物件。
let popSound;

// 設定音效開關的水平位置。
let soundButtonX;

// 設定音效開關的垂直位置。
let soundButtonY;

// 設定音效開關直徑為50。
const soundButtonDiameter = 50;

// 設定音效開關半徑為25。
const soundButtonRadius = soundButtonDiameter / 2;

// 設定音效開啟時的紅色。
const soundOnColor = "#ff0000";

// 設定音效關閉時的綠色。
const soundOffColor = "#00a000";

// 設定音效目前是否開啟。
let soundEnabled = false;

// 設定畫布中同時存在的氣球數量。
const balloonCount = 30;

// 設定畫布背景顏色。
const backgroundColor = "#0353a4";

// 建立氣球顏色清單。
const balloonColors = [
  // 設定第一種氣球顏色。
  "#590d22",
  // 設定第二種氣球顏色。
  "#800f2f",
  // 設定第三種氣球顏色。
  "#a4133c",
  // 設定第四種氣球顏色。
  "#c9184a",
  // 設定第五種氣球顏色。
  "#ff4d6d",
  // 設定第六種氣球顏色。
  "#ff758f",
  // 設定第七種氣球顏色。
  "#ff8fa3",
  // 設定第八種氣球顏色。
  "#ffb3c1",
  // 設定第九種氣球顏色。
  "#ffccd5",
  // 設定第十種氣球顏色。
  "#fff0f3"
];

// 設定一般爆破間隔為1.5秒。
const normalBurstInterval = 1500;

// 設定最快爆破間隔為0.8秒。
const fastestBurstInterval = 800;

// 設定爆破加速階段時間為10秒。
const accelerationDuration = 10000;

// 設定完整爆破循環時間為20秒。
const burstCycleDuration = 20000;

// 記錄上一次爆破的時間。
let lastBurstTime = 0;

// 記錄目前爆破間隔。
let currentBurstInterval = normalBurstInterval;

// 記錄動畫開始的時間。
let animationStartTime = 0;

// 預先載入背景音樂與爆破音效。
function preload() {
  // 載入背景音樂檔案。
  backgroundMusic = loadSound("mixkit-game-level-music-689.mp3");

  // 載入氣球爆破音效檔案。
  popSound = loadSound("balloon-pop-36589.mp3");
}

// p5.js 啟動時只執行一次。
function setup() {
  // 建立符合瀏覽器視窗大小的全螢幕畫布。
  createCanvas(windowWidth, windowHeight);

  // 設定橢圓以中心點作為定位基準。
  ellipseMode(CENTER);

  // 關閉圖形外框線。
  noStroke();

  // 設定音效開關位於畫面右上方。
  soundButtonX = width - 40;

  // 設定音效開關的垂直位置。
  soundButtonY = 55;

  // 記錄動畫開始時間。
  animationStartTime = millis();

  // 記錄爆破計時開始時間。
  lastBurstTime = millis();

  // 建立30個氣球。
  for (let i = 0; i < balloonCount; i++) {
    // 將氣球隨機放置在畫布下方或畫布外。
    balloons.push(createBalloon(random(height, height * 2)));
  }
}

// p5.js 每一幀執行一次。
function draw() {
  // 使用指定藍色清除畫布。
  background(backgroundColor);

  // 繪製音效開關。
  drawSoundButton();

  // 計算動畫經過時間。
  const elapsedTime = millis() - animationStartTime;

  // 根據時間更新爆破速度。
  updateBurstInterval(elapsedTime);

  // 判斷是否到達下一次爆破時間。
  if (millis() - lastBurstTime >= currentBurstInterval) {
    // 爆破一個氣球。
    burstOneBalloon();

    // 記錄此次爆破的時間。
    lastBurstTime = millis();

    // 讓下一次爆破間隔產生些微變化。
    currentBurstInterval *= random(0.9, 1.1);

    // 確保爆破間隔不低於最快值。
    currentBurstInterval = max(
      currentBurstInterval,
      fastestBurstInterval
    );
  }

  // 逐一處理所有氣球。
  for (let i = 0; i < balloons.length; i++) {
    // 取得目前的氣球。
    const balloon = balloons[i];

    // 更新氣球位置。
    updateBalloon(balloon);

    // 判斷氣球尚未爆破。
    if (!balloon.bursting) {
      // 繪製氣球及其裝飾。
      drawBalloon(balloon);
    }

    // 計算繩子底端的位置。
    const stringBottomY =
      balloon.y +
      balloon.height / 2 +
      balloon.knotHeight +
      balloon.stringLength;

    // 判斷繩子底端是否碰到畫布最上方。
    if (stringBottomY <= 0 && !balloon.bursting) {
      // 將氣球重新放到畫布下方。
      resetBalloon(balloon);
    }
  }

  // 更新爆破粒子。
  updateBurstParticles();

  // 更新爆破中的氣球。
  updateBurstingBalloons();
}

// 繪製音效開關與英文狀態文字。
function drawSoundButton() {
  // 設定文字水平置中。
  textAlign(CENTER, CENTER);

  // 設定文字大小。
  textSize(16);

  // 設定文字使用白色。
  fill(255);

  // 判斷音效是否已經開啟。
  if (soundEnabled) {
    // 在按鈕上方顯示英文ON。
    text("ON", soundButtonX, soundButtonY - 38);
  } else {
    // 在按鈕上方顯示英文OFF。
    text("OFF", soundButtonX, soundButtonY - 38);
  }

  // 判斷音效是否開啟。
  if (soundEnabled) {
    // 設定開啟狀態按鈕為紅色。
    fill(soundOnColor);
  } else {
    // 設定關閉狀態按鈕為綠色。
    fill(soundOffColor);
  }

  // 關閉按鈕外框線。
  noStroke();

  // 繪製直徑50的圓形按鈕。
  ellipse(
    soundButtonX,
    soundButtonY,
    soundButtonDiameter,
    soundButtonDiameter
  );
}

// 偵測滑鼠點擊。
function mousePressed() {
  // 計算滑鼠與按鈕中心的水平距離。
  const distanceX = mouseX - soundButtonX;

  // 計算滑鼠與按鈕中心的垂直距離。
  const distanceY = mouseY - soundButtonY;

  // 計算滑鼠與按鈕中心的距離。
  const distanceToButton = sqrt(
    distanceX * distanceX + distanceY * distanceY
  );

  // 判斷滑鼠是否點擊按鈕範圍。
  if (distanceToButton <= soundButtonRadius) {
    // 切換音效開關狀態。
    toggleSound();

    // 阻止點擊事件繼續傳遞。
    return false;
  }
}

// 偵測觸控操作。
function touchStarted() {
  // 計算觸控位置與按鈕中心的水平距離。
  const distanceX = mouseX - soundButtonX;

  // 計算觸控位置與按鈕中心的垂直距離。
  const distanceY = mouseY - soundButtonY;

  // 計算觸控位置與按鈕中心的距離。
  const distanceToButton = sqrt(
    distanceX * distanceX + distanceY * distanceY
  );

  // 判斷觸控是否點擊按鈕。
  if (distanceToButton <= soundButtonRadius) {
    // 切換音效開關狀態。
    toggleSound();

    // 阻止觸控事件繼續傳遞。
    return false;
  }

  // 不讓觸控事件觸發其他音效行為。
  return false;
}

// 切換音效開關。
function toggleSound() {
  // 啟動瀏覽器音訊環境。
  userStartAudio();

  // 反轉目前的音效狀態。
  soundEnabled = !soundEnabled;

  // 判斷是否要開啟音效。
  if (soundEnabled) {
    // 判斷背景音樂是否尚未播放。
    if (!backgroundMusic.isPlaying()) {
      // 循環播放背景音樂。
      backgroundMusic.loop();

      // 設定背景音樂音量。
      backgroundMusic.setVolume(0.55);
    }
  } else {
    // 停止背景音樂。
    backgroundMusic.stop();

    // 停止爆破音效。
    popSound.stop();
  }
}

// 建立具有隨機屬性的氣球。
function createBalloon(startY) {
  // 隨機設定氣球高度。
  const balloonHeight = random(150, 300);

  // 依照4:6比例計算氣球寬度。
  const balloonWidth = balloonHeight * (4 / 6);

  // 回傳氣球物件。
  return {
    // 隨機設定氣球水平位置。
    x: random(width),

    // 設定氣球垂直位置。
    y: startY,

    // 儲存氣球寬度。
    width: balloonWidth,

    // 儲存氣球高度。
    height: balloonHeight,

    // 設定氣球移動速度。
    speed: random(3, 5),

    // 設定氣球透明度。
    alpha: random(80, 95),

    // 隨機選擇氣球顏色。
    color: random(balloonColors),

    // 設定左右飄動起點。
    noiseOffset: random(1000),

    // 設定左右飄動幅度。
    driftAmount: random(12, 35),

    // 設定左右飄動速度。
    driftSpeed: random(0.004, 0.015),

    // 設定綁結寬度。
    knotWidth: balloonWidth * 0.16,

    // 設定綁結高度。
    knotHeight: balloonHeight * 0.13,

    // 設定飄動線條長度。
    stringLength: random(45, 85),

    // 設定線條彎曲幅度。
    stringWave: random(8, 18),

    // 設定線條初始相位。
    stringPhase: random(TWO_PI),

    // 設定氣球尚未爆破。
    bursting: false,

    // 設定爆破開始時間。
    burstStartTime: 0,

    // 設定爆破持續時間。
    burstDuration: 0
  };
}

// 更新氣球的位置。
function updateBalloon(balloon) {
  // 判斷氣球是否尚未爆破。
  if (!balloon.bursting) {
    // 讓氣球向上移動。
    balloon.y -= balloon.speed;
  }

  // 使用Perlin noise產生左右飄動。
  const horizontalDrift =
    map(noise(balloon.noiseOffset), 0, 1, -1, 1) *
    balloon.driftAmount *
    0.08;

  // 更新氣球水平位置。
  balloon.x += horizontalDrift;

  // 持續改變噪聲位置。
  balloon.noiseOffset += balloon.driftSpeed;

  // 判斷氣球是否超出畫布左側。
  if (balloon.x + balloon.width / 2 < 0) {
    // 從畫布右側重新出現。
    balloon.x = width + balloon.width / 2;
  }

  // 判斷氣球是否超出畫布右側。
  if (balloon.x - balloon.width / 2 > width) {
    // 從畫布左側重新出現。
    balloon.x = -balloon.width / 2;
  }
}

// 繪製氣球與裝飾。
function drawBalloon(balloon) {
  // 將氣球顏色轉換成p5.js顏色物件。
  const balloonColor = color(balloon.color);

  // 設定氣球透明度。
  balloonColor.setAlpha(balloon.alpha);

  // 使用氣球顏色填滿。
  fill(balloonColor);

  // 關閉氣球外框線。
  noStroke();

  // 繪製4:6比例的氣球。
  ellipse(balloon.x, balloon.y, balloon.width, balloon.height);

  // 計算氣球底部水平座標。
  const bottomX = balloon.x;

  // 計算氣球底部垂直座標。
  const bottomY = balloon.y + balloon.height / 2;

  // 使用氣球顏色填滿綁結。
  fill(balloonColor);

  // 繪製氣球下方綁結。
  triangle(
    bottomX - balloon.knotWidth / 2,
    bottomY - balloon.knotHeight * 0.2,
    bottomX + balloon.knotWidth / 2,
    bottomY - balloon.knotHeight * 0.2,
    bottomX,
    bottomY + balloon.knotHeight
  );

  // 設定星星大小。
  const starSize = balloon.height / 10;

  // 計算星星水平位置。
  const starX = balloon.x + balloon.width * 0.22;

  // 計算星星垂直位置。
  const starY = balloon.y - balloon.height * 0.22;

  // 使用白色與氣球相同透明度。
  fill(255, balloon.alpha);

  // 繪製右上方星星。
  drawStar(starX, starY, starSize * 0.45, starSize, 5);

  // 設定飄動線條顏色。
  stroke(255, 220);

  // 設定飄動線條粗細。
  strokeWeight(2);

  // 關閉線條填色。
  noFill();

  // 開始繪製飄動線條。
  beginShape();

  // 建立飄動線條。
  for (let i = 0; i <= 24; i++) {
    // 計算線條進度。
    const progress = i / 24;

    // 計算線條垂直位置。
    const lineY =
      bottomY +
      balloon.knotHeight +
      progress * balloon.stringLength;

    // 計算線條水平位置。
    const lineX =
      bottomX +
      sin(
        frameCount * 0.035 +
          balloon.stringPhase +
          progress * TWO_PI
      ) *
        balloon.stringWave *
        progress;

    // 加入線條頂點。
    vertex(lineX, lineY);
  }

  // 結束飄動線條。
  endShape();

  // 關閉圖形外框線。
  noStroke();
}

// 繪製五角星。
function drawStar(x, y, innerRadius, outerRadius, points) {
  // 開始建立星星形狀。
  beginShape();

  // 建立星星頂點。
  for (let i = 0; i < points * 2; i++) {
    // 計算頂點角度。
    const angle = -HALF_PI + (i * PI) / points;

    // 交替使用內外半徑。
    const radius = i % 2 === 0 ? outerRadius : innerRadius;

    // 計算頂點水平位置。
    const vertexX = x + cos(angle) * radius;

    // 計算頂點垂直位置。
    const vertexY = y + sin(angle) * radius;

    // 將頂點加入星星。
    vertex(vertexX, vertexY);
  }

  // 封閉星星形狀。
  endShape(CLOSE);
}

// 根據循環時間控制爆破速度。
function updateBurstInterval(elapsedTime) {
  // 計算目前位於20秒循環中的時間。
  const cycleTime = elapsedTime % burstCycleDuration;

  // 判斷是否位於前10秒加速階段。
  if (cycleTime < accelerationDuration) {
    // 計算加速進度。
    const progress = cycleTime / accelerationDuration;

    // 將爆破間隔由1.5秒縮短至0.8秒。
    currentBurstInterval = lerp(
      normalBurstInterval,
      fastestBurstInterval,
      progress
    );
  } else {
    // 後10秒恢復1.5秒間隔。
    currentBurstInterval = normalBurstInterval;
  }
}

// 爆破一個氣球。
function burstOneBalloon() {
  // 建立可爆破氣球索引清單。
  const availableIndexes = [];

  // 檢查所有氣球。
  for (let i = 0; i < balloons.length; i++) {
    // 判斷氣球是否尚未爆破。
    if (!balloons[i].bursting) {
      // 將索引加入可爆破清單。
      availableIndexes.push(i);
    }
  }

  // 判斷是否沒有可爆破氣球。
  if (availableIndexes.length === 0) {
    // 結束函式。
    return;
  }

  // 隨機選取一個氣球索引。
  const selectedIndex = random(availableIndexes);

  // 取得被選中的氣球。
  const balloon = balloons[selectedIndex];

  // 設定氣球進入爆破狀態。
  balloon.bursting = true;

  // 記錄爆破開始時間。
  balloon.burstStartTime = millis();

  // 設定爆破效果持續時間。
  balloon.burstDuration = random(700, 1300);

  // 播放爆破音效。
  playPopSound();

  // 建立爆破粒子。
  createBurstParticles(balloon);
}

// 播放爆破音效。
function playPopSound() {
  // 判斷音效是否已開啟。
  if (!soundEnabled) {
    // 音效關閉時不播放。
    return;
  }

  // 判斷爆破音效是否已載入。
  if (popSound && popSound.isLoaded()) {
    // 將音效播放位置重設到開頭。
    popSound.jump(0);

    // 設定爆破音效音量。
    popSound.setVolume(0.12);

    // 播放爆破音效。
    popSound.play();
  }
}

// 建立爆破粒子。
function createBurstParticles(balloon) {
  // 設定粒子數量。
  const particleCount = 44;

  // 建立多個爆破粒子。
  for (let i = 0; i < particleCount; i++) {
    // 隨機產生粒子方向。
    const angle = random(TWO_PI);

    // 隨機產生粒子速度。
    const speed = random(3, 11);

    // 將粒子加入陣列。
    burstParticles.push({
      // 設定粒子水平位置。
      x: balloon.x,

      // 設定粒子垂直位置。
      y: balloon.y,

      // 設定粒子水平速度。
      vx: cos(angle) * speed,

      // 設定粒子垂直速度。
      vy: sin(angle) * speed,

      // 設定粒子大小。
      size: random(4, 16),

      // 使用氣球顏色。
      color: balloon.color,

      // 使用氣球透明度。
      alpha: balloon.alpha,

      // 設定粒子生命值。
      life: 255,

      // 設定粒子旋轉角度。
      rotation: random(TWO_PI),

      // 設定粒子旋轉速度。
      rotationSpeed: random(-0.3, 0.3)
    });
  }
}

// 更新爆破粒子。
function updateBurstParticles() {
  // 從陣列尾端向前處理粒子。
  for (let i = burstParticles.length - 1; i >= 0; i--) {
    // 取得目前粒子。
    const particle = burstParticles[i];

    // 更新粒子水平位置。
    particle.x += particle.vx;

    // 更新粒子垂直位置。
    particle.y += particle.vy;

    // 加入重力效果。
    particle.vy += 0.15;

    // 更新粒子旋轉角度。
    particle.rotation += particle.rotationSpeed;

    // 逐漸降低粒子生命值。
    particle.life -= 8;

    // 將粒子顏色轉換成p5.js顏色。
    const particleColor = color(particle.color);

    // 設定粒子透明度。
    particleColor.setAlpha(
      min(particle.alpha, max(0, particle.life))
    );

    // 使用粒子顏色填滿。
    fill(particleColor);

    // 關閉粒子外框線。
    noStroke();

    // 儲存繪圖狀態。
    push();

    // 移動到粒子位置。
    translate(particle.x, particle.y);

    // 旋轉粒子。
    rotate(particle.rotation);

    // 設定矩形以中心點繪製。
    rectMode(CENTER);

    // 繪製爆破碎片。
    rect(0, 0, particle.size, particle.size * 0.55);

    // 恢復繪圖狀態。
    pop();

    // 判斷粒子是否已經消失。
    if (particle.life <= 0) {
      // 移除爆破粒子。
      burstParticles.splice(i, 1);
    }
  }
}

// 更新爆破中的氣球。
function updateBurstingBalloons() {
  // 從陣列尾端向前處理氣球。
  for (let i = balloons.length - 1; i >= 0; i--) {
    // 取得目前氣球。
    const balloon = balloons[i];

    // 判斷氣球是否正在爆破。
    if (balloon.bursting) {
      // 計算爆破經過時間。
      const burstElapsed = millis() - balloon.burstStartTime;

      // 判斷爆破效果是否結束。
      if (burstElapsed >= balloon.burstDuration) {
        // 將氣球重設到畫布下方。
        resetBalloon(balloon);
      }
    }
  }
}

// 將氣球重設到畫布下方。
function resetBalloon(balloon) {
  // 重新設定氣球水平位置。
  balloon.x = random(width);

  // 重新設定氣球高度。
  balloon.height = random(150, 300);

  // 依照4:6比例重新設定氣球寬度。
  balloon.width = balloon.height * (4 / 6);

  // 更新綁結寬度。
  balloon.knotWidth = balloon.width * 0.16;

  // 更新綁結高度。
  balloon.knotHeight = balloon.height * 0.13;

  // 將氣球放置到畫布最下方。
  balloon.y =
    height +
    balloon.height / 2 +
    balloon.knotHeight +
    balloon.stringLength;

  // 重新設定氣球速度。
  balloon.speed = random(3, 5);

  // 重新設定透明度。
  balloon.alpha = random(80, 95);

  // 重新設定氣球顏色。
  balloon.color = random(balloonColors);

  // 重新設定噪聲起點。
  balloon.noiseOffset = random(1000);

  // 重新設定左右飄動幅度。
  balloon.driftAmount = random(12, 35);

  // 重新設定左右飄動速度。
  balloon.driftSpeed = random(0.004, 0.015);

  // 重新設定線條長度。
  balloon.stringLength = random(45, 85);

  // 重新設定線條彎曲幅度。
  balloon.stringWave = random(8, 18);

  // 重新設定線條相位。
  balloon.stringPhase = random(TWO_PI);

  // 清除爆破狀態。
  balloon.bursting = false;

  // 清除爆破開始時間。
  balloon.burstStartTime = 0;

  // 清除爆破持續時間。
  balloon.burstDuration = 0;
}

// 當瀏覽器視窗大小改變時執行。
function windowResized() {
  // 重新調整畫布大小。
  resizeCanvas(windowWidth, windowHeight);

  // 重新設定音效開關水平位置。
  soundButtonX = width - 40;

  // 重新設定音效開關垂直位置。
  soundButtonY = 55;
}