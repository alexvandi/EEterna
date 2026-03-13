"use client";

import { useState } from "react";
import { DeceasedProfile } from "@/lib/storage";
import ProfileTabs from "./ProfileTabs";

interface MemorialProfileProps {
    profile: DeceasedProfile;
}

export default function MemorialProfile({ profile }: MemorialProfileProps) {
    const formatDates = () => {
        const birthYear = new Date(profile.birthDate).getFullYear();
        const deathYear = new Date(profile.deathDate).getFullYear();
        return `${birthYear} - ${deathYear}`;
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center animate-fade-in pb-20">
            <div className="w-full max-w-2xl bg-white min-h-screen shadow-sm relative">

                {/* Background Image Header */}
                <div
                    className="w-full h-64 md:h-80 relative bg-muted"
                    style={{
                        backgroundImage: `url(${profile.backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                </div>

                {/* Profile Content Area */}
                <div className="px-6 relative -mt-16 md:-mt-20 flex flex-col items-center">

                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-muted shadow-md mb-4 relative">
                        <img
                            src={profile.profileImage}
                            alt={`${profile.firstName} ${profile.lastName}`}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Name & Dates */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-serif font-medium text-foreground tracking-wide mb-1">
                            {profile.firstName} {profile.lastName}
                        </h1>
                        <p className="text-sm font-medium tracking-widest text-primary uppercase">
                            {formatDates()}
                        </p>
                    </div>

                    <div className="w-full h-px bg-border max-w-sm mb-8" />

                    {/* Interactive Tabs */}
                    <div className="w-full">
                        <ProfileTabs profile={profile} />
                    </div>

                </div>

            </div>
        </div>
    );
}
