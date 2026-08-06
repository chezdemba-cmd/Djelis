"use client";

import { useSession } from "../../context/SessionContext";
import AdminScreen from "../../components/AdminScreen";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { isAuthenticated, currentProfile } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !currentProfile) {
      router.push('/browse');
    }
  }, [isAuthenticated, currentProfile, router]);

  if (!isAuthenticated || !currentProfile) return null;

  return (
    <div className="app-page active">
      <AdminScreen onBack={() => router.push('/profile')} />
    </div>
  );
}
