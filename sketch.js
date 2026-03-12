/*
 * 作品名：《墨迹·流动的算法》
 * 说明：将水墨晕染与粒子系统结合，鼠标速度驱动粒子生成参数。
 */

const PARTICLES = [];
const THEMES = [
  {
    name: "水墨黑白",
    bg: [245, 241, 232],
    palette: [
      [38, 38, 38],
      [58, 58, 58],
      [82, 82, 82],
      [24, 24, 24]
    ],
    fadeAlpha: 22,
    baseSpread: 10,
    drift: 0.12,
    glow: false,
    glowRange: [90, 160],
    glowAlpha: 6,
    textureStep: 4800,
    textureColor: [132, 128, 118],
    brush: {
      amountScale: 0.95,
      sizeScale: 1,
      spreadScale: 1
    },
    hudTitle: "#202020",
    hudText: "rgba(35, 35, 35, 0.68)",
    ui: {
      panelBg: "rgba(249, 246, 239, 0.75)",
      panelBorder: "rgba(33, 33, 33, 0.15)",
      btnBg: "rgba(255, 255, 255, 0.86)",
      btnBorder: "rgba(28, 28, 28, 0.2)",
      btnText: "#222222",
      btnActiveBg: "rgba(28, 28, 28, 0.9)",
      btnActiveText: "#f4f4f4"
    }
  },
  {
    name: "蓝紫星空",
    bg: [8, 14, 36],
    palette: [
      [126, 143, 255],
      [97, 115, 244],
      [155, 110, 247],
      [87, 204, 255]
    ],
    fadeAlpha: 24,
    baseSpread: 12,
    drift: 0.16,
    glow: true,
    glowRange: [110, 220],
    glowAlpha: 7,
    textureStep: 3600,
    textureColor: [190, 210, 255],
    brush: {
      amountScale: 1.05,
      sizeScale: 0.96,
      spreadScale: 1.2
    },
    hudTitle: "#d6defe",
    hudText: "rgba(200, 210, 255, 0.82)",
    ui: {
      panelBg: "rgba(15, 22, 48, 0.68)",
      panelBorder: "rgba(167, 182, 255, 0.3)",
      btnBg: "rgba(28, 38, 76, 0.88)",
      btnBorder: "rgba(160, 179, 255, 0.4)",
      btnText: "#d7deff",
      btnActiveBg: "rgba(132, 119, 255, 0.95)",
      btnActiveText: "#ffffff"
    }
  },
  {
    name: "暖色花瓣",
    bg: [252, 243, 235],
    palette: [
      [239, 147, 157],
      [244, 181, 136],
      [232, 130, 153],
      [255, 198, 166]
    ],
    fadeAlpha: 21,
    baseSpread: 10,
    drift: 0.11,
    glow: false,
    glowRange: [80, 150],
    glowAlpha: 5,
    textureStep: 4600,
    textureColor: [235, 170, 152],
    brush: {
      amountScale: 0.86,
      sizeScale: 1.08,
      spreadScale: 1.06
    },
    hudTitle: "#6a3e37",
    hudText: "rgba(111, 69, 60, 0.78)",
    ui: {
      panelBg: "rgba(255, 242, 232, 0.75)",
      panelBorder: "rgba(149, 89, 75, 0.25)",
      btnBg: "rgba(255, 255, 255, 0.82)",
      btnBorder: "rgba(171, 110, 94, 0.3)",
      btnText: "#6c413a",
      btnActiveBg: "rgba(218, 122, 139, 0.9)",
      btnActiveText: "#fff9f6"
    }
  },
  {
    name: "赛博霓虹",
    bg: [10, 12, 16],
    palette: [
      [0, 255, 214],
      [255, 72, 176],
      [72, 120, 255],
      [255, 183, 0]
    ],
    fadeAlpha: 26,
    baseSpread: 12,
    drift: 0.18,
    glow: true,
    glowRange: [130, 260],
    glowAlpha: 8,
    textureStep: 3400,
    textureColor: [170, 220, 255],
    brush: {
      amountScale: 1.18,
      sizeScale: 0.9,
      spreadScale: 1.24
    },
    hudTitle: "#e7fff8",
    hudText: "rgba(220, 235, 255, 0.82)",
    ui: {
      panelBg: "rgba(13, 18, 24, 0.74)",
      panelBorder: "rgba(112, 245, 223, 0.35)",
      btnBg: "rgba(22, 28, 36, 0.88)",
      btnBorder: "rgba(111, 225, 255, 0.4)",
      btnText: "#d8f7ff",
      btnActiveBg: "rgba(255, 87, 184, 0.92)",
      btnActiveText: "#ffffff"
    }
  }
];

const MAX_PARTICLES = 1300;
let themeIndex = 0;
let textureLayer;
let mainCanvas;
let controlsPanel;
let firstFrameAfterResize = true;

