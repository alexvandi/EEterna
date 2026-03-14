import { supabase } from './supabase';

// ============================================
// TYPES
// ============================================
export type Profile = {
  id: string;
  qr_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  death_date: string;
  epitaph: string;
  biography: string;
  profile_image_url: string;
  background_image_url: string;
  owner_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Media = {
  id: string;
  profile_id: string;
  visitor_name: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
  is_private: boolean;
  likes_count: number;
  created_at: string;
};

export type Message = {
  id: string;
  profile_id: string;
  visitor_name: string;
  visitor_avatar_url: string;
  type: 'text' | 'audio';
  content: string;
  is_private: boolean;
  likes_count: number;
  created_at: string;
};

export type ProfileAccess = {
  id: string;
  profile_id: string;
  user_email: string;
  role: 'owner' | 'editor' | 'viewer';
  is_active: boolean;
  granted_by: string | null;
  created_at: string;
};

export type AccessRequest = {
  id: string;
  profile_id: string;
  requester_name: string;
  requester_email: string;
  status: 'pending' | 'approved' | 'denied';
  message: string | null;
  created_at: string;
  updated_at: string;
};

export type QrCode = {
  id: string;
  code: string;
  is_registered: boolean;
  profile_id: string | null;
  created_at: string;
};

// ============================================
// PROFILES
// ============================================
export async function getProfileByQrId(qrId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('qr_id', qrId)
    .single();
  if (error) return null;
  return data;
}

export async function createProfile(profile: {
  qr_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  death_date: string;
  epitaph?: string;
  biography?: string;
  profile_image_url?: string;
  background_image_url?: string;
  owner_email?: string;
}): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile])
    .select()
    .single();
  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  // Mark the QR code as registered
  await supabase
    .from('qr_codes')
    .update({ is_registered: true, profile_id: data.id })
    .eq('code', profile.qr_id);

  return data;
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
}

// ============================================
// QR CODES
// ============================================
export async function getQrCode(code: string): Promise<QrCode | null> {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('code', code)
    .single();
  if (error) return null;
  return data;
}

export async function getAllQrCodes(): Promise<QrCode[]> {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) return [];
  return data || [];
}

// ============================================
// MEDIA
// ============================================
export async function getMediaForProfile(profileId: string): Promise<Media[]> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function addMedia(media: {
  profile_id: string;
  visitor_name: string;
  type: 'photo' | 'video';
  url: string;
  caption?: string;
  is_private?: boolean;
}): Promise<Media | null> {
  const { data, error } = await supabase
    .from('media')
    .insert([media])
    .select()
    .single();
  if (error) {
    console.error('Error adding media:', error);
    return null;
  }
  return data;
}

// ============================================
// MESSAGES
// ============================================
export async function getMessagesForProfile(profileId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function addMessage(message: {
  profile_id: string;
  visitor_name: string;
  type?: 'text' | 'audio';
  content: string;
  is_private?: boolean;
}): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ ...message, type: message.type || 'text' }])
    .select()
    .single();
  if (error) {
    console.error('Error adding message:', error);
    return null;
  }
  return data;
}

// ============================================
// LIKES
// ============================================
export async function toggleMediaLike(mediaId: string, visitorName: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('media_likes')
    .select('id')
    .eq('media_id', mediaId)
    .eq('visitor_name', visitorName)
    .single();

  if (existing) {
    await supabase.from('media_likes').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('media_likes').insert([{ media_id: mediaId, visitor_name: visitorName }]);
    return true;
  }
}

export async function toggleMessageLike(messageId: string, visitorName: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('message_likes')
    .select('id')
    .eq('message_id', messageId)
    .eq('visitor_name', visitorName)
    .single();

  if (existing) {
    await supabase.from('message_likes').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('message_likes').insert([{ message_id: messageId, visitor_name: visitorName }]);
    return true;
  }
}

// ============================================
// PROFILE ACCESS / PERMISSIONS
// ============================================
export async function getProfileAccess(profileId: string): Promise<ProfileAccess[]> {
  const { data, error } = await supabase
    .from('profile_access')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return data || [];
}

export async function addProfileAccess(access: {
  profile_id: string;
  user_email: string;
  role: 'owner' | 'editor' | 'viewer';
  granted_by?: string;
}): Promise<ProfileAccess | null> {
  const { data, error } = await supabase
    .from('profile_access')
    .insert([access])
    .select()
    .single();
  if (error) {
    console.error('Error adding access:', error);
    return null;
  }
  return data;
}

export async function removeProfileAccess(accessId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profile_access')
    .delete()
    .eq('id', accessId);
  return !error;
}

export async function updateProfileAccessRole(accessId: string, role: 'editor' | 'viewer'): Promise<boolean> {
  const { error } = await supabase
    .from('profile_access')
    .update({ role })
    .eq('id', accessId);
  return !error;
}

export async function checkUserAccess(profileId: string, email: string): Promise<ProfileAccess | null> {
  const { data, error } = await supabase
    .from('profile_access')
    .select('*')
    .eq('profile_id', profileId)
    .eq('user_email', email)
    .eq('is_active', true)
    .single();
  if (error) return null;
  return data;
}

// ============================================
// ACCESS REQUESTS (notifications)
// ============================================
export async function createAccessRequest(request: {
  profile_id: string;
  requester_name: string;
  requester_email: string;
  message?: string;
}): Promise<AccessRequest | null> {
  // Check if already requested
  const { data: existing } = await supabase
    .from('access_requests')
    .select('*')
    .eq('profile_id', request.profile_id)
    .eq('requester_email', request.requester_email)
    .eq('status', 'pending')
    .single();

  if (existing) return existing; // Already pending

  const { data, error } = await supabase
    .from('access_requests')
    .insert([request])
    .select()
    .single();
  if (error) {
    console.error('Error creating access request:', error);
    return null;
  }
  return data;
}

export async function getAccessRequestsForProfile(profileId: string): Promise<AccessRequest[]> {
  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function getPendingRequestsCount(profileId: string): Promise<number> {
  const { count, error } = await supabase
    .from('access_requests')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('status', 'pending');
  if (error) return 0;
  return count || 0;
}

export async function approveAccessRequest(requestId: string): Promise<boolean> {
  // Get the request
  const { data: request } = await supabase
    .from('access_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!request) return false;

  // Update status
  const { error: updateError } = await supabase
    .from('access_requests')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', requestId);

  if (updateError) return false;

  // Grant viewer access
  await addProfileAccess({
    profile_id: request.profile_id,
    user_email: request.requester_email,
    role: 'viewer',
    granted_by: 'owner',
  });

  return true;
}

export async function denyAccessRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from('access_requests')
    .update({ status: 'denied', updated_at: new Date().toISOString() })
    .eq('id', requestId);
  return !error;
}

export async function checkExistingRequest(profileId: string, email: string): Promise<AccessRequest | null> {
  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .eq('profile_id', profileId)
    .eq('requester_email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

// ============================================
// STORAGE (file upload)
// ============================================
export async function uploadMediaFile(file: File, profileId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${profileId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('memorial-media')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('memorial-media')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// ============================================
// VISITOR (localStorage helper)
// ============================================
export function getVisitorName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('eterna_visitor');
}

export function setVisitorName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('eterna_visitor', name);
}

export function getVisitorEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('eterna_visitor_email');
}

export function setVisitorEmail(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('eterna_visitor_email', email);
}
