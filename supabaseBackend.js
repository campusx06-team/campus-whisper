/**
 * Campus Whisper — Supabase Backend
 * Anonymous campus social media app
 *
 * Authentication: Email OTP via Supabase Auth
 * Database: posts, reports
 */

import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════
// SUPABASE CONFIG
// ═══════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ═══════════════════════════════════════════════════════════
// AUTH — Email OTP Login
// ═══════════════════════════════════════════════════════════

/**
 * Send OTP to user's email
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendOTP(email) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error('OTP send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error sending OTP:', err);
    return { success: false, error: 'Failed to send OTP. Please try again.' };
  }
}

/**
 * Verify OTP and authenticate user
 * @param {string} email - User's email address
 * @param {string} token - 6-digit OTP code
 * @returns {Promise<{success: boolean, user?: any, error?: string}>}
 */
export async function verifyOTP(email, token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      console.error('OTP verification error:', error);
      return { success: false, error: error.message };
    }

    // user_id is securely stored in Supabase Auth
    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        usersMetadata: data.user.user_metadata,
      },
    };
  } catch (err) {
    console.error('Unexpected error verifying OTP:', err);
    return { success: false, error: 'Verification failed. Please try again.' };
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<{loggedIn: boolean, user?: any}>}
 */
export async function checkAuth() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { loggedIn: false };
    }

    if (!data.session) {
      return { loggedIn: false };
    }

    return {
      loggedIn: true,
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
      },
    };
  } catch (err) {
    console.error('Auth check error:', err);
    return { loggedIn: false };
  }
}

/**
 * Logout current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error logging out:', err);
    return { success: false, error: 'Logout failed' };
  }
}

// ═══════════════════════════════════════════════════════════
// POSTS — CRUD Operations
// ═══════════════════════════════════════════════════════════

/**
 * Create a new post
 * @param {string} content - Post content/text
 * @param {string} userId - User ID from auth
 * @param {Object} metadata - Optional metadata (tag, imageUrl, etc.)
 * @returns {Promise<{success: boolean, post?: any, error?: string}>}
 */
export async function createPost(content, userId, metadata = {}) {
  try {
    // Validate inputs
    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Post content cannot be empty' };
    }
    if (!userId) {
      return { success: false, error: 'User must be authenticated' };
    }
    if (content.length > 500) {
      return { success: false, error: 'Post content exceeds 500 characters' };
    }

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
      return { success: false, error: error.message };
    }

    return {
      success: true,
      post: data[0],
    };
  } catch (err) {
    console.error('Unexpected error creating post:', err);
    return { success: false, error: 'Failed to create post' };
  }
}

/**
 * Get all posts sorted by newest
 * @param {number} limit - Max posts to return (default: 50)
 * @param {number} offset - Pagination offset (default: 0)
 * @returns {Promise<{success: boolean, posts?: any[], error?: string}>}
 */
export async function getPosts(limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get posts error:', error);
      return { success: false, error: error.message };
    }

    // Return posts WITHOUT revealing user_id to prevent deanonymization
    // Only include necessary fields for display
    const sanitizedPosts = data.map(post => ({
      id: post.id,
      content: post.content,
      tag: post.tag,
      imageUrl: post.imageUrl,
      created_at: post.created_at,
      likes: post.likes || 0,
      comments: post.comments || 0,
      reports: post.reports || 0,
      // user_id intentionally NOT included in public response
    }));

    return {
      success: true,
      posts: sanitizedPosts,
    };
  } catch (err) {
    console.error('Unexpected error fetching posts:', err);
    return { success: false, error: 'Failed to fetch posts' };
  }
}

/**
 * Get a single post by ID
 * @param {string} postId - Post UUID
 * @returns {Promise<{success: boolean, post?: any, error?: string}>}
 */
export async function getPost(postId) {
  try {
    if (!postId) {
      return { success: false, error: 'Post ID is required' };
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Get post error:', error);
      return { success: false, error: 'Post not found' };
    }

    // Sanitize response
    const sanitized = {
      id: data.id,
      content: data.content,
      tag: data.tag,
      imageUrl: data.imageUrl,
      created_at: data.created_at,
      likes: data.likes || 0,
      comments: data.comments || 0,
    };

    return { success: true, post: sanitized };
  } catch (err) {
    console.error('Unexpected error fetching post:', err);
    return { success: false, error: 'Failed to fetch post' };
  }
}

/**
 * Delete a post (only by owner or admin)
 * @param {string} postId - Post UUID
 * @param {string} userId - Current user ID
 * @param {boolean} isAdmin - Is user an admin
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deletePost(postId, userId, isAdmin = false) {
  try {
    if (!postId || !userId) {
      return { success: false, error: 'Post ID and user ID are required' };
    }

    // Check ownership if not admin
    if (!isAdmin) {
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (!post || post.user_id !== userId) {
        return { success: false, error: 'Unauthorized: Cannot delete this post' };
      }
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Delete post error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error deleting post:', err);
    return { success: false, error: 'Failed to delete post' };
  }
}

// ═══════════════════════════════════════════════════════════
// REPORTS — Flag Posts
// ═══════════════════════════════════════════════════════════

/**
 * Report a post
 * @param {string} postId - Post UUID
 * @param {string} reason - Report reason (hate, spam, personal, inappropriate, other)
 * @param {string} userId - User making report (optional, for duplicate prevention)
 * @returns {Promise<{success: boolean, report?: any, error?: string}>}
 */
