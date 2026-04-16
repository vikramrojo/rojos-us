const canvas = document.getElementById("hero-canvas");
const section = document.getElementById("hero-section");

const rect = section.getBoundingClientRect();
canvas.width = rect.width;
canvas.height = rect.height;

const tm = window.textmode.create({
    canvas,
    width: canvas.width,
    height: canvas.height,
    fontSize: 8,
    loadingScreen: {
        transition: 'none',
        renderer: () => {}
    }
});

let mouseNX = 0.5;
let mouseNY = 0.5;
let targetNX = 0.5;
let targetNY = 0.5;

section.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    targetNX = (e.clientX - r.left) / r.width;
    targetNY = (e.clientY - r.top) / r.height;
});

section.addEventListener("mouseleave", () => {
    targetNX = 0.5;
    targetNY = 0.5;
});

const DITHER_CHARS = [' ', '.', '-', '=', '+', '*'];

function cellNoise(x, y, time) {
    const value = Math.sin(x * 12.9898 + y * 78.233 + time * 4.928) * 43758.5453;
    return value - Math.floor(value);
}

function getDitherIntensity(nx, ny, time) {
    const wave = Math.sin((nx + time * 0.12) * 7.5 + Math.sin((ny + time * 0.08) * 5.7) * 1.8) * 0.5 + 0.5;
    const band = Math.cos((ny + time * 0.14) * 4.5) * 0.2 + 0.5;
    const drift = cellNoise(nx * 4.3, ny * 3.9, time * 0.3) * 0.06;
    return Math.min(1, Math.max(0, wave * 0.68 + band * 0.12 + drift));
}

tm.draw(() => {
    mouseNX += (targetNX - mouseNX) * 0.04;
    mouseNY += (targetNY - mouseNY) * 0.04;

    tm.background(0, 0, 0, 0);

    const time = tm.frameCount * 0.01;
    const ox = mouseNX - 0.5;
    const oy = mouseNY - 0.5;

    for (let gridY = 0; gridY < tm.grid.rows; gridY++) {
        for (let gridX = 0; gridX < tm.grid.cols; gridX++) {
            const nx = gridX / tm.grid.cols - 0.5;
            const ny = gridY / tm.grid.rows - 0.5;
            const distToCursor = Math.sqrt((nx - ox) ** 2 + (ny - oy) ** 2);
            const clearRadius = 0.24;
            const clearFalloff = 0.28;
            const clearing = Math.max(0, 1 - distToCursor / clearRadius) / (1 + distToCursor / clearFalloff);
            const clearAmount = clearing * 0.65;

            // soft vignette: fade toward lighter chars at edges
            const edgeX = Math.abs(nx) * 2;
            const edgeY = Math.abs(ny) * 2;
            const edgeDist = Math.max(edgeX, edgeY);
            const vignette = Math.pow(Math.max(0, edgeDist - 0.55) / 0.45, 1.6) * 0.7;

            const intensity = Math.min(1, Math.max(0,
                getDitherIntensity(nx, ny, time) - clearAmount - vignette
            ));

            const charIndex = Math.round(intensity * (DITHER_CHARS.length - 1));
            tm.charColor(120, 120, 120);
            tm.char(DITHER_CHARS[charIndex]);

            const cx = (gridX + 1) - tm.grid.cols / 2;
            const cy = gridY - tm.grid.rows / 2;

            tm.push();
            tm.translate(cx, cy, 0);
            tm.rect(1, 1);
            tm.pop();
        }
    }
});

new ResizeObserver(() => {
    const r = section.getBoundingClientRect();
    canvas.width = r.width;
    canvas.height = r.height;
    tm.resizeCanvas(r.width, r.height);
}).observe(section);
