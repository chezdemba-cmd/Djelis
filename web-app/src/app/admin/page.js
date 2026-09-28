"use client";

import { useSession } from "../../context/SessionContext";
import AdminScreen from "../../components/AdminScreen";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { isAuthenticated, currentProfile, isAdmin } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !currentProfile || !isAdmin) {
      router.push('/browse');
    }
  }, [isAuthenticated, currentProfile, isAdmin, router]);

  if (!isAuthenticated || !currentProfile || !isAdmin) return null;

  return (
    <div className="app-page active">
      <AdminScreen onBack={() => router.push('/profile')} />
    </div>
  );
}
