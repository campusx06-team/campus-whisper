/**
 * Campus Whisper — Content Filter with Auto-Reporting
 * Blocks inappropriate content and auto-reports to admin
 */

// ═══════════════════════════════════════════════════════════
// BAD WORDS LIST
// ═══════════════════════════════════════════════════════════

const BANNED_WORDS = [
  // Abusive language
  'ass', 'asshole', 'bastard', 'bitch', 'damn', 'dammit', 'fuck', 'fucking',
  'hell', 'shit', 'shitty', 'crap', 'bloody', 'arsehole', 'arse', 'piss',

  // Slurs and hate speech
  'nigger', 'nigg', 'faggot', 'fag', 'retard', 'dyke', 'whore', 'slut',

  // Threats and violence
  'kill', 'killing', 'killed', 'murder', 'rape', 'beating', 'punch',
  'hit', 'hurt', 'shoot', 'stab', 'burn', 'bomb',

  // Harassment
  'kys', 'kill yourself', 'die', 'loser', 'idiot', 'moron', 'stupid', 'dumb',

  // Sexual content (basic)
  'porn', 'xxx', 'nude', 'naked', 'sex',

  // Drug references
  'cocaine', 'heroin', 'meth', 'weed', 'loda',
];

/**
 * Check if text contains banned words
 * @param {string} text - Content to check
 * @returns {Object} { hasBadWords: boolean, foundWords: string[] }
 */
function checkBadWords(text) {
  if (!text || typeof text !== 'string') {
    return { hasBadWords: false, foundWords: [] };
  }

  const lowerText = text.toLowerCase();
  const foundWords = [];

  BANNED_WORDS.forEach(bannedWord => {
    const regex = new RegExp(`\\b${bannedWord}\\b`, 'gi');
    if (regex.test(lowerText)) {
      if (!foundWords.includes(bannedWord)) {
        foundWords.push(bannedWord);
      }
    }
  });

  return {
    hasBadWords: foundWords.length > 0,
    foundWords: foundWords,
  };
}

// ═══════════════════════════════════════════════════════════
// IMPORT SUPABASE (make sure this matches your setup)
// ═══════════════════════════════════════════════════════════

// Assuming you have Supabase configured somewhere
// If not, initialize it here:
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// For now, we'll use a global supabase instance
// Make sure it's available before calling these functions

// ═══════════════════════════════════════════════════════════
// POST CREATION WITH BAD WORD FILTERING
// ═══════════════════════════════════════════════════════════

/**
 * Create a post with content filtering
 * If content has bad words: auto-report to reports table
 * If content is clean: insert into posts table normally
 *
 * @param {string} content - Post content
 * @param {string} userId - User ID from auth
 * @param {Object} metadata - Post metadata (tag, imageUrl, etc)
 * @returns {Promise<Object>} { success, post, blocked, error }
 */
async function createPostWithFiltering(content, userId, metadata = {}) {
  try {
    // Input validation
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        blocked: false,
        error: 'Post content cannot be empty',
      };
    }

    if (!userId) {
      return {
        success: false,
        blocked: false,
        error: 'User must be authenticated',
      };
    }

    if (content.length > 500) {
      return {
        success: false,
        blocked: false,
        error: 'Post content exceeds 500 characters',
      };
    }

    // Check for bad words
    const { hasBadWords, foundWords } = checkBadWords(content);

    // If bad words found, auto-report instead of creating post
    if (hasBadWords) {
      return await autoReportPost(content, userId, foundWords, metadata);
    }

    // Content is clean - create post normally
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          content: content.trim(),
          user_id: userId,
          tag: metadata.tag || null,
          imageUrl: metadata.imageUrl || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Create post error:', error);
      return {
        success: false,
        blocked: false,
        error: error.message,
      };
    }

    return {
      success: true,
      blocked: false,
      post: data[0],
    };
  } catch (err) {
    console.error('Unexpected error creating post:', err);
    return {
      success: false,
      blocked: false,
      error: 'Failed to create post',
    };
  }
}

