"use client";

import { useState } from "react";
import { Profile } from "@/lib/db";
import ProfileTabs from "./ProfileTabs";
import { ArrowLeft, QrCode } from "lucide-react";
import Link from "next/link";

interface MemorialProfileProps {
  profile: Profile;
}

export default function MemorialProfile({ profile }: MemorialProfileProps) {
  const [showQr, setShowQr] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Default floral background if none set
  const bgImage = profile.background_image_url || 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1080&q=80';
  const profileImg = profile.profile_image_url || 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=400&q=80';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center animate-fade-in">
      <div className="w-full max-w-lg min-h-screen relative">

        {/* Hero Section with background image */}
        <div className="relative w-full">
          <div
            className="w-full h-72 md:h-80 relative"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[hsl(210,20%,70%)]/90" />

            {/* Top navigation */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
              <Link href="/" className="text-white/90 hover:text-white transition-colors">
                <ArrowLeft size={24} />
              </Link>
              <button
                onClick={() => setShowQr(!showQr)}
                className="text-white/90 hover:text-white transition-colors"
              >
                <QrCode size={22} />
              </button>
            </div>
          </div>

          {/* Profile image - centered, overlapping the background */}
          <div className="flex justify-center -mt-20 relative z-10">
            <div className="profile-ring">
              <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-muted">
                <img
                  src={profileImg}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Name & Dates */}
        <div className="text-center px-6 mt-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground tracking-wide uppercase">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 tracking-wider">
            NATO: {formatDate(profile.birth_date)} — DECESSO: {formatDate(profile.death_date)}
          </p>
        </div>

        {/* Tabs */}
        <ProfileTabs profile={profile} />

        {/* QR Code Modal */}
        {showQr && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowQr(false)}
          >
            <div
              className="bg-white rounded-2xl p-8 shadow-xl max-w-xs w-full text-center animate-scale-in"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-serif font-medium text-foreground mb-4">Codice QR</h3>
              <div className="bg-muted/30 p-6 rounded-xl mb-4 flex items-center justify-center">
                <QrCode size={120} className="text-foreground/80" />
              </div>
              <p className="text-xs text-muted-foreground">
                ID: {profile.qr_id}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
