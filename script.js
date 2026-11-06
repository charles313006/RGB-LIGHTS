// ---------- Config ----------
const COLORS = [
  { name: "Red",     rgb: [255, 0, 0] },
  { name: "Green",   rgb: [0, 255, 0] },
  { name: "Blue",    rgb: [0, 80, 255] },
  { name: "Cyan",    rgb: [0, 255, 255] },
  { name: "Magenta", rgb: [255, 0, 255] },
  { name: "Yellow",  rgb: [255, 220, 0] },
  { name: "White",   rgb: [255, 255, 255] },
];

const MODES = ["Rainbow Fade", "Breathing", "Strobe", "RGB Wave", "Static"];

// ---------- State ----------
let modeIndex = 0;
let colorIndex = 0;
let speed = 1;
let paused = false;
let t = 0;               // animation time in seconds (scaled by speed)
let last = performance.now();

// ---------- Elements ----------
const lights     = document.getElementById("lights");
const modeLabel  = document.getElementById("modeLabel");
const colorName  = document.getElementById("colorName");
const swatch     = document.getElementById("swatch");
const speedInput = document.getElementById("speed");
const speedVal   = document.getElementById("speedVal");
const pauseBtn   = document.getElementById("pauseBtn");

const rgb = (c, a = 1) => `rgba(${c[0] * a | 0}, ${c[1] * a | 0}, ${c[2] * a | 0}, 1)`;

// ---------- UI updates ----------
function updateLabels() {
  modeLabel.textContent = MODES[modeIndex];
  const c = COLORS[colorIndex];
  colorName.textContent = c.name;
  swatch.style.background = rgb(c.rgb);
}

function nextMode()  { modeIndex  = (modeIndex  + 1) % MODES.length;  updateLabels(); }
function nextColor() { colorIndex = (colorIndex + 1) % COLORS.length; updateLabels(); }
function togglePause() {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
}

// ---------- Render ----------
function render() {
  const c = COLORS[colorIndex].rgb;

  switch (MODES[modeIndex]) {
    case "Rainbow Fade": {
      const hue = (t * 60) % 360;                    // 60° per second
      lights.style.background = `hsl(${hue}, 100%, 50%)`;
      break;
    }
    case "Breathing": {
      const a = (Math.sin(t * 2) + 1) / 2;           // 0..1
      const level = 0.08 + a * 0.92;
      lights.style.background = rgb(c, level);
      break;
    }
    case "Strobe": {
      // Capped to a gentle ~3 flashes/sec at max speed
      const on = Math.floor(t * 2) % 2 === 0;
      lights.style.background = on ? rgb(c) : "#000";
      break;
    }
    case "RGB Wave": {
      const shift = (t * 80) % 400;
      lights.style.background =
        `linear-gradient(115deg,
          #ff0000 ${-shift}px,
          #00ff00 ${100 - shift}px,
          #0000ff ${200 - shift}px,
          #ff0000 ${300 - shift}px,
          #00ff00 ${400 - shift}px,
          #0000ff ${500 - shift}px,
          #ff0000 ${600 - shift}px,
          #00ff00 ${700 - shift}px,
          #0000ff ${800 - shift}px)`;
      break;
    }
    case "Static":
    default:
      lights.style.background = rgb(c);
  }
}

function loop(now) {
  const dt = (now - last) / 1000;
  last = now;
  if (!paused) t += dt * speed;
  render();
  requestAnimationFrame(loop);
}

// ---------- Events ----------
document.getElementById("modeBtn").addEventListener("click", nextMode);
document.getElementById("colorBtn").addEventListener("click", nextColor);
pauseBtn.addEventListener("click", togglePause);

speedInput.addEventListener("input", () => {
  speed = parseFloat(speedInput.value);
  speedVal.textContent = speed.toFixed(1) + "×";
});

document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "m") nextMode();
  else if (k === "c") nextColor();
  else if (e.code === "Space") { e.preventDefault(); togglePause(); }
});

// ---------- Start ----------
updateLabels();
requestAnimationFrame(loop);
