# 墨迹·流动的算法

《美术鉴赏与艺术体验》课程期末作品（计算机科学专业方向）  
主题：将中国水墨的“晕染、留白、流动、偶然性”与前端生成算法结合。

## 1. 项目简介

本项目是一个基于 `p5.js` 的交互式生成艺术网页。  
观众通过鼠标移动参与创作，画面会实时生成不同的“数字墨迹”轨迹。

作品强调：

- 艺术性：水墨质感、留白节奏、慢扩散与透明叠加
- 计算机特征：粒子系统、随机算法、速度映射、实时渲染

## 2. 功能列表

- 全屏画布 + 自适应窗口尺寸
- 鼠标移动生成水墨粒子
- 鼠标速度映射粒子数量/大小/扩散程度
- 四种模式手动切换（模式块按钮）
- 清屏按钮（重置画面）
- 截图保存按钮（导出 PNG）
- 移动端布局适配

## 3. 项目结构

```text
.
├─ index.html   # 页面结构与控制面板（模式块/清屏/截图按钮）
└─ sketch.js    # p5 绘制逻辑、粒子系统与交互逻辑
```

## 4. 运行方式

在项目目录启动本地静态服务：

```bash
cd d:\lesson\美术鉴赏与艺术体验
python -m http.server 8080
```

浏览器打开：

```text
http://127.0.0.1:8080
```

说明：项目通过 CDN 加载 `p5.js`，需要网络可访问 CDN。

## 5. 交互说明

- 模式切换：点击右上角（移动端在底部）四个模式块
  - 水墨黑白
  - 蓝紫星空
  - 暖色花瓣
  - 赛博霓虹
- 清屏：点击“清屏”按钮，清空当前粒子并重绘背景与纹理
- 截图：点击“截图保存”，导出当前画布 PNG

## 6. 关键代码说明

### 6.1 按钮点击事件是“绑定元素”，不是绑定坐标

```js
const captureButton = document.getElementById("captureBtn");
captureButton.addEventListener("click", () => {
  captureArtwork();
});
```

含义：只有点击到 `id="captureBtn"` 这个按钮元素时，才会触发截图逻辑。

### 6.2 清屏实现

```js
function clearArtwork() {
  PARTICLES.length = 0;
  const theme = getTheme();
  background(theme.bg[0], theme.bg[1], theme.bg[2]);
  image(textureLayer, 0, 0);
  firstFrameAfterResize = false;
}
```

逻辑：清空粒子数组，然后用当前主题重新绘制底色与纹理层。

### 6.3 截图保存实现

```js
function captureArtwork() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}-${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`;
  const themeLabel = getTheme().name.replace(/\s+/g, "");
  const filename = `墨迹-流动的算法-${themeLabel}-${stamp}`;
  saveCanvas(mainCanvas, filename, "png");
}
```

逻辑：拼接“主题名 + 时间戳”的文件名，然后调用 `p5.js` 的 `saveCanvas` 导出 PNG。

## 7. 可调参数（用于答辩演示）

主要在 `sketch.js` 中按主题配置：

- `fadeAlpha`：背景残影衰减速度（越大越容易“清空”）
- `textureStep`：纸面纹理密度（越大越稀疏）
- `brush.amountScale`：单位轨迹粒子数量
- `brush.sizeScale`：粒子尺寸倾向
- `brush.spreadScale`：扩散范围
- `glowRange` / `glowAlpha`：发光主题的氛围强度

## 8. 常见问题

1. 点击“截图保存”没反应？
   - 检查浏览器是否拦截下载。
   - 尝试使用 Chrome/Edge 最新版本。

2. 页面空白或报错？
   - 检查网络是否能访问 CDN（`p5.min.js`）。
   - 确认是通过本地服务访问，而非直接双击文件。

3. 画面太密或太淡？
   - 调整 `MAX_PARTICLES`、`fadeAlpha`、`brush` 参数。

