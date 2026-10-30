/**
 * Real connections between CXentric members (Supabase). The founder is connected to everyone
 * and that connection can't be removed; the database enforces it.
 */
import { getSupabase } from './auth';

async function rpc(name, args) {
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
  const supabase = await getSupabase();
  const { error } = await supabase
    .from('member_profiles')
    .update({ display_name: display_name.trim().slice(0, 80), headline: headline.trim().slice(0, 140), updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}
