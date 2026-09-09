"use client";

import { useSession } from "../../context/SessionContext";
import DjaasooScreen from "../../components/DjaasooScreen";
import DjaasooComingSoon from "../../components/DjaasooComingSoon";
import { LAUNCH_MODE } from "../../lib/launchMode";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DjaasooPage() {
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
      <section className="screen-tab active">
        {LAUNCH_MODE ? (
          <DjaasooComingSoon />
        ) : (
          <DjaasooScreen currentProfile={currentProfile} />
        )}
      </section>
    </div>
  );
}
