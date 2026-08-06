"use client";

import { useSession } from "../../context/SessionContext";
import SearchScreen from "../../components/SearchScreen";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SearchPage() {
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
      <SearchScreen />
    </div>
  );
}
