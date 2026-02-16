// This runs on every page (Index, Settings, Games)
function applyGlobalSettings() {
    const settings = JSON.parse(localStorage.getItem('ituzeSettings')) || {};
    const savedColor = settings.customColor || "#00ff9c";
    const matrixEnabled = !settings.matrix;

    // Apply the accent color to the whole site
    document.documentElement.style.setProperty('--accent', savedColor);

    // Initialize Matrix if enabled
    if (matrixEnabled) {
        initMatrix(); 
    }
}

function initMatrix() {
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
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent') || "#00ff9c";
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

  startMatrix();

  document.addEventListener("visibilitychange", () => {
      if(document.hidden) {
          stopMatrix();
      } else {
          startMatrix();
      }
  });
}

window.addEventListener('load', applyGlobalSettings);
