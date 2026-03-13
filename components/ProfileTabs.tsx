"use client";

import { useState, useEffect } from "react";
import { DeceasedProfile, getVisitorName, getMediaForProfile, getMessagesForProfile, MediaMemory, MessageMemory, addMessageToProfile } from "@/lib/storage";
import VisitorIdentification from "./VisitorIdentification";

interface ProfileTabsProps {
    profile: DeceasedProfile;
}

type TabType = 'memorie' | 'ricordi' | 'messaggi';

export default function ProfileTabs({ profile }: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('memorie');

    // Data State
    const [visitor, setVisitor] = useState<string | null>(null);
    const [media, setMedia] = useState<MediaMemory[]>([]);
    const [messages, setMessages] = useState<MessageMemory[]>([]);

    // Modals & Forms
    const [showVisitorModal, setShowVisitorModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<() => void>(() => { });
    const [newMessage, setNewMessage] = useState("");
    const [isPrivateMessage, setIsPrivateMessage] = useState(false);

    // Load initial data
    useEffect(() => {
        setVisitor(getVisitorName());
        setMedia(getMediaForProfile(profile.id));
        setMessages(getMessagesForProfile(profile.id));
    }, [profile.id]);

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
        pendingAction();
    };

    const submitMessage = () => {
        if (!newMessage.trim() || !visitor) return;

        addMessageToProfile({
            profileId: profile.id,
            visitorName: visitor,
            type: 'text',
            content: newMessage.trim(),
            isPrivate: isPrivateMessage,
        });

        setNewMessage("");
        setIsPrivateMessage(false);
        setMessages(getMessagesForProfile(profile.id)); // Reload
    };

    const handleAddMessageClick = () => {
        requireVisitor(submitMessage);
    };

    const renderMemorie = () => (
        <div className="animate-fade-in px-4">
            <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                <p className="text-foreground leading-relaxed font-serif text-lg text-center font-light italic whitespace-pre-wrap">
                    "{profile.epitaph}"
                </p>
            </div>
        </div>
    );

    const renderRicordi = () => {
        // Filter out private media not belonging to visitor
        const visibleMedia = media.filter(m => !m.isPrivate || m.visitorName === visitor);

        return (
            <div className="animate-fade-in px-4 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-serif text-foreground">Galleria</h3>
                    <button
                        onClick={() => requireVisitor(() => alert("Funzionalità caricamento file simulata."))}
                        className="text-primary text-sm font-medium tracking-widest uppercase hover:underline"
                    >
                        + Aggiungi Foto
                    </button>
                </div>

                {visibleMedia.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
                        <p className="text-muted-foreground font-serif italic">Nessun ricordo ancora presente.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {visibleMedia.map((m) => (
                            <div key={m.id} className="aspect-square bg-muted rounded-lg border border-border relative overflow-hidden group">
                                {/* Fallback box for simulation */}
                                <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-xs text-muted-foreground bg-secondary/50">
                                    [{m.type}]<br />Di: {m.visitorName}
                                    {m.isPrivate && <span className="block mt-1 text-[10px] text-foreground font-bold">Privato</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderMessaggi = () => {
        // Filter out private messages not belonging to visitor
        const visibleMessages = messages.filter(m => !m.isPrivate || m.visitorName === visitor);

        return (
            <div className="animate-fade-in px-4 flex flex-col gap-6">

                {/* Write message form */}
                <div className="bg-white border text-foreground border-border rounded-xl p-4 shadow-sm">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Lascia un pensiero..."
                        className="w-full bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-foreground font-serif text-base min-h-[80px]"
                    />
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <input
                                type="checkbox"
                                checked={isPrivateMessage}
                                onChange={(e) => setIsPrivateMessage(e.target.checked)}
                                className="rounded border-border text-primary focus:ring-primary/50"
                            />
                            <span className="font-serif italic text-xs">Visibile solo a me</span>
                        </label>
                        <button
                            onClick={handleAddMessageClick}
                            disabled={!newMessage.trim()}
                            className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs tracking-widest uppercase font-medium shadow-sm hover:shadow hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            Pubblica
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex flex-col gap-4">
                    {visibleMessages.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground font-serif italic">
                            Sii il primo a lasciare un pensiero.
                        </div>
                    ) : (
                        visibleMessages.map((msg) => (
                            <div key={msg.id} className="bg-muted/20 border border-border p-4 rounded-xl flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <span className="font-medium text-foreground text-sm uppercase tracking-wider">{msg.visitorName}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {new Date(msg.createdAt).toLocaleDateString()}
                                        {msg.isPrivate && " • Privato"}
                                    </span>
                                </div>
                                <p className="text-foreground font-serif leading-relaxed text-[15px]">{msg.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full pb-10">

            {/* Tab Navigation */}
            <div className="flex p-1 bg-muted/50 rounded-lg max-w-sm mx-auto mb-8 relative">
                {(['memorie', 'ricordi', 'messaggi'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 flex justify-center py-2.5 rounded-md text-xs font-medium tracking-widest uppercase transition-all duration-300 z-10 ${activeTab === tab
                                ? 'bg-white text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content Placeholder */}
            <div className="w-full max-w-2xl mx-auto min-h-[50vh]">
                {activeTab === 'memorie' && renderMemorie()}
                {activeTab === 'ricordi' && renderRicordi()}
                {activeTab === 'messaggi' && renderMessaggi()}
            </div>

            {showVisitorModal && (
                <VisitorIdentification
                    onIdentified={handleVisitorIdentified}
                    onCancel={() => setShowVisitorModal(false)}
                />
            )}
        </div>
    );
}
