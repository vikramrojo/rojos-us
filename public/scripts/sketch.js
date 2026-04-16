/**
 * Hero canvas — subtle grayscale flow field
 * Mouse position pulls the wave origin.
 */

const canvas = document.getElementById("hero-canvas");
const section = document.getElementById("hero-section");

const rect = section.getBoundingClientRect();
canvas.width = rect.width;
canvas.height = rect.height;

const tm = window.textmode.create({
    canvas,
    width: canvas.width,
    height: canvas.height,
    fontSize: 16,
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

// Inner ring: mid-weight texture. Outer ring: sparse punctuation.
const INNER_CHARS = [' ', '░', '░', '▒', '▒', '▓'];
const OUTER_CHARS = [' ', ' ', '·', ':', '∘', '+'];

tm.draw(() => {
    mouseNX += (targetNX - mouseNX) * 0.04;
    mouseNY += (targetNY - mouseNY) * 0.04;

    tm.background(0, 0, 0, 0);

    const time = tm.frameCount * 0.008;
    const ox = mouseNX - 0.5;
    const oy = mouseNY - 0.5;

    for (let gridY = 0; gridY < tm.grid.rows; gridY++) {
        for (let gridX = 0; gridX < tm.grid.cols; gridX++) {
            const nx = gridX / tm.grid.cols - 0.5;
            const ny = gridY / tm.grid.rows - 0.5;

            const dx = nx - ox * 0.4;
            const dy = ny - oy * 0.3;
            const baseDist = Math.sqrt(dx * dx + dy * dy);

            // Warp the distance field with slow angle-based noise → blobs not circles
            const angle = Math.atan2(dy, dx);
            const warp =
                Math.sin(angle * 3 + time * 0.7) * 0.055 +
                Math.sin(angle * 5 - time * 0.4) * 0.03 +
                Math.sin(angle * 7 + time * 0.9) * 0.018;
            const dist = Math.max(0, baseDist + warp);

            // Inner ripple — tight, fast
            const inner = Math.sin(dist * 18 - time * 3.5) * 0.5 + 0.5;
            const innerProx = Math.max(0, 1 - dist * 4);

            // Outer ripple — slower, wider wavelength, offset phase
            const outer = Math.sin(dist * 8 - time * 1.8 + 1.2) * 0.5 + 0.5;
            const outerProx = Math.max(0, 1 - dist * 1.6) * (1 - innerProx);

            // Ambient drift fills the void beyond both rings
            const drift = Math.sin(nx * 5 + ny * 3 + time) * 0.5 + 0.5;
            const ambient = (1 - innerProx) * (1 - outerProx) * drift * 0.25;

            if (innerProx > 0.05) {
                const intensity = inner * innerProx;
                const charIndex = Math.floor(intensity * (INNER_CHARS.length - 1));
                const brightness = Math.floor(intensity * 90) + 15;
                tm.charColor(brightness, brightness, brightness);
                tm.char(INNER_CHARS[charIndex]);
            } else if (outerProx > 0.05) {
                const intensity = outer * outerProx;
                const charIndex = Math.floor(intensity * (OUTER_CHARS.length - 1));
                const brightness = Math.floor(intensity * 50) + 10;
                tm.charColor(brightness, brightness, brightness);
                tm.char(OUTER_CHARS[charIndex]);
            } else {
                const brightness = Math.floor(ambient * 35) + 5;
                tm.charColor(brightness, brightness, brightness);
                tm.char(ambient > 0.08 ? '·' : ' ');
            }

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
