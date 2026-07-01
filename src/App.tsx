import { useEffect, useState } from "react";
import { BookOpen, Film, Flame, Layers, LayoutGrid, Sparkles, Star } from "lucide-react";
import { PracticeView } from "./components/PracticeView";
import { MyVideos } from "./components/MyVideos";
import { ToastContainer } from "./components/Toast";
import { useStore } from "./state/store";
import { useTheme } from "./hooks/useTheme";
import { initSpeech, unlockOnGesture } from "./lib/speech";
import {
  getMe,
  getStoredProfileId,
  setStoredProfileId,
} from "./lib/profile";
import { Pill, cn } from "./components/ui";
import { SettingsMenu } from "./components/SettingsMenu";
import { ProfileGate } from "./components/ProfileGate";
import { Dashboard } from "./components/Dashboard";
import { DayView } from "./components/DayView";
import { ReviewHub } from "./components/ReviewHub";

type View = "dashboard" | "day" | "review" | "practice" | "videos";

export default function App() {
  // null = still resolving, false = no profile yet (show gate), string = active
  const [profileId, setProfileId] = useState<string | null | false>(null);
  const [sso, setSso] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await getMe();
      if (cancelled) return;
      if (me.user) {
        // Behind YunoHost SSO: the logged-in user *is* the profile.
        setSso(true);
        setProfileId(me.user);
        return;
      }
      const stored = getStoredProfileId();
      setProfileId(stored ?? false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function pickProfile(id: string) {
    setStoredProfileId(id);
    setProfileId(id);
  }

  function switchProfile() {
    setStoredProfileId(null);
    setProfileId(false);
  }

  if (profileId === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-400 dark:bg-slate-950">
        …
      </div>
    );
  }

  if (profileId === false) {
    return <ProfileGate onPick={pickProfile} />;
  }

  return (
    <LearnerApp
      key={profileId}
      profileId={profileId}
      sso={sso}
      onSwitchProfile={switchProfile}
    />
  );
}

function LearnerApp({
  profileId,
  sso,
  onSwitchProfile,
}: {
  profileId: string;
  sso: boolean;
  onSwitchProfile: () => void;
}) {
  const store = useStore(profileId);
  const { state, t } = store;
  const [view, setView] = useState<View>("dashboard");
  const [activeDay, setActiveDay] = useState(1);

  useTheme(state.themeMode);

  // Load system voices, and unlock the speech engine on the first user gesture
  // (required by iOS Safari). The listeners remove themselves after firing.
  useEffect(() => {
    initSpeech();
    const onGesture = () => unlockOnGesture();
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("touchend", onGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchend", onGesture);
    };
  }, []);

  function openDay(day: number) {
    setActiveDay(day);
    setView("day");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="safe-area-top sticky top-0 z-30 border-b border-slate-200/70 bg-slate-50/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => setView("dashboard")}
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 font-display text-sm text-white dark:bg-white dark:text-slate-900">
              语
            </span>
            Lingua<span className="text-indigo-500">90</span>
          </button>

          <nav className="ml-2 hidden items-center gap-1 sm:flex">
            <NavBtn
              active={view === "dashboard"}
              onClick={() => setView("dashboard")}
              icon={<LayoutGrid size={16} />}
              label={t("nav.journey")}
            />
            <NavBtn
              active={view === "review"}
              onClick={() => setView("review")}
              icon={<BookOpen size={16} />}
              label={t("nav.words")}
            />
            <NavBtn
              active={view === "practice"}
              onClick={() => setView("practice")}
              icon={<Layers size={16} />}
              label={t("nav.practice")}
            />
            <NavBtn
              active={view === "videos"}
              onClick={() => setView("videos")}
              icon={<Film size={16} />}
              label={t("nav.videos")}
            />
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Pill className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              <Flame size={14} /> {state.streak}
            </Pill>
            <Pill className="hidden bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex">
              <Star size={14} /> {state.xp}
            </Pill>
            <SettingsMenu
              store={store}
              sso={sso}
              onSwitchProfile={onSwitchProfile}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div key={view} className="animate-fade-in">
          {view === "dashboard" && (
            <Dashboard store={store} onOpenDay={openDay} />
          )}
          {view === "day" && (
            <DayView
              store={store}
              day={activeDay}
              onBack={() => setView("dashboard")}
            />
          )}
          {view === "review" && <ReviewHub store={store} />}
          {view === "practice" && <PracticeView store={store} />}
          {view === "videos" && <MyVideos store={store} />}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="safe-area-bottom sticky bottom-0 z-30 flex border-t border-slate-200 bg-slate-50/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:hidden">
        <MobileNav
          active={view === "dashboard"}
          onClick={() => setView("dashboard")}
          icon={<LayoutGrid size={18} />}
          label={t("nav.journey")}
        />
        <MobileNav
          active={view === "review"}
          onClick={() => setView("review")}
          icon={<BookOpen size={18} />}
          label={t("nav.words")}
        />
        <MobileNav
          active={view === "practice"}
          onClick={() => setView("practice")}
          icon={<Layers size={18} />}
          label={t("nav.practice")}
        />
        <MobileNav
          active={view === "videos"}
          onClick={() => setView("videos")}
          icon={<Film size={18} />}
          label={t("nav.videos")}
        />
      </nav>

      <ToastContainer />

      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-xs text-slate-400">
        <p>
          {t("footer.tagline", {
            lang: t(state.language === "en" ? "lang.en" : "lang.zh"),
          })}
        </p>
        <p className="mt-1 flex items-center justify-center gap-1">
          <Sparkles size={12} /> {t("footer.saved")}
        </p>
      </footer>
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNav({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors",
        active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
