import { NavLink, Outlet } from "react-router-dom";
import { Eye, Swords, FlaskConical, Clock, Users, EyeOff } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

const navItems = [
  { to: "/", label: "中控台", icon: Eye },
  { to: "/turn-control", label: "回合控制", icon: Swords },
  { to: "/poison", label: "投毒面板", icon: FlaskConical },
  { to: "/timemachine", label: "时光倒流", icon: Clock },
];

export default function Layout() {
  const turn = useGameStore((s) => s.currentTurn);
  const phase = useGameStore((s) => s.currentPhase);
  const isSpectator = useGameStore((s) => s.isSpectator);
  const toggleSpectator = useGameStore((s) => s.toggleSpectator);

  return (
    <div className="flex min-h-screen bg-abyss-500">
      <aside className="fixed left-0 top-0 z-10 flex h-screen w-[220px] flex-col border-r border-gold-500/20 bg-abyss-900">
        <div className="px-5 py-6 text-center">
          <h1 className="text-gold-500 text-xl font-bold tracking-widest drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
            审判之眼
          </h1>
        </div>

        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "border-l-2 border-gold-500 bg-abyss-700 text-gold-500 font-semibold"
                    : "text-bone-100 hover:bg-abyss-700/60 hover:text-gold-400",
                ].join(" ")
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gold-500/20 px-3 py-4">
          <button
            onClick={toggleSpectator}
            className={`w-full flex items-center justify-center gap-2 rounded px-3 py-2.5 text-sm font-medium transition-all ${
              isSpectator
                ? "bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60"
                : "bg-gold-900/40 border border-gold-500/40 text-gold-400 hover:bg-gold-900/60"
            }`}
          >
            {isSpectator ? (
              <>
                <EyeOff size={16} />
                <span>旁观者模式</span>
              </>
            ) : (
              <>
                <Users size={16} />
                <span>主持人模式</span>
              </>
            )}
          </button>

          <div className="mt-3 pt-3 border-t border-gold-500/10 text-xs text-bone-100/60">
            <p>
              回合 <span className="text-gold-500">{turn ?? "-"}</span>
            </p>
            <p>
              阶段 <span className="text-gold-500">{phase ?? "-"}</span>
            </p>
          </div>
        </div>
      </aside>

      <main className="ml-[220px] flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
