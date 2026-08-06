"use client";

import { useSession } from "../../context/SessionContext";
import ProfileScreen from "../../components/ProfileScreen";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { isAuthenticated, currentProfile, logout } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !currentProfile) {
      router.push('/browse');
    }
  }, [isAuthenticated, currentProfile, router]);

  if (!isAuthenticated || !currentProfile) return null;

  return (
    <div className="app-page active">
      <ProfileScreen 
        isAuthenticated={isAuthenticated} 
        currentProfile={currentProfile} 
        onLogout={logout} 
        openAuthModal={() => {}} 
        onOpenAdmin={() => router.push('/admin')} 
      />
    </div>
  );
}
