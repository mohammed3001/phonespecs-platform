/**
 * Basic spam detection for user-generated content.
 * Returns a score from 0 (clean) to 1 (definitely spam).
 */
export function getSpamScore(content: string): number {
  let score = 0;
  const text = content.toLowerCase();

  // Link density
  const linkCount = (text.match(/https?:\/\//g) || []).length;
  if (linkCount > 2) score += 0.3;
  if (linkCount > 5) score += 0.3;

  // ALL CAPS ratio
  const capsRatio = (content.match(/[A-Z]/g) || []).length / Math.max(content.length, 1);
  if (capsRatio > 0.6 && content.length > 20) score += 0.2;

  // Repetitive characters (e.g., "aaaaaa")
  if (/(.)\1{5,}/.test(text)) score += 0.2;

  // Spam keywords
  const spamWords = [
    "buy now", "click here", "free money", "make money", "earn money",
    "casino", "viagra", "crypto", "invest now", "limited offer",
    "act now", "congratulations you won", "winner", "cheap price",
  ];
  const spamMatches = spamWords.filter((w) => text.includes(w)).length;
  if (spamMatches > 0) score += 0.2 * Math.min(spamMatches, 3);

  // Very short content (likely not a real review)
  if (content.trim().length < 10) score += 0.15;

  // Phone number pattern
  if (/\+?\d{10,}/.test(text)) score += 0.15;

  // Email in content
  if (/\S+@\S+\.\S+/.test(text)) score += 0.1;

  return Math.min(score, 1);
}

/**
 * Check if content should be auto-flagged for moderation.
 */
export function shouldAutoFlag(content: string): { flag: boolean; reason?: string } {
  const spamScore = getSpamScore(content);

  if (spamScore >= 0.6) {
    return { flag: true, reason: "High spam score" };
  }

  // Profanity check (basic)
  const profanityPatterns = [
    /\bf+u+c+k+/i, /\bs+h+i+t+/i, /\ba+s+s+h+o+l+e/i,
  ];
  for (const pattern of profanityPatterns) {
    if (pattern.test(content)) {
      return { flag: true, reason: "Potential profanity detected" };
    }
  }

  return { flag: false };
}

/**
 * Sanitize user-generated content.
 * Removes HTML tags, limits length.
 */
export function sanitizeContent(content: string, maxLength = 5000): string {
  return content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim()
    .slice(0, maxLength);
}