/**
 * Auto-report a post with bad words to the reports table
 * @param {string} content - Offensive content
 * @param {string} userId - User who tried to post
 * @param {string[]} foundWords - Bad words found
 * @param {Object} metadata - Post metadata
 * @returns {Promise<Object>}
 */
async function autoReportPost(content, userId, foundWords, metadata = {}) {
  try {
    const reportReason = `bad word detected: ${foundWords.join(', ')}`;

    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          post_id: null, // No post ID since we didn't create the post
          reason: 'auto_block',
          reported_by: userId,
          notes: reportReason,
          content: content, // Store the blocked content for admin review
          tag: metadata.tag || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Auto-report error:', error);
      return {
        success: false,
        blocked: true,
        error: 'Post blocked due to inappropriate content',
      };
    }

    return {
      success: true,
      blocked: true,
      error: 'Post blocked due to inappropriate content',
      report: data[0],
    };
  } catch (err) {
    console.error('Unexpected error auto-reporting:', err);
    return {
      success: false,
      blocked: true,
      error: 'Post blocked due to inappropriate content',
    };
  }
}

// ═══════════════════════════════════════════════════════════
// ADMIN: GET AUTO-REPORTED POSTS
// ═══════════════════════════════════════════════════════════

/**
 * Get all auto-reported posts (bad words detected)
 * @param {number} limit - Max reports to fetch
 * @param {number} offset - Pagination offset
 * @returns {Promise<Object>}
 */
async function getAutoReportedPosts(limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reason', 'auto_block')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get auto-reported posts error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      reports: data || [],
    };
  } catch (err) {
    console.error('Unexpected error fetching auto-reported posts:', err);
    return {
      success: false,
      error: 'Failed to fetch reported posts',
    };
  }
}

/**
 * Get ALL reported posts (manual + auto-reports)
 * @param {number} limit - Max reports
 * @param {number} offset - Pagination offset
 * @returns {Promise<Object>}
 */
async function getAllReports(limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get all reports error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Separate auto-blocked vs manual reports
    const autoBlocked = data.filter(r => r.reason === 'auto_block');
    const manualReports = data.filter(r => r.reason !== 'auto_block');

    return {
      success: true,
      reports: data || [],
      stats: {
        total: data.length,
        autoBlocked: autoBlocked.length,
        manualReports: manualReports.length,
      },
    };
  } catch (err) {
    console.error('Unexpected error fetching reports:', err);
    return {
      success: false,
      error: 'Failed to fetch reports',
    };
  }
}

/**
 * Admin: Review blocked post and decide action
 * @param {string} reportId - Report ID
 * @param {string} action - 'approve', 'reject', 'allow'
 * @returns {Promise<Object>}
 */
async function reviewAutoBlockedPost(reportId, action) {
  try {
    if (!['approve', 'reject', 'allow'].includes(action)) {
      return {
        success: false,
        error: 'Invalid action. Use: approve, reject, or allow',
      };
    }

    const actionTaken = action === 'allow' ? 'allowed' : 'blocked';

    const { data, error } = await supabase
      .from('reports')
      .update({
        reviewed: true,
        reviewed_at: new Date().toISOString(),
        action_taken: actionTaken,
      })
      .eq('id', reportId)
      .select();

    if (error) {
      console.error('Review error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: `Post ${actionTaken}`,
      report: data[0],
    };
  } catch (err) {
    console.error('Unexpected error reviewing post:', err);
    return {
      success: false,
      error: 'Failed to review post',
    };
  }
}

// ═══════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════

export {
  checkBadWords,
  createPostWithFiltering,
  autoReportPost,
  getAutoReportedPosts,
  getAllReports,
  reviewAutoBlockedPost,
  BANNED_WORDS,
};