function setup() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  mainCanvas = createCanvas(windowWidth, windowHeight);
  pixelDensity(dpr);
  noStroke();

  textureLayer = createGraphics(width, height);
  textureLayer.pixelDensity(dpr);

  bindControls();
  generateTexture();
  applyThemeHUD();
  exposeDebugTools();

  const theme = getTheme();
  background(theme.bg[0], theme.bg[1], theme.bg[2]);
}

function draw() {
  const theme = getTheme();

  if (firstFrameAfterResize) {
    background(theme.bg[0], theme.bg[1], theme.bg[2]);
    firstFrameAfterResize = false;
  } else {
    fill(theme.bg[0], theme.bg[1], theme.bg[2], theme.fadeAlpha);
    rect(0, 0, width, height);
  }

  if (theme.glow) {
    drawAmbientGlow(theme);
  }

  for (let i = PARTICLES.length - 1; i >= 0; i -= 1) {
    const particle = PARTICLES[i];
    particle.update(theme);
    particle.render();
    if (particle.isDead()) {
      PARTICLES.splice(i, 1);
    }
  }

  image(textureLayer, 0, 0);
}

function mouseMoved() {
  spawnByCursorVelocity();
  return false;
}

function mouseDragged() {
  spawnByCursorVelocity();
  return false;
}

function touchMoved() {
  spawnByCursorVelocity();
  return false;
}

function windowResized() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  resizeCanvas(windowWidth, windowHeight);
  textureLayer = createGraphics(width, height);
  textureLayer.pixelDensity(dpr);
  generateTexture();
  firstFrameAfterResize = true;
}

function bindControls() {
  controlsPanel = document.querySelector(".controls");

  const modeButtons = document.querySelectorAll(".mode-btn");
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTheme = Number(button.dataset.theme);
      setThemeByIndex(targetTheme);
    });
  });

  const clearButton = document.getElementById("clearBtn");
  clearButton.addEventListener("click", () => {
    clearArtwork();
  });

  const captureButton = document.getElementById("captureBtn");
  captureButton.addEventListener("click", () => {
    captureArtwork();
  });
}

function setThemeByIndex(nextIndex) {
  if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= THEMES.length) {
    return;
  }

  if (nextIndex === themeIndex) {
    applyThemeHUD();
    return;
  }

  themeIndex = nextIndex;
  PARTICLES.length = 0;
  generateTexture();
  applyThemeHUD();
  firstFrameAfterResize = true;
}

function clearArtwork() {
  PARTICLES.length = 0;
  const theme = getTheme();
  background(theme.bg[0], theme.bg[1], theme.bg[2]);
  image(textureLayer, 0, 0);
  firstFrameAfterResize = false;
}

