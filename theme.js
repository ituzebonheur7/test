// 1. Apply saved colors immediately to prevent "flash" of wrong colors
const savedSettings = JSON.parse(localStorage.getItem('ituzeSettings')) || {};
const savedAccent = savedSettings.customColor || '#00ff9c';
document.documentElement.style.setProperty('--accent', savedAccent);

// 2. Shared Matrix Background Logic
function initGlobalMatrix() {
  const canvas = document.getElementById('matrix');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let matrixInterval = null;

  function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const chars = "ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789";
  const fontSize = 16;
  let columns = canvas.width / fontSize;
  let drops = Array.from({ length: columns }, () => 1);

  function drawMatrix() {
      ctx.fillStyle = "rgba(0,0,0,0.03)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--matrix-color") || "#00ff9c";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
              drops[i] = 0;
          }
          drops[i]++;
      }
  }

  function startMatrix() {
      if (!matrixInterval) {
          matrixInterval = setInterval(drawMatrix, 35);
      }
  }

  function stopMatrix() {
      clearInterval(matrixInterval);
      matrixInterval = null;
  }

  const settings = JSON.parse(localStorage.getItem('ituzeSettings')) || {};
  if (!settings.matrix) {
      startMatrix();
  }

  window.addEventListener('matrixToggle', (e) => {
    if (e.detail.enabled) startMatrix();
    else stopMatrix();
  });

  document.addEventListener("visibilitychange", () => {
      const settings = JSON.parse(localStorage.getItem('ituzeSettings')) || {};
      if(document.hidden || settings.matrix) {
          stopMatrix();
      } else {
          startMatrix();
      }
  });
}

window.addEventListener('load', initGlobalMatrix);
