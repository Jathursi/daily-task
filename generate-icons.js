const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient (from #1B1931 to slightly lighter)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#1B1931');
  gradient.addColorStop(1, '#2a2645');

  // Rounded rectangle background
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Orange to red gradient circle
  const circleRadius = size * 0.35;
  const centerX = size / 2;
  const centerY = size / 2 - size * 0.05;

  const iconGradient = ctx.createLinearGradient(
    centerX - circleRadius,
    centerY - circleRadius,
    centerX + circleRadius,
    centerY + circleRadius
  );
  iconGradient.addColorStop(0, '#ED9E59');
  iconGradient.addColorStop(1, '#A34054');

  ctx.beginPath();
  ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
  ctx.fillStyle = iconGradient;
  ctx.fill();

  // Sparkles icon (simplified)
  const sparkSize = size * 0.25;
  const sparkX = centerX;
  const sparkY = centerY;

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = size * 0.04;
  ctx.lineCap = 'round';

  // Vertical line
  ctx.beginPath();
  ctx.moveTo(sparkX, sparkY - sparkSize / 2);
  ctx.lineTo(sparkX, sparkY + sparkSize / 2);
  ctx.stroke();

  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(sparkX - sparkSize / 2, sparkY);
  ctx.lineTo(sparkX + sparkSize / 2, sparkY);
  ctx.stroke();

  // Diagonal lines
  const diagOffset = sparkSize * 0.35;
  ctx.beginPath();
  ctx.moveTo(sparkX - diagOffset, sparkY - diagOffset);
  ctx.lineTo(sparkX + diagOffset, sparkY + diagOffset);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(sparkX + diagOffset, sparkY - diagOffset);
  ctx.lineTo(sparkX - diagOffset, sparkY + diagOffset);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

const publicDir = path.join(__dirname, 'public');

sizes.forEach(size => {
  const buffer = createIcon(size);
  fs.writeFileSync(path.join(publicDir, `icon-${size}.png`), buffer);
  fs.writeFileSync(path.join(publicDir, `icon-${size}-maskable.png`), buffer);
  console.log(`Created icon-${size}.png and icon-${size}-maskable.png`);
});

console.log('Icons created successfully!');
