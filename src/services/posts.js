/**
 * Members' posts (Supabase). Members see their own and their connections' posts.
 * The super admin can also see every member's posts (scope 'all').
 */
import { rpc } from './network';

export const POST_MAX_LENGTH = 3000;

/** Newest first; pass the last post's createdAt as `before` for the next page. Scopes: connections, mine, all. */
export const loadFeed = ({ scope = 'connections', before = null, limit = 20 } = {}) =>
  rpc('feed', { p_scope: scope, p_before: before, p_limit: limit });

export const createPost = (body, niche = null) => rpc('create_post', { p_body: body, p_niche: niche });
export const deletePost = (id, reason = null) => rpc('delete_post', { p_id: id, p_reason: reason });
