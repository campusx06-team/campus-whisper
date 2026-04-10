/**
 * Campus Whisper — Bad Word Filter
 * Content Moderation for Community Safety
 */

// ═══════════════════════════════════════════════════════════
// BANNED WORDS LIST
// ═══════════════════════════════════════════════════════════

const BANNED_WORDS = [
  // Abusive language
  'ass', 'asshole', 'bastard', 'bitch', 'damn', 'dammit', 'fuck', 'fucking',
  'hell', 'shit', 'shitty', 'crap', 'bloody', 'arsehole', 'arse',

  // Slurs and hate speech (abbreviated to avoid storing explicit content)
  'n*gger', 'n*gg*', 'f*g', 'r*tard', 'd*ke', 'wh*re', 'sl*t', 'c*ck',

  // Threats and violence
  'kill', 'killing', 'killed', 'murder', 'rape', 'beating', 'punch you',
  'hit you', 'hurt you', 'shoot you', 'stab you',

  // Harassment and bullying
  'kys', 'kill yourself', 'die', 'you suck', 'loser', 'idiot', 'moron',
  'retard', 'stupid', 'dumb', 'worthless',

  // Sexual content (basic filter)
  'porn', 'xxx', 'sex', 'nude', 'naked', 'horny', 'orgasm',

  // Drug references
  'cocaine', 'heroin', 'meth', 'crystal meth', 'weed', 'marijuana',
  'acid', 'lsd', 'mdma', 'ecstasy', 'molly',

  // Bomb/weapon threats
  'bomb', 'explosion', 'terrorist', 'gun down', 'shoot up',

  // Self-harm
  'suicide', 'self harm', 'cutting', 'overdose',
];

// ═══════════════════════════════════════════════════════════
// FILTER FUNCTION
// ═══════════════════════════════════════════════════════════

/**
 * Check if text contains banned/inappropriate words
 * @param {string} text - Content to check
 * @returns {Object} { hasBadWords: boolean, foundWords: string[] }
 */
function checkBadWords(text) {
  if (!text || typeof text !== 'string') {
    return { hasBadWords: false, foundWords: [] };
  }

  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();

  // Split text into words, removing punctuation
  const words = lowerText.match(/\b\w+\b/g) || [];

  // Find all banned words in the text
  const foundWords = [];

  BANNED_WORDS.forEach(bannedWord => {
    // Check exact word match (word boundary)
    const regex = new RegExp(`\\b${bannedWord.replace(/\*/g, '[a-z]')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      foundWords.push(bannedWord);
    }
  });

  return {
    hasBadWords: foundWords.length > 0,
    foundWords: [...new Set(foundWords)], // Remove duplicates
  };
}

/**
 * Get user-friendly error message
 * @param {string[]} foundWords - List of banned words found
 * @returns {string} Error message
 */
function getBadWordsMessage(foundWords) {
  if (foundWords.length === 0) {
    return 'Your post contains inappropriate content. Please revise and try again.';
  }

  if (foundWords.length === 1) {
    return `Your post contains inappropriate language ("${foundWords[0]}"). Please revise and try again.`;
  }

  return `Your post contains inappropriate content. Please revise and try again.`;
}

/**
 * Validate post content (combines bad words filter + length check)
 * @param {string} content - Post content
 * @returns {Object} { valid: boolean, error: string | null }
 */
function validatePostContent(content) {
  // Check if empty
  if (!content || content.trim().length === 0) {
    return {
      valid: false,
      error: 'Please write your whisper',
    };
  }

  // Check length
  if (content.length > 500) {
    return {
      valid: false,
      error: 'Post content exceeds 500 characters',
    };
  }

  // Check for bad words
  const { hasBadWords, foundWords } = checkBadWords(content);
  if (hasBadWords) {
    return {
      valid: false,
      error: getBadWordsMessage(foundWords),
    };
  }

  return {
    valid: true,
    error: null,
  };
}

// ═══════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════

export {
  checkBadWords,
  validatePostContent,
  getBadWordsMessage,
  BANNED_WORDS,
};
