"use client";

import { useState, useEffect, useCallback } from "react";
import { Profile, Media, Message, getMediaForProfile, getMessagesForProfile, addMessage, addMedia, uploadMediaFile, toggleMediaLike, toggleMessageLike, getVisitorName } from "@/lib/db";
import VisitorIdentification from "./VisitorIdentification";
import { Heart, Image as ImageIcon, MessageCircle, BookOpen, Send, Upload, X, Play, Plus, Lock } from "lucide-react";

interface ProfileTabsProps {
  profile: Profile;
}

type TabType = 'memorie' | 'media' | 'messaggi';

export default function ProfileTabs({ profile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('memorie');
  const [visitor, setVisitor] = useState<string | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [mediaData, messageData] = await Promise.all([
      getMediaForProfile(profile.id),
      getMessagesForProfile(profile.id),
    ]);
    setMedia(mediaData);
    setMessages(messageData);
  }, [profile.id]);

  useEffect(() => {
    setVisitor(getVisitorName());
    loadData();
  }, [loadData]);

  const requireVisitor = (action: () => void) => {
    const currentVisitor = getVisitorName();
    if (!currentVisitor) {
      setPendingAction(() => action);
      setShowVisitorModal(true);
    } else {
      setVisitor(currentVisitor);
      action();
    }
  };

  const handleVisitorIdentified = (name: string) => {
    setVisitor(name);
    setShowVisitorModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const submitMessage = async () => {
    if (!newMessage.trim() || !visitor) return;
    await addMessage({
      profile_id: profile.id,
      visitor_name: visitor,
      content: newMessage.trim(),
    });
    setNewMessage("");
    loadData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !visitor) return;

    setIsUploading(true);
    const url = await uploadMediaFile(file, profile.id);
    if (url) {
      const type = file.type.startsWith('video/') ? 'video' : 'photo';
      await addMedia({
        profile_id: profile.id,
        visitor_name: visitor,
        type,
        url,
      });
      await loadData();
    }
    setIsUploading(false);
    e.target.value = '';
  };

  const handleLikeMedia = async (mediaId: string) => {
    if (!visitor) return requireVisitor(() => handleLikeMedia(mediaId));
    await toggleMediaLike(mediaId, visitor);
    loadData();
  };

  const handleLikeMessage = async (messageId: string) => {
    if (!visitor) return requireVisitor(() => handleLikeMessage(messageId));
    await toggleMessageLike(messageId, visitor);
    loadData();
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'memorie', label: 'MEMORIE', icon: <BookOpen size={16} /> },
    { key: 'media', label: 'MEDIA', icon: <ImageIcon size={16} /> },
    { key: 'messaggi', label: 'MESSAGGI', icon: <MessageCircle size={16} /> },
  ];

  const renderMemorie = () => (
    <div className="animate-fade-in px-4">
      {profile.epitaph && (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-white/60 mb-6">
          <p className="text-foreground leading-relaxed font-serif text-lg text-center font-light italic whitespace-pre-wrap">
            &ldquo;{profile.epitaph}&rdquo;
          </p>
        </div>
      )}
      {profile.biography && (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/60">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-medium">Biografia</h3>
          <p className="text-foreground leading-relaxed font-serif text-base whitespace-pre-wrap">
            {profile.biography}
          </p>
        </div>
      )}
      {!profile.epitaph && !profile.biography && (
        <div className="py-16 text-center">
          <BookOpen size={32} className="mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-serif italic">Nessuna memoria ancora presente.</p>
        </div>
      )}
    </div>
  );

  const renderMedia = () => {
    const visibleMedia = media.filter(m => !m.is_private || m.visitor_name === visitor);

    return (
      <div className="animate-fade-in px-4 flex flex-col gap-5">
        {/* Upload button */}
        <div className="flex justify-end">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => requireVisitor(() => handleFileUpload(e))}
              disabled={isUploading}
            />
            <span className="inline-flex items-center gap-2 bg-white/80 hover:bg-white border border-border/60 text-foreground px-4 py-2.5 rounded-xl text-xs tracking-widest uppercase font-medium shadow-sm hover:shadow transition-all">
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Caricamento...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Aggiungi
                </>
              )}
            </span>
          </label>
        </div>

        {visibleMedia.length === 0 ? (
          <div className="py-16 text-center">
            <ImageIcon size={32} className="mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground font-serif italic">Nessun ricordo ancora presente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visibleMedia.map((m) => (
              <div
                key={m.id}
                className="media-item relative rounded-xl overflow-hidden bg-white shadow-sm border border-white/60 cursor-pointer"
                onClick={() => m.type === 'photo' && setSelectedImage(m.url)}
              >
                <div className="aspect-square relative">
                  {m.type === 'photo' ? (
                    <img src={m.url} alt={m.caption || 'Ricordo'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                      <Play size={32} className="text-foreground/60" />
                    </div>
                  )}
                  {m.is_private && (
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                      <Lock size={12} className="text-white" />
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X size={28} />
            </button>
            <img src={selectedImage} alt="Full view" className="max-w-full max-h-[85vh] rounded-lg object-contain" />
          </div>
        )}
      </div>
    );
  };

  const renderMessaggi = () => {
    const visibleMessages = messages.filter(m => !m.is_private || m.visitor_name === visitor);

    return (
      <div className="animate-fade-in px-4 flex flex-col gap-4">
        {/* Messages list */}
        <div className="flex flex-col gap-3">
          {visibleMessages.length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle size={32} className="mx-auto mb-4 text-muted-foreground/40" />
              <p className="text-muted-foreground font-serif italic">Sii il primo a lasciare un pensiero.</p>
            </div>
          ) : (
            visibleMessages.map((msg) => (
              <div key={msg.id} className="message-card p-4 rounded-xl border border-white/60 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-foreground/70">
                      {msg.visitor_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-serif leading-relaxed text-[15px]">{msg.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        — {msg.visitor_name}
                      </span>
                      <button
                        onClick={() => handleLikeMessage(msg.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Heart size={12} className={msg.likes_count > 0 ? "fill-red-400 text-red-400" : ""} />
                        {msg.likes_count > 0 && <span>{msg.likes_count >= 1000 ? `${(msg.likes_count / 1000).toFixed(0)} k` : msg.likes_count}</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Write message - sticky at bottom */}
        <div className="sticky bottom-0 pt-2">
          <button
            onClick={() => requireVisitor(() => {
              const textarea = document.getElementById('message-input');
              if (textarea) textarea.focus();
            })}
            className="w-full btn-sage py-3.5 px-6 text-sm tracking-widest uppercase font-medium flex items-center justify-center gap-2 shadow-md"
          >
            <Send size={16} />
            Lascia un pensiero
          </button>
          {visitor && (
            <div className="mt-3 bg-white/90 backdrop-blur-sm border border-border/40 rounded-xl p-3 shadow-sm animate-scale-in">
              <textarea
                id="message-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi il tuo messaggio..."
                className="w-full bg-transparent border-none resize-none focus:outline-none text-foreground font-serif text-sm min-h-[60px] placeholder:text-muted-foreground/50"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={submitMessage}
                  disabled={!newMessage.trim()}
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-xs tracking-widest uppercase font-medium shadow-sm hover:shadow transition-all disabled:opacity-40"
                >
                  Pubblica
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full pb-10">
      {/* Tab Navigation - pill style matching design */}
      <div className="flex gap-2 justify-center mb-8 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 border ${
              activeTab === tab.key
                ? 'bg-white text-foreground shadow-md border-white/80'
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
