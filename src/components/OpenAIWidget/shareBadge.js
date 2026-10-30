/**
 * Pro: a Readiness badge image to post on LinkedIn, WhatsApp and so on.
 * Drawn in the browser, then shared with the phone's share sheet, or downloaded on desktop.
 */
const SITE = 'www.cxentric.in';

function drawBadge({ percent, role, industry, streak }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 628; // LinkedIn's link-image size
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 1200, 628);
  bg.addColorStop(0, '#1D4ED8');
  bg.addColorStop(1, '#2563EB');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 628);

  // Readiness ring
  const cx = 300, cy = 314, r = 170;
  ctx.lineWidth = 36;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#FBBF24';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * percent) / 100);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = 'bold 96px system-ui, sans-serif';
  ctx.fillText(`${percent}%`, cx, cy + 20);
  ctx.font = '600 30px system-ui, sans-serif';
  ctx.fillText('job-ready', cx, cy + 66);

  ctx.textAlign = 'left';
  ctx.font = '600 34px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('My CXentric Readiness Score', 560, 200);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 56px system-ui, sans-serif';
  ctx.fillText(role, 560, 280, 600);
  ctx.font = '500 40px system-ui, sans-serif';
  ctx.fillText(`in ${industry}`, 560, 340, 600);
  if (streak > 0) {
    ctx.font = '600 34px system-ui, sans-serif';
    ctx.fillStyle = '#FDBA74';
    ctx.fillText(`🔥 ${streak}-day learning streak`, 560, 420, 600);
  }
  ctx.font = '500 28px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(`Practise with me at ${SITE}`, 560, 520, 600);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/** Resolves with 'shared', 'downloaded' or 'cancelled'. */
export async function shareReadinessBadge(details) {
  const blob = await drawBadge(details);
  const file = new File([blob], 'cxentric-readiness.png', { type: 'image/png' });
  const text = `I'm ${details.percent}% job-ready for ${details.role} in ${details.industry} on CXentric. Practise with me at https://${SITE}`;

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch {
      return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard blocked; the image still downloaded.
  }
  return 'downloaded';
}
