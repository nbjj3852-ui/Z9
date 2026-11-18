const { createCanvas } = require('@napi-rs/canvas');
function createPanelImage(title, subtitle = '© Z9 Server • الحقوق محفوظة') {
  const canvas = createCanvas(1200, 360); const ctx = canvas.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 1200, 360); bg.addColorStop(0, '#090712'); bg.addColorStop(0.48, '#28102d'); bg.addColorStop(1, '#080a14');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1200, 360);
  ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#ff70c8'; ctx.beginPath(); ctx.arc(990, 90, 100, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 0.45; ctx.fillStyle = '#ffe6f7'; ctx.beginPath(); ctx.arc(960, 70, 78, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  // Soft neon arcs and Japanese-inspired skyline.
  for (let i = 0; i < 5; i++) { ctx.strokeStyle = `rgba(255,95,190,${0.10 + i * 0.035})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-40, 250 + i * 16); ctx.bezierCurveTo(240, 150 + i * 10, 440, 390 - i * 5, 720, 250 + i * 8); ctx.bezierCurveTo(900, 180 + i * 5, 1060, 290 + i * 3, 1240, 220 + i * 8); ctx.stroke(); }
  // Sakura petals scattered around the border.
  for (let i = 0; i < 95; i++) { const x = (i * 137 + 31) % 1200; const y = (i * 71 + 19) % 360; const r = 3 + (i % 5); ctx.save(); ctx.translate(x, y); ctx.rotate((i % 9) * 0.31); ctx.fillStyle = i % 3 === 0 ? 'rgba(255,224,246,.82)' : 'rgba(255,69,171,.78)'; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.45, r, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  ctx.textAlign = 'center'; ctx.shadowColor = '#ff45bb'; ctx.shadowBlur = 24; ctx.fillStyle = '#fff7fd'; ctx.font = 'bold 82px Arial'; ctx.fillText('Z9', 600, 135); ctx.shadowBlur = 12; ctx.font = 'bold 36px Arial'; ctx.fillStyle = '#ff9bd8'; ctx.fillText('SERVER', 600, 180); ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; ctx.font = 'bold 31px Arial'; ctx.fillText(String(title).slice(0, 52), 600, 252); ctx.font = '20px Arial'; ctx.fillStyle = '#f6cbe7'; ctx.fillText(String(subtitle).slice(0, 90), 600, 300);
  return canvas.toBuffer('image/png');
}
module.exports = { createPanelImage };
