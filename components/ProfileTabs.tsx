"use client";

import { useState, useEffect, useCallback } from "react";
import { Profile, Media, Message, getMediaForProfile, getMessagesForProfile, addMessage, addMedia, uploadMediaFile, toggleMediaLike, toggleMessageLike, getVisitorEmail, checkUserAccess } from "@/lib/db";
import VisitorIdentification from "./VisitorIdentification";
import { Heart, Image as ImageIcon, MessageCircle, BookOpen, Send, Upload, X, Play, Plus, Lock, Globe } from "lucide-react";

interface ProfileTabsProps {
  profile: Profile;
}

type TabType = 'memorie' | 'media' | 'messaggi';

export default function ProfileTabs({ profile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('memorie');
  
  // Real identity logic
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [visitorEmail, setVisitorEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | null>(null);
  
  const [media, setMedia] = useState<Media[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  const [newMessage, setNewMessage] = useState("");
  const [isMessagePrivate, setIsMessagePrivate] = useState(false);
  const [isMediaPrivate, setIsMediaPrivate] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [mediaData, messageData] = await Promise.all([
      getMediaForProfile(profile.id),
      getMessagesForProfile(profile.id),
    ]);
    setMedia(mediaData);
    setMessages(messageData);

    const email = getVisitorEmail();
    const name = localStorage.getItem('eterna_visitor'); // just for name
    
    if (email) {
      setVisitorEmail(email);
      setVisitorName(name || email.split('@')[0]);
      const access = await checkUserAccess(profile.id, email);
      if (access) {
        setUserRole(access.role);
      }
    }
  }, [profile.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const requireIdentity = (action: () => void) => {
    if (!visitorEmail || !visitorName) {
      setPendingAction(() => action);
      setShowVisitorModal(true);
    } else {
      action();
    }
  };

  const handleVisitorIdentified = (name: string, email: string) => {
    setVisitorName(name);
    setVisitorEmail(email);
    setShowVisitorModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const submitMessage = async () => {
    if (!newMessage.trim() || !visitorName) return;
    await addMessage({
      profile_id: profile.id,
      visitor_name: visitorName,
      content: newMessage.trim(),
      is_private: isMessagePrivate,
    });
    setNewMessage("");
    setIsMessagePrivate(false);
    loadData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !visitorName) return;

    setIsUploading(true);
    const url = await uploadMediaFile(file, profile.id);
    if (url) {
      const type = file.type.startsWith('video/') ? 'video' : 'photo';
      await addMedia({
        profile_id: profile.id,
        visitor_name: visitorName,
        type,
        url,
        is_private: isMediaPrivate,
      });
      await loadData();
    }
    setIsUploading(false);
    setIsMediaPrivate(false);
    e.target.value = '';
  };

  const handleLikeMedia = async (mediaId: string) => {
    if (!visitorName) return requireIdentity(() => handleLikeMedia(mediaId));
    await toggleMediaLike(mediaId, visitorName);
    loadData();
  };

  const handleLikeMessage = async (messageId: string) => {
    if (!visitorName) return requireIdentity(() => handleLikeMessage(messageId));
    await toggleMessageLike(messageId, visitorName);
    loadData();
  };

  const canUpload = userRole === 'owner' || userRole === 'editor';
  const isOwnerOrEditor = userRole === 'owner' || userRole === 'editor';

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'memorie', label: 'MEMORIE', icon: <BookOpen size={16} /> },
    { key: 'media', label: 'MEDIA', icon: <ImageIcon size={16} /> },
    { key: 'messaggi', label: 'MESSAGGI', icon: <MessageCircle size={16} /> },
  ];

  const renderMemorie = () => (
    <div className="animate-fade-in px-4">
      {profile.biography ? (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/60">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-medium">Biografia</h3>
          <p className="text-foreground leading-relaxed font-serif text-base whitespace-pre-wrap">
            {profile.biography}
          </p>
        </div>
      ) : (
        <div className="py-16 text-center">
          <BookOpen size={32} className="mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-serif italic text-sm">Nessuna biografia disponibile.</p>
        </div>
      )}
    </div>
  );

  const renderMedia = () => {
    // Media visibility: 
    // - owner/editor sees everything
    // - viewers see public media OR their own private media
    const visibleMedia = media.filter(m => {
      if (!m.is_private) return true;
      if (isOwnerOrEditor) return true;
      return m.visitor_name === visitorName;
    });

    return (
      <div className="animate-fade-in px-4 flex flex-col gap-5">
        {/* Upload Section */}
        {canUpload ? (
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-border/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Visibilità:</span>
              <button 
                onClick={() => setIsMediaPrivate(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${!isMediaPrivate ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <Globe size={14} /> Pubblico
              </button>
              <button 
                onClick={() => setIsMediaPrivate(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${isMediaPrivate ? 'bg-amber-100 text-amber-700 font-medium' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <Lock size={14} /> Privato
              </button>
            </div>
            
            <label className="cursor-pointer w-full sm:w-auto">
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => requireIdentity(() => handleFileUpload(e))}
                disabled={isUploading}
              />
              <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs tracking-widest uppercase font-medium shadow-sm hover:shadow transition-all">
                {isUploading ? (
                  <><Loader2 size={14} className="animate-spin" /> Caricamento...</>
                ) : (
                  <><Plus size={14} /> Aggiungi</>
                )}
              </span>
            </label>
          </div>
        ) : (
          <div className="text-center pb-2">
            <p className="text-xs text-muted-foreground italic tracking-wide">
              Solo i familiari e gli amministratori possono caricare foto e video.
            </p>
          </div>
        )}

        {visibleMedia.length === 0 ? (
          <div className="py-16 text-center">
            <ImageIcon size={32} className="mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground font-serif italic text-sm">Nessun ricordo ancora presente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visibleMedia.map((m) => (
              <div
                key={m.id}
                className="media-item relative rounded-xl overflow-hidden bg-white shadow-sm border border-white/60 cursor-pointer"
                onClick={() => m.type === 'photo' && setSelectedImage(m.url)}
              >
                <div className="aspect-square relative flex bg-muted/20">
                  {m.type === 'photo' ? (
                    <img src={m.url} alt={m.caption || 'Ricordo'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play size={32} className="text-foreground/40" />
                    </div>
                  )}
                  {m.is_private && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                      <Lock size={10} className="text-amber-300" />
                      <span className="text-[9px] text-white uppercase tracking-wider font-medium">Privato</span>
                    </div>
                  )}
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLikeMedia(m.id); }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Heart size={14} className={m.likes_count > 0 ? "fill-red-400 text-red-400" : ""} />
                    {m.likes_count > 0 && <span>{m.likes_count}</span>}
                  </button>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[60%]">{m.visitor_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full p-2"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>
            <img src={selectedImage} alt="Ingrandimento" className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl animate-scale-in" />
          </div>
        )}
      </div>
    );
  };

  const renderMessaggi = () => {
    // Message visibility:
    // - owner/editor sees everything
    // - viewers see public messages OR their own private messages
    const visibleMessages = messages.filter(m => {
      if (!m.is_private) return true;
      if (isOwnerOrEditor) return true;
      return m.visitor_name === visitorName;
    });

    return (
      <div className="animate-fade-in px-4 flex flex-col gap-4">
        {/* Messages list */}
        <div className="flex flex-col gap-3">
          {visibleMessages.length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle size={32} className="mx-auto mb-4 text-muted-foreground/40" />
              <p className="text-muted-foreground font-serif italic text-sm">Sii il primo a lasciare un pensiero.</p>
            </div>
          ) : (
            visibleMessages.map((msg) => (
              <div key={msg.id} className="message-card p-4 rounded-xl border border-white/60 shadow-sm relative overflow-hidden">
                {msg.is_private && (
                   <div className="absolute top-0 right-0 bg-amber-100/80 text-amber-700 text-[9px] uppercase tracking-widest px-2 py-0.5 font-medium rounded-bl-lg flex items-center gap-1">
                     <Lock size={8} /> Privato
                   </div>
                )}
                <div className="flex items-start gap-3 mt-1">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary">
                      {msg.visitor_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-serif leading-relaxed text-[15px]">{msg.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                        — {msg.visitor_name}
                      </span>
                      <button
                        onClick={() => handleLikeMessage(msg.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Heart size={14} className={msg.likes_count > 0 ? "fill-red-400 text-red-400" : ""} />
                        {msg.likes_count > 0 && <span className="font-medium">{msg.likes_count >= 1000 ? `${(msg.likes_count / 1000).toFixed(0)} k` : msg.likes_count}</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sticky compose section */}
        <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-background via-background to-transparent">
          <div className="bg-white/95 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-lg animate-scale-in">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Nuovo Messaggio</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsMessagePrivate(false)}
                    className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider transition-colors ${!isMessagePrivate ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <Globe size={12} /> Pubblico
                  </button>
                  <button 
                    onClick={() => setIsMessagePrivate(true)}
                    className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider transition-colors ${isMessagePrivate ? 'text-amber-600' : 'text-muted-foreground'}`}
                  >
                    <Lock size={12} /> Privato
                  </button>
                </div>
             </div>
             <textarea
                id="message-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Lascia un pensiero..."
                className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-foreground font-serif text-sm min-h-[70px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => requireIdentity(submitMessage)}
                  disabled={!newMessage.trim()}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs tracking-widest uppercase font-medium shadow-sm hover:shadow transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  <Send size={14} /> Pubblica
                </button>
              </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full pb-10">
      {/* Tab Navigation */}
      <div className="flex gap-2 justify-center mb-6 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all duration-300 border ${
              activeTab === tab.key
                ? 'bg-white text-foreground shadow-sm border-border/60'
                : 'bg-white/40 text-muted-foreground hover:bg-white/60 border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="w-full max-w-2xl mx-auto min-h-[40vh]">
        {activeTab === 'memorie' && renderMemorie()}
        {activeTab === 'media' && renderMedia()}
        {activeTab === 'messaggi' && renderMessaggi()}
      </div>

      {showVisitorModal && (
        <VisitorIdentification
          onIdentified={handleVisitorIdentified}
          onCancel={() => { setShowVisitorModal(false); setPendingAction(null); }}
        />
      )}
    </div>
  );
}