export async function reportPost(postId, reason, userId = null) {
  try {
    // Validate inputs
    if (!postId) {
      return { success: false, error: 'Post ID is required' };
    }

    const validReasons = ['hate', 'spam', 'personal', 'inappropriate', 'other'];
    if (!validReasons.includes(reason)) {
      return { success: false, error: 'Invalid report reason' };
    }

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    // Check for duplicate report (if userId provided)
    if (userId) {
      const { data: existing } = await supabase
        .from('reports')
        .select('id')
        .eq('post_id', postId)
        .eq('reported_by', userId)
        .single();

      if (existing) {
        return { success: false, error: 'You have already reported this post' };
      }
    }

    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          post_id: postId,
          reason,
          reported_by: userId || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Report post error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      report: data[0],
    };
  } catch (err) {
    console.error('Unexpected error reporting post:', err);
    return { success: false, error: 'Failed to report post' };
  }
}

/**
 * Get all reported posts (admin only)
 * @param {string} adminToken - Admin authentication (checked via RLS policy)
 * @param {number} limit - Max reports to return (default: 50)
 * @param {number} offset - Pagination offset (default: 0)
 * @returns {Promise<{success: boolean, reports?: any[], error?: string}>}
 */
export async function getReportedPosts(limit = 50, offset = 0) {
  try {
    // This should be gated by RLS policy in Supabase
    // Only admin users can access this endpoint

    const { data, error } = await supabase
      .from('reports')
      .select(`
        id,
        post_id,
        reason,
        created_at,
        posts!post_id (
          id,
          content,
          user_id,
          tag,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get reported posts error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      reports: data,
    };
  } catch (err) {
    console.error('Unexpected error fetching reported posts:', err);
    return { success: false, error: 'Failed to fetch reported posts' };
  }
}

/**
 * Get report count for a post
 * @param {string} postId - Post UUID
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
export async function getReportCount(postId) {
  try {
    if (!postId) {
      return { success: false, error: 'Post ID is required' };
    }

    const { count, error } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      console.error('Get report count error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      count: count || 0,
    };
  } catch (err) {
    console.error('Unexpected error fetching report count:', err);
    return { success: false, error: 'Failed to fetch report count' };
  }
}

// ═══════════════════════════════════════════════════════════
// ADMIN — User Reveal
// ═══════════════════════════════════════════════════════════

/**
 * Reveal user identity for a post (admin only)
 * Must be gated by RLS policy in Supabase
 * @param {string} postId - Post UUID
 * @returns {Promise<{success: boolean, userId?: string, email?: string, error?: string}>}
 */
export async function revealUser(postId) {
  try {
    if (!postId) {
      return { success: false, error: 'Post ID is required' };
    }

    // Fetch the post with user_id
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id, id')
      .eq('id', postId)
      .single();

    if (postError) {
      console.error('Post fetch error:', postError);
      return { success: false, error: 'Post not found' };
    }

    if (!post || !post.user_id) {
      return { success: false, error: 'Cannot reveal deleted post user' };
    }

    // Fetch user info from auth.users (requires admin context)
    // This should be done server-side with admin token
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(post.user_id);

    if (authError || !authUser) {
      console.error('User lookup error:', authError);
      return { success: false, error: 'User information not found' };
    }

    return {
      success: true,
      userId: authUser.user.id,
      email: authUser.user.email,
      name: authUser.user.user_metadata?.name || 'Unknown',
    };
  } catch (err) {
    console.error('Unexpected error revealing user:', err);
    return { success: false, error: 'Failed to reveal user identity' };
  }
}

/**
 * Get user's own posts
 * @param {string} userId - User ID from auth
 * @returns {Promise<{success: boolean, posts?: any[], error?: string}>}
 */
export async function getUserPosts(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user posts error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      posts: data,
    };
  } catch (err) {
    console.error('Unexpected error fetching user posts:', err);
    return { success: false, error: 'Failed to fetch your posts' };
  }
}

// ═══════════════════════════════════════════════════════════
// ENGAGEMENT — Likes, Comments, etc.
// ═══════════════════════════════════════════════════════════

/**
 * Increment like count for a post
 * @param {string} postId - Post UUID
 * @returns {Promise<{success: boolean, likes?: number, error?: string}>}
 */
export async function likePost(postId) {
  try {
    if (!postId) {
      return { success: false, error: 'Post ID is required' };
    }

    const { data, error } = await supabase
      .from('posts')
      .update({ likes: 'likes + 1' })
      .eq('id', postId)
      .select('likes');

    if (error) {
      console.error('Like post error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      likes: data[0]?.likes || 0,
    };
  } catch (err) {
    console.error('Unexpected error liking post:', err);
    return { success: false, error: 'Failed to like post' };
  }
}

/**
 * Increment comment count for a post
 * @param {string} postId - Post UUID
 * @returns {Promise<{success: boolean, comments?: number, error?: string}>}
 */
export async function incrementComments(postId) {
  try {
    if (!postId) {
      return { success: false, error: 'Post ID is required' };
    }

    const { data, error } = await supabase
      .from('posts')
      .update({ comments: 'comments + 1' })
      .eq('id', postId)
      .select('comments');

    if (error) {
      console.error('Increment comments error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      comments: data[0]?.comments || 0,
    };
  } catch (err) {
    console.error('Unexpected error incrementing comments:', err);
    return { success: false, error: 'Failed to update comment count' };
  }
}

// ═══════════════════════════════════════════════════════════
// EXPORT ALL FUNCTIONS
// ═══════════════════════════════════════════════════════════

export default {
  // Auth
  sendOTP,
  verifyOTP,
  checkAuth,
  logout,

  // Posts
  createPost,
  getPosts,
  getPost,
  deletePost,
  getUserPosts,

  // Reports
  reportPost,
  getReportedPosts,
  getReportCount,

  // Admin
  revealUser,

  // Engagement
  likePost,
  incrementComments,
};
