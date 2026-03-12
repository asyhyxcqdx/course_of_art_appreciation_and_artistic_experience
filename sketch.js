/*
 * 作品名：《墨迹·流动的算法》
 * 说明：将水墨晕染与粒子系统结合，鼠标速度驱动粒子生成参数。
 */

const PARTICLES = [];
const THEMES = [
  {
    name: "水墨黑白",
    particleMode: "ink",
    bg: [245, 241, 232],
    palette: [
      [28, 28, 28],
      [44, 44, 44],
      [64, 64, 64],
      [16, 16, 16]
    ],
    fadeAlpha: 19,
    baseSpread: 11,
    drift: 0.17,
    glow: false,
    glowRange: [90, 160],
    glowAlpha: 6,
    textureStep: 4800,
    textureColor: [132, 128, 118],
    brush: {
      amountScale: 1.12,
      sizeScale: 1.06,
      spreadScale: 1.16
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
    particleMode: "star",
    bg: [8, 14, 36],
    palette: [
      [126, 143, 255],
      [97, 115, 244],
      [155, 110, 247],
      [87, 204, 255]
    ],
    fadeAlpha: 56,
    baseSpread: 12.5,
    drift: 0.22,
    glow: false,
    glowRange: [110, 220],
    glowAlpha: 7,
    textureStep: 3600,
    textureColor: [190, 210, 255],
    brush: {
      amountScale: 0.26,
      sizeScale: 0.52,
      spreadScale: 1
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
    particleMode: "petal",
    bg: [252, 243, 235],
    palette: [
      [239, 147, 157],
      [244, 181, 136],
      [232, 130, 153],
      [255, 198, 166]
    ],
    fadeAlpha: 40,
    baseSpread: 10.5,
    drift: 0.16,
    glow: false,
    glowRange: [80, 150],
    glowAlpha: 5,
    textureStep: 4600,
    textureColor: [235, 170, 152],
    brush: {
      amountScale: 0.28,
      sizeScale: 1.14,
      spreadScale: 1.18
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
    particleMode: "cyber",
    bg: [10, 12, 16],
    palette: [
      [0, 255, 214],
      [255, 72, 176],
      [72, 120, 255],
      [255, 183, 0]
    ],
    fadeAlpha: 48,
    baseSpread: 13,
    drift: 0.25,
    glow: true,
    glowRange: [130, 260],
    glowAlpha: 8,
    textureStep: 3400,
    textureColor: [170, 220, 255],
    brush: {
      amountScale: 0.5,
      sizeScale: 0.98,
      spreadScale: 1.34
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

const MAX_PARTICLES = 1700;
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

  const theme = getTheme();
  const speedNorm = constrain(Math.pow(speed / 30, 0.85), 0, 1);
  const moveVector = createVector(mouseX - pmouseX, mouseY - pmouseY);
  let segmentSteps = constrain(floor(speed / 8), 1, 10);
  if (theme.particleMode === "star") {
    segmentSteps = max(1, floor(segmentSteps * 0.45));
  } else if (theme.particleMode === "petal") {
    segmentSteps = max(1, floor(segmentSteps * 0.55));
  } else if (theme.particleMode === "cyber") {
    segmentSteps = max(1, floor(segmentSteps * 0.72));
  }

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
  const amount = floor((1 + speedNorm * 9.5) * theme.brush.amountScale);
  const sizeBase = (2.8 + speedNorm * 10.8) * theme.brush.sizeScale;
  const spreadBase = (theme.baseSpread + speedNorm * 16) * theme.brush.spreadScale;
  const driftScale = theme.drift + speedNorm * 0.18;
  const energy = lerp(0.92, 1.16, progress);

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
        spawnCenter: createVector(x, y),
        particleMode: theme.particleMode,
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
    this.mode = params.particleMode || "ink";
    this.speedNorm = params.speedNorm;
    this.spawnCenter = params.spawnCenter
      ? params.spawnCenter.copy()
      : createVector(x, y);

    const directionalBoost = params.moveVector
      .copy()
      .mult(0.024 + params.speedNorm * 0.058);
    const randomDrift = p5.Vector.random2D().mult(random(0.11, 0.58));
    this.vel = directionalBoost.add(randomDrift);
    this.moveUnit = params.moveVector.copy();
    if (this.moveUnit.magSq() < 0.0001) {
      this.moveUnit = p5.Vector.random2D();
    } else {
      this.moveUnit.normalize();
    }

    this.baseSize = params.sizeBase * random(0.55, 1.15);
    this.color = params.color;
    this.currentSize = this.baseSize;
    this.sizeGrowth = random(0.014, 0.07) + params.speedNorm * 0.08;
    this.wanderStrength = params.driftScale;

    this.life = 0;
    this.maxLife = floor(random(48, 88) + params.speedNorm * 22);
    this.coreAlpha = random(62, 128) * params.energy;
    this.softAlpha = random(20, 44) * params.energy;
    this.bloomAlpha = random(14, 34) * params.energy;
    this.trail = [];
    this.tailLength = 0;
    this.sparkSeed = random(TWO_PI);
    this.emberAlpha = random(30, 86) * params.energy;
    this.sparkAlpha = random(34, 88) * params.energy;
    this.emberColor = [255, 182, 112];

    if (this.mode === "star") {
      this.maxLife = floor(random(20, 34) + params.speedNorm * 6);
      this.sizeGrowth *= 0.45;
      this.softAlpha *= 0.54;
      this.wanderStrength *= 0.68;
      this.bloomAlpha = 0;
    } else if (this.mode === "petal") {
      this.maxLife = floor(random(30, 52) + params.speedNorm * 8);
      this.sizeGrowth *= 0.36;
      this.wanderStrength *= 0.82;
      this.bloomAlpha = 0;
      this.outwardDir = createVector(x - this.spawnCenter.x, y - this.spawnCenter.y);
      if (this.outwardDir.magSq() < 0.0001) {
        this.outwardDir = p5.Vector.random2D();
      }
      this.outwardDir.normalize();
      this.wind = p5.Vector.random2D().mult(random(0.016, 0.05));
      this.wind.add(this.moveUnit.copy().mult(random(0.012, 0.036)));
      this.petalSpin = random(-0.02, 0.02);
    } else if (this.mode === "cyber") {
      this.maxLife = floor(random(22, 38) + params.speedNorm * 5);
      this.sizeGrowth *= 0.58;
      this.wanderStrength *= 0.5;
      const radial = createVector(x - this.spawnCenter.x, y - this.spawnCenter.y);
      if (radial.magSq() < 0.0001) {
        this.radialDir = p5.Vector.random2D();
      } else {
        this.radialDir = radial.normalize();
      }
      const burstKick = this.radialDir
        .copy()
        .mult(random(0.45, 1.4) + params.speedNorm * 1.4);
      this.vel.add(burstKick);
      this.tailLength = floor(random(5, 9));
    }
  }

  update(theme) {
    this.life += 1;
    if (this.mode === "star") {
      this.updateStar(theme);
      return;
    }
    if (this.mode === "petal") {
      this.updatePetal(theme);
      return;
    }
    if (this.mode === "cyber") {
      this.updateCyber(theme);
      return;
    }
    this.updateInk(theme);
  }

  updateInk(theme) {
    const wander = p5.Vector.random2D().mult(this.wanderStrength * 0.08);
    this.vel.add(wander);
    this.vel.mult(0.992);
    this.pos.add(this.vel);

    this.currentSize += this.sizeGrowth;
    this.sizeGrowth *= 0.991;
    this.wanderStrength = lerp(this.wanderStrength, theme.drift, 0.03);
  }

  updateStar(theme) {
    const wander = p5.Vector.random2D().mult(this.wanderStrength * 0.05);
    this.vel.add(wander);
    this.vel.mult(0.975);
    this.pos.add(this.vel);

    this.currentSize += this.sizeGrowth * 0.26;
    this.sizeGrowth *= 0.976;
    this.wanderStrength = lerp(this.wanderStrength, theme.drift * 0.28, 0.05);
  }

  updatePetal(theme) {
    const ageRatio = this.life / this.maxLife;
    const outwardForce = this.outwardDir
      .copy()
      .mult(0.026 * (1 - ageRatio) + this.speedNorm * 0.018);
    this.vel.add(outwardForce);
    this.vel.add(this.wind);
    this.vel.add(p5.Vector.random2D().mult(this.wanderStrength * 0.03));
    this.vel.rotate(this.petalSpin * (1 - ageRatio));
    this.vel.mult(0.975);
    this.pos.add(this.vel);

    if (ageRatio < 0.35) {
      this.currentSize += this.sizeGrowth * 0.16;
    } else {
      this.currentSize *= 0.972;
    }
    this.sizeGrowth *= 0.972;
    this.wanderStrength = lerp(this.wanderStrength, theme.drift * 0.28, 0.05);
  }

  updateCyber(theme) {
    this.trail.push(this.pos.copy());
    if (this.trail.length > this.tailLength) {
      this.trail.shift();
    }

    const ageRatio = this.life / this.maxLife;
    const radialForce = this.radialDir
      .copy()
      .mult(0.034 * (1 - ageRatio) + this.speedNorm * 0.018);
    const sparkWander = p5.Vector.random2D().mult(
      this.wanderStrength * (ageRatio < 0.5 ? 0.03 : 0.018)
    );
    this.vel.add(radialForce);
    this.vel.add(sparkWander);
    this.vel.mult(ageRatio < 0.35 ? 0.978 : ageRatio < 0.62 ? 0.93 : 0.86);
    this.pos.add(this.vel);

    if (ageRatio < 0.22) {
      this.currentSize += this.sizeGrowth * 0.22;
    } else {
      this.currentSize *= 0.968;
    }
    this.sizeGrowth *= 0.965;
    this.wanderStrength = lerp(this.wanderStrength, theme.drift * 0.3, 0.05);
  }

  render() {
    if (this.mode === "star") {
      this.renderStar();
      return;
    }
    if (this.mode === "petal") {
      this.renderPetal();
      return;
    }
    if (this.mode === "cyber") {
      this.renderCyber();
      return;
    }
    this.renderInk();
  }

  renderInk() {
    const ageRatio = this.life / this.maxLife;
    const lifeRatio = 1 - ageRatio;
    const alphaCore = this.coreAlpha * Math.pow(lifeRatio, 0.78);
    const alphaSoft = this.softAlpha * Math.pow(lifeRatio, 0.56);
    const dissolve = constrain((ageRatio - 0.55) / 0.45, 0, 1);
    const bloomAlpha = this.bloomAlpha * dissolve * (0.3 + lifeRatio * 0.7);

    // 末期加大外晕，形成更明显的“消散晕开”感。
    fill(this.color[0], this.color[1], this.color[2], bloomAlpha);
    ellipse(this.pos.x, this.pos.y, this.currentSize * (2.8 + dissolve * 2.2));

    fill(this.color[0], this.color[1], this.color[2], alphaSoft * 0.72);
    ellipse(this.pos.x, this.pos.y, this.currentSize * 2.4);

    fill(this.color[0], this.color[1], this.color[2], alphaSoft);
    ellipse(this.pos.x, this.pos.y, this.currentSize * 1.75);

    fill(this.color[0], this.color[1], this.color[2], alphaCore);
    ellipse(this.pos.x, this.pos.y, this.currentSize * 0.95);
  }

  renderStar() {
    const lifeRatio = 1 - this.life / this.maxLife;
    const alphaCore = this.coreAlpha * Math.pow(lifeRatio, 1.3);
    const alphaSoft = this.softAlpha * Math.pow(lifeRatio, 1.35);

    fill(this.color[0], this.color[1], this.color[2], alphaSoft * 0.4);
    ellipse(this.pos.x, this.pos.y, this.currentSize);

    fill(this.color[0], this.color[1], this.color[2], alphaCore);
    ellipse(this.pos.x, this.pos.y, this.currentSize * 0.72);
  }

  renderPetal() {
    const lifeRatio = 1 - this.life / this.maxLife;
    const alphaCore = this.coreAlpha * Math.pow(lifeRatio, 2.2);
    const alphaSoft = this.softAlpha * Math.pow(lifeRatio, 2.4);

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    fill(this.color[0], this.color[1], this.color[2], alphaSoft * 0.58);
    ellipse(0, 0, this.currentSize * 1.3, this.currentSize * 0.72);

    fill(this.color[0], this.color[1], this.color[2], alphaCore);
    ellipse(0, 0, this.currentSize * 0.92, this.currentSize * 0.5);
    pop();
  }

  renderCyber() {
    const ageRatio = this.life / this.maxLife;
    const lifeRatio = 1 - ageRatio;
    const flicker = constrain(
      0.76 +
        0.28 * sin(this.life * 0.6 + this.sparkSeed) +
        random(-0.1, 0.13),
      0.4,
      1.2
    );

    if (this.trail.length > 0) {
      for (let i = 0; i < this.trail.length; i += 1) {
        const ratio = (i + 1) / this.trail.length;
        const point = this.trail[i];
        const trailAlpha = this.softAlpha * ratio * Math.pow(lifeRatio, 2.8) * 0.78 * flicker;
        fill(this.color[0], this.color[1], this.color[2], trailAlpha);
        ellipse(point.x, point.y, this.currentSize * (0.36 + ratio * 0.9));
      }
    }

    const sparkAlpha = this.sparkAlpha * Math.pow(lifeRatio, 3.6) * flicker;
    fill(this.color[0], this.color[1], this.color[2], sparkAlpha);
    ellipse(this.pos.x, this.pos.y, this.currentSize * 1.08);

    if (ageRatio < 0.18) {
      const flashAlpha = (1 - ageRatio / 0.18) * this.softAlpha * 0.18 * flicker;
      fill(this.color[0], this.color[1], this.color[2], flashAlpha);
      ellipse(this.pos.x, this.pos.y, this.currentSize * 1.85);
    }

    if (ageRatio > 0.45) {
      const emberLife = constrain(1 - (ageRatio - 0.45) / 0.55, 0, 1);
      const emberAlpha = this.emberAlpha * Math.pow(emberLife, 2.2);
      fill(this.emberColor[0], this.emberColor[1], this.emberColor[2], emberAlpha);
      ellipse(
        this.pos.x + random(-0.6, 0.6),
        this.pos.y + random(-0.6, 0.6),
        max(0.9, this.currentSize * 0.28)
      );
    }
  }

  isDead() {
    return this.life >= this.maxLife;
  }
}
