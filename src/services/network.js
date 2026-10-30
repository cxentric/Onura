/**
 * Real connections between CXentric members (Supabase). The founder is connected to everyone
 * and that connection can't be removed; the database enforces it.
 */
import { getSupabase } from './auth';

export async function rpc(name, args) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}

/** { connections, incoming, outgoing }: lists of { id, name, headline, avatar, isFounder, since }. */
export const myNetwork = () => rpc('my_network');
export const searchMembers = (query) => rpc('search_members', { p_query: query });
export const requestConnection = (id) => rpc('connect_request', { p_other: id });
export const respondToRequest = (id, accept) => rpc('connect_respond', { p_other: id, p_accept: accept });
export const removeConnection = (id) => rpc('connect_remove', { p_other: id });

export async function getMyCard(userId) {
  const supabase = await getSupabase();
  const { data } = await supabase.from('member_profiles').select('display_name, headline').eq('id', userId).maybeSingle();
  return data || { display_name: '', headline: '' };
}

export async function saveMyCard(userId, { display_name, headline }) {
  return saveMyProfile(userId, { display_name, headline });
}

const PROFILE_FIELDS = 'display_name, headline, avatar_url, bio, location, industry, website, skills, created_at';

/** The signed-in member's full profile row. */
export async function getMyProfile(userId) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('member_profiles').select(PROFILE_FIELDS).eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

const LIMITS = { display_name: 80, headline: 140, bio: 2000, location: 80, industry: 60, website: 200 };

/** Saves any of: display_name, headline, bio, location, industry, website, skills (array of strings). */
export async function saveMyProfile(userId, fields) {
  const update = { updated_at: new Date().toISOString() };
  for (const [key, max] of Object.entries(LIMITS)) {
    if (fields[key] !== undefined) update[key] = String(fields[key] ?? '').trim().slice(0, max);
  }
  if (update.website && !/^https?:\/\//i.test(update.website)) update.website = `https://${update.website}`;
  if (fields.skills !== undefined) update.skills = fields.skills.map((skill) => skill.trim().slice(0, 40)).filter(Boolean).slice(0, 30);

  const supabase = await getSupabase();
  const { error } = await supabase.from('member_profiles').update(update).eq('id', userId);
  if (error) throw new Error(error.message.includes('website_check') ? 'Enter a website starting with https://' : error.message);
}

/** { posts, connections } for the signed-in member. */
export const myProfileStats = () => rpc('my_profile_stats');