function captureArtwork() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}-${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`;
  const themeLabel = getTheme().name.replace(/\s+/g, "");
  const filename = `墨迹-流动的算法-${themeLabel}-${stamp}`;
  saveCanvas(mainCanvas, filename, "png");
}

function spawnByCursorVelocity() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return;
  }

  if (isCursorInsideControls(mouseX, mouseY)) {
    return;
  }

  const speed = dist(mouseX, mouseY, pmouseX, pmouseY);
  if (speed < 0.18) {
    return;
  }

  const speedNorm = constrain(Math.pow(speed / 30, 0.85), 0, 1);
  const moveVector = createVector(mouseX - pmouseX, mouseY - pmouseY);
  const segmentSteps = constrain(floor(speed / 10), 1, 7);

  for (let i = 0; i < segmentSteps; i += 1) {
    const progress = (i + 1) / segmentSteps;
    const x = lerp(pmouseX, mouseX, progress);
    const y = lerp(pmouseY, mouseY, progress);
    spawnBurstAt(x, y, speedNorm, moveVector, progress);
  }

  if (PARTICLES.length > MAX_PARTICLES) {
    const removeCount = PARTICLES.length - MAX_PARTICLES;
    PARTICLES.splice(0, removeCount);
  }
}

function spawnBurstAt(x, y, speedNorm, moveVector, progress) {
  const theme = getTheme();
  const amount = floor((1 + speedNorm * 8) * theme.brush.amountScale);
  const sizeBase = (2.4 + speedNorm * 9.2) * theme.brush.sizeScale;
  const spreadBase = (theme.baseSpread + speedNorm * 14) * theme.brush.spreadScale;
  const driftScale = theme.drift + speedNorm * 0.14;
  const energy = lerp(0.86, 1.08, progress);

  for (let i = 0; i < amount; i += 1) {
    const angle = random(TWO_PI);
    const radius = randomGaussian() * spreadBase * 0.38;
    const px = x + cos(angle) * radius;
    const py = y + sin(angle) * radius;
    PARTICLES.push(
      new Particle(px, py, {
        speedNorm,
        sizeBase,
        driftScale,
        moveVector,
        color: random(theme.palette),
        energy
      })
    );
  }
}

function drawAmbientGlow(theme) {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return;
  }

  const glowRadius = map(
    constrain(dist(mouseX, mouseY, pmouseX, pmouseY), 0, 36),
    0,
    36,
    theme.glowRange[0],
    theme.glowRange[1]
  );
  const colorRef = random(theme.palette);
  fill(colorRef[0], colorRef[1], colorRef[2], theme.glowAlpha);
  ellipse(mouseX, mouseY, glowRadius);
}

function generateTexture() {
  const theme = getTheme();
  textureLayer.clear();
  textureLayer.noStroke();

  const pointsCount = floor((width * height) / theme.textureStep);
  for (let i = 0; i < pointsCount; i += 1) {
    const x = random(width);
    const y = random(height);
    const alpha = random(2, 8);
    textureLayer.fill(
      theme.textureColor[0],
      theme.textureColor[1],
      theme.textureColor[2],
      alpha
    );
    textureLayer.ellipse(x, y, random(0.55, 1.3));
  }
}

function applyThemeHUD() {
  const theme = getTheme();
  const root = document.documentElement;
  const themeInfo = document.getElementById("themeInfo");

  root.style.setProperty("--hud-title", theme.hudTitle);
  root.style.setProperty("--hud-text", theme.hudText);

  root.style.setProperty("--panel-bg", theme.ui.panelBg);
  root.style.setProperty("--panel-border", theme.ui.panelBorder);
  root.style.setProperty("--btn-bg", theme.ui.btnBg);
  root.style.setProperty("--btn-border", theme.ui.btnBorder);
  root.style.setProperty("--btn-text", theme.ui.btnText);
  root.style.setProperty("--btn-active-bg", theme.ui.btnActiveBg);
  root.style.setProperty("--btn-active-text", theme.ui.btnActiveText);

  themeInfo.textContent = `主题：${theme.name} · 移动鼠标生成 · 点击模式块切换`;

  const modeButtons = document.querySelectorAll(".mode-btn");
  modeButtons.forEach((button) => {
    const index = Number(button.dataset.theme);
    if (index === themeIndex) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function isCursorInsideControls(x, y) {
  if (!controlsPanel) {
    return false;
  }
  const rect = controlsPanel.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function exposeDebugTools() {
  window.__INK_DEBUG__ = {
    getThemeIndex: () => themeIndex,
    getThemeName: () => getTheme().name,
    getParticleCount: () => PARTICLES.length,
    setThemeByIndex,
    clearArtwork
  };
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function getTheme() {
  return THEMES[themeIndex];
}

class Particle {
  constructor(x, y, params) {
    this.pos = createVector(x, y);

    const directionalBoost = params.moveVector
      .copy()
      .mult(0.018 + params.speedNorm * 0.045);
    const randomDrift = p5.Vector.random2D().mult(random(0.07, 0.45));
    this.vel = directionalBoost.add(randomDrift);

    this.baseSize = params.sizeBase * random(0.55, 1.15);
    this.color = params.color;
    this.currentSize = this.baseSize;
    this.sizeGrowth = random(0.015, 0.095) + params.speedNorm * 0.09;
    this.wanderStrength = params.driftScale;

    this.life = 0;
    this.maxLife = floor(random(42, 82) + params.speedNorm * 20);
    this.coreAlpha = random(22, 56) * params.energy;
    this.softAlpha = random(5, 18) * params.energy;
  }

  update(theme) {
    this.life += 1;

    const wander = p5.Vector.random2D().mult(this.wanderStrength * 0.05);
    this.vel.add(wander);
    this.vel.mult(0.988);
    this.pos.add(this.vel);

    this.currentSize += this.sizeGrowth;
    this.sizeGrowth *= 0.992;
    this.wanderStrength = lerp(this.wanderStrength, theme.drift, 0.02);
  }

  render() {
    const lifeRatio = 1 - this.life / this.maxLife;
    const alphaCore = this.coreAlpha * lifeRatio;
    const alphaSoft = this.softAlpha * lifeRatio;

    fill(this.color[0], this.color[1], this.color[2], alphaSoft * 0.66);
    ellipse(this.pos.x, this.pos.y, this.currentSize * 2.3);

    fill(this.color[0], this.color[1], this.color[2], alphaSoft);
    ellipse(this.pos.x, this.pos.y, this.currentSize * 1.65);

    fill(this.color[0], this.color[1], this.color[2], alphaCore);
    ellipse(this.pos.x, this.pos.y, this.currentSize);
  }

  isDead() {
    return this.life >= this.maxLife;
  }
}
