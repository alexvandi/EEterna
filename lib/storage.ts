export type DeceasedProfile = {
    id: string;
    qrId: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    deathDate: string;
    epitaph: string;
    profileImage: string;
    backgroundImage: string;
    createdAt: string;
};

export type MediaMemory = {
    id: string;
    profileId: string;
    visitorName: string;
    type: 'photo' | 'video';
    url: string;
    isPrivate: boolean;
    createdAt: string;
};

export type MessageMemory = {
    id: string;
    profileId: string;
    visitorName: string;
    type: 'text' | 'audio';
    content: string; // text or url to audio
    isPrivate: boolean;
    createdAt: string;
};

const STORAGE_KEYS = {
    PROFILES: 'eterna_profiles',
    MEDIA: 'eterna_media',
    MESSAGES: 'eterna_messages',
    VISITOR_NAME: 'eterna_visitor',
};

// --- VISITOR NAME ---
export const getVisitorName = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.VISITOR_NAME);
};

export const setVisitorName = (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.VISITOR_NAME, name);
};

// --- PROFILES ---
export const getProfiles = (): DeceasedProfile[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return data ? JSON.parse(data) : [];
};

export const getProfileByQrId = (qrId: string): DeceasedProfile | null => {
    const profiles = getProfiles();
    return profiles.find((p) => p.qrId === qrId) || null;
};

export const createProfile = (profile: Omit<DeceasedProfile, 'id' | 'createdAt'>): DeceasedProfile => {
    const profiles = getProfiles();
    const newProfile: DeceasedProfile = {
        ...profile,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    return newProfile;
};

// --- MEDIA ---
export const getMediaForProfile = (profileId: string): MediaMemory[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
    const media: MediaMemory[] = data ? JSON.parse(data) : [];
    return media.filter(m => m.profileId === profileId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addMediaToProfile = (media: Omit<MediaMemory, 'id' | 'createdAt'>): MediaMemory => {
    if (typeof window === 'undefined') return {} as MediaMemory;
    const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
    const allMedia: MediaMemory[] = data ? JSON.parse(data) : [];

    const newMedia: MediaMemory = {
        ...media,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };

    allMedia.push(newMedia);
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(allMedia));
    return newMedia;
};

// --- MESSAGES ---
export const getMessagesForProfile = (profileId: string): MessageMemory[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: MessageMemory[] = data ? JSON.parse(data) : [];
    return messages.filter(m => m.profileId === profileId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addMessageToProfile = (message: Omit<MessageMemory, 'id' | 'createdAt'>): MessageMemory => {
    if (typeof window === 'undefined') return {} as MessageMemory;
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const allMessages: MessageMemory[] = data ? JSON.parse(data) : [];

    const newMessage: MessageMemory = {
        ...message,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };

    allMessages.push(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
    return newMessage;
};
