/**
 * Pro: a Prep badge image to post on LinkedIn, WhatsApp and so on.
 * It shows effort and coverage (level, topics mastered, streak), never a readiness or hiring claim.
 * Drawn in the browser, then shared with the phone's share sheet, or downloaded on desktop.
 */
import { LEVELS } from '../../services/prepScore';

const SITE = 'cxentric.in';

function drawBadge({ score, role, industry, streak }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 628; // LinkedIn's link-image size
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 1200, 628);
  bg.addColorStop(0, '#1D4ED8');
  bg.addColorStop(1, '#2563EB');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 628);

  const left = 90, width = 1020;
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '600 34px system-ui, sans-serif';
  ctx.fillText(`${role} prep track · ${industry}`, left, 150, width);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 76px system-ui, sans-serif';
  ctx.fillText(score.level.label, left, 250, width);

  // Progress bar with a tick at each level
  const barY = 300, barH = 22;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.roundRect(left, barY, width, barH, barH / 2);
  ctx.fill();
  if (score.pct > 0) {
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.roundRect(left, barY, Math.max(barH, (width * score.pct) / 100), barH, barH / 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (const level of LEVELS.filter((l) => l.min > 0 && l.min < 100)) {
    ctx.fillRect(left + (width * level.min) / 100 - 2, barY - 8, 4, barH + 16);
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '500 38px system-ui, sans-serif';
  const streakText = streak > 0 ? ` · ${streak}-day streak` : '';
  ctx.fillText(`${score.correct}/${score.total} topics mastered${streakText}`, left, 400, width);

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '500 28px system-ui, sans-serif';
  ctx.fillText(`Practised on ${SITE}`, left, 530, width);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/** Resolves with 'shared', 'downloaded' or 'cancelled'. */
export async function sharePrepBadge(details) {
  const blob = await drawBadge(details);
  const file = new File([blob], 'cxentric-prep.png', { type: 'image/png' });
  const { score, role, industry } = details;
  const text = `My ${role} prep track (${industry}) on CXentric: ${score.level.label}, ${score.correct}/${score.total} topics mastered. Practise at https://www.${SITE}`;

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
