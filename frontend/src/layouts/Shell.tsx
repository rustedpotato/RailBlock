import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Buttons';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  AlertTriangle,
  FileText,
  GitCompare,
  Cpu,
  Clock,
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  Play,
  Settings,
  ChevronDown,
  Check,
  Layers,
  Sparkles,
  Menu,
  X,
  Wrench,
  Train,
  Shield,
  LogOut,
  Database
} from 'lucide-react';
import { useLine } from '../context/LineContext';
import { useAuth } from '../context/AuthContext';
import { LINES, getLine, LineId } from '../data/lines';

interface ShellProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSearch: () => void;
  onRunOptimizer: () => void;
  isOptimizing: boolean;
  onOpenLogin?: () => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onRunOptimizer,
  isOptimizing,
  onOpenLogin,
  children
}) => {
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLineMenu, setShowLineMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { selectedLine, setSelectedLine } = useLine();
  const activeLine = getLine(selectedLine);
  const lineColor = activeLine?.color ?? 'var(--fg)';
  const lineLabel = activeLine?.name ?? 'All Lines';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLineMenu(false);
      }
    };
    if (showLineMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLineMenu]);

  const lineOptions: {
    id: LineId;
    name: string;
    sub: string;
    short: string;
    tag: string;
    color: string;
    badgeBg: string;
  }[] = [
    {
      id: 'all',
      name: 'All Lines',
      sub: 'Mumbai Suburban Network',
      short: 'ALL',
      tag: '16 Corridors',
      color: '#A1A1AA',
      badgeBg: 'rgba(255,255,255,0.08)'
    },
    {
      id: 'central',
      name: 'Central Line',
      sub: 'CR Mainline (CSMT – Thane – Kalyan – Kasara)',
      short: 'CR',
      tag: '5 Corridors',
      color: '#E5484D',
      badgeBg: 'rgba(229, 72, 77, 0.16)'
    },
    {
      id: 'western',
      name: 'Western Line',
      sub: 'WR Fast & Slow (Churchgate – Bandra – Virar)',
      short: 'WR',
      tag: '5 Corridors',
      color: '#3E8BFF',
      badgeBg: 'rgba(62, 139, 255, 0.16)'
    },
    {
      id: 'harbour',
      name: 'Harbour Line',
      sub: 'CR Harbour & Trans-Harbour (CSMT – Panvel)',
      short: 'HR',
      tag: '6 Corridors',
      color: '#30A46C',
      badgeBg: 'rgba(48, 164, 108, 0.16)'
    }
  ];

  const { role, user, isAdmin, isUser, switchRole } = useAuth();

  const navItems = isUser
    ? [
        { id: 'live-viewer', label: 'Works & Regulated Trains', icon: Train },
        { id: 'blocks', label: 'Blocks Timetable', icon: Clock }
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pipeline', label: 'Data Pipeline & Dataset', icon: Database },
        { id: 'sectors', label: 'Sector Assignment', icon: Wrench },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'scheduler', label: 'Scheduler', icon: CalendarDays },
        { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle },
        { id: 'plans', label: 'Plans', icon: FileText },
        { id: 'compare', label: 'Compare', icon: GitCompare },
        { id: 'assets', label: 'Assets', icon: Cpu },
        { id: 'blocks', label: 'Blocks & Timetable', icon: Clock }
      ];

  const currentNav = navItems.find((n) => n.id === currentTab) || navItems[0];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col md:flex-row antialiased select-none font-sans">
      {/* 1. Left Sidebar (256px wide, --bg-2, 1px right border) */}
      <aside className="hidden md:flex flex-col w-[256px] bg-[var(--bg-2)] border-r border-[var(--border)] shrink-0 h-screen sticky top-0 z-30">
        {/* Top Wordmark & Division Switcher */}
        <div className="p-3.5 border-b border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[var(--fg)] rounded-[4px] shrink-0 flex items-center justify-center font-bold text-[10px] text-[var(--bg)]">
                RB
              </div>
              <span className="font-semibold text-sm tracking-tight text-[var(--fg)]">
                RailBlock AI
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--fg-subtle)] border border-[var(--border)]">
              SIH26027
            </span>
          </div>

          {/* Line Selector Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              id="line-selector"
              type="button"
              onClick={() => setShowLineMenu(!showLineMenu)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-[8px] bg-[var(--surface)] border text-xs cursor-pointer transition-all hover:border-[var(--border-strong)]"
              style={{
                borderColor: activeLine ? `${lineColor}88` : 'var(--border)',
                boxShadow: activeLine ? `0 0 12px ${lineColor}15` : undefined
              }}
            >
              <div className="flex items-center gap-2 truncate">
                {activeLine ? (
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider shrink-0"
                    style={{
                      background: `${lineColor}22`,
                      color: lineColor,
                      border: `1px solid ${lineColor}55`
                    }}
                  >
                    {activeLine.short}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface-hover)] text-[var(--fg-muted)] border border-[var(--border)] shrink-0">
                    ALL
                  </span>
                )}
                <div className="flex flex-col text-left truncate">
                  <span className="font-semibold text-[12px] text-[var(--fg)] truncate">
                    {lineLabel}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--fg-subtle)] truncate">
                    {activeLine ? activeLine.zone.split('·')[1]?.trim() || activeLine.zone : 'Mumbai Suburban'}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={14}
                className={`text-[var(--fg-subtle)] shrink-0 ml-1.5 transition-transform duration-200 ${
                  showLineMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Modal */}
            {showLineMenu && (
              <div className="absolute left-0 right-0 mt-1.5 bg-[var(--surface)] border border-[var(--border-strong)] rounded-[10px] shadow-2xl p-1.5 z-50 animate-fade-in backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] px-2.5 py-1.5 border-b border-[var(--border)]">
                  Select Railway Line
                </div>
                <div className="space-y-1 mt-1">
                  {lineOptions.map((opt) => {
                    const active = selectedLine === opt.id;
                    return (
                      <button
                        key={opt.id}
                        id={`line-option-${opt.id}`}
                        type="button"
                        onClick={() => {
                          setSelectedLine(opt.id);
                          setShowLineMenu(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] text-left cursor-pointer transition-all ${
                          active
                            ? 'bg-[var(--surface-hover)] font-semibold'
                            : 'hover:bg-[var(--surface-hover)]'
                        }`}
                        style={{
                          borderLeft: active ? `3px solid ${opt.color}` : '3px solid transparent'
                        }}
                      >
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider shrink-0"
                          style={{
                            background: opt.badgeBg,
                            color: opt.color,
                            border: `1px solid ${opt.color}44`
                          }}
                        >
                          {opt.short}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[var(--fg)]">{opt.name}</span>
                            <span className="text-[9px] font-mono text-[var(--fg-subtle)]">
                              {opt.tag}
                            </span>
                          </div>
                          <span className="block text-[10px] font-mono text-[var(--fg-subtle)] truncate">
                            {opt.sub}
                          </span>
                        </div>
                        {active && <Check size={13} style={{ color: opt.color }} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Segment Switcher: 4-Way Buttons for Instant 1-Click Line Switching */}
          <div className="grid grid-cols-4 gap-1 p-0.5 rounded-[7px] bg-[var(--surface)] border border-[var(--border)]">
            <button
              type="button"
              id="quick-line-all"
              onClick={() => setSelectedLine('all')}
              className={`h-6 rounded-[5px] text-[10px] font-mono font-bold transition-all cursor-pointer ${
                selectedLine === 'all'
                  ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              ALL
            </button>
            <button
              type="button"
              id="quick-line-central"
              onClick={() => setSelectedLine('central')}
              title="Central Line (CR)"
              className={`h-6 rounded-[5px] text-[10px] font-mono font-bold transition-all cursor-pointer ${
                selectedLine === 'central'
                  ? 'bg-[#E5484D] text-white shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[#E5484D] hover:bg-[#E5484D]/10'
              }`}
            >
              CR
            </button>
            <button
              type="button"
              id="quick-line-western"
              onClick={() => setSelectedLine('western')}
              title="Western Line (WR)"
              className={`h-6 rounded-[5px] text-[10px] font-mono font-bold transition-all cursor-pointer ${
                selectedLine === 'western'
                  ? 'bg-[#3E8BFF] text-white shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[#3E8BFF] hover:bg-[#3E8BFF]/10'
              }`}
            >
              WR
            </button>
            <button
              type="button"
              id="quick-line-harbour"
              onClick={() => setSelectedLine('harbour')}
              title="Harbour Line (HR)"
              className={`h-6 rounded-[5px] text-[10px] font-mono font-bold transition-all cursor-pointer ${
                selectedLine === 'harbour'
                  ? 'bg-[#30A46C] text-white shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[#30A46C] hover:bg-[#30A46C]/10'
              }`}
            >
              HR
            </button>
          </div>
        </div>

        {/* Navigation Items (36px tall, 6px radius, 16px line icons) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full h-[36px] px-3 rounded-[6px] flex items-center gap-3 text-[13px] font-medium transition-colors cursor-pointer text-left ${
                  active
                    ? 'bg-[var(--surface-hover)] text-[var(--fg)] font-semibold shadow-xs'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Icon size={16} className={active ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Line quick-switch chips */}
        <div className="px-3 pb-3 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] px-1 pb-1">Lines</div>
          {LINES.map((l) => {
            const active = selectedLine === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setSelectedLine(active ? 'all' : l.id)}
                className={`w-full h-[30px] px-2.5 rounded-[6px] flex items-center gap-2.5 text-[12px] transition-colors cursor-pointer ${
                  active ? 'text-[var(--fg)] font-semibold' : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]'
                }`}
                style={active ? { background: `${l.color}1F` } : undefined}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                <span className="flex-1 text-left">{l.name}</span>
                <span className="text-[10px] font-mono text-[var(--fg-subtle)]">{l.sections.length}</span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Theme switcher, User Avatar, Settings */}
        <div className="p-3 border-t border-[var(--border)] space-y-3 bg-[var(--bg-2)]">
          {/* Three-Way Theme Switcher (System / Light / Dark) */}
          <div className="flex items-center justify-between p-1 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] text-xs">
            <button
              onClick={() => setTheme('system')}
              title="System Theme"
              className={`flex-1 h-7 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
                theme === 'system'
                  ? 'bg-[var(--surface-hover)] text-[var(--fg)] font-medium'
                  : 'text-[var(--fg-subtle)] hover:text-[var(--fg)]'
              }`}
            >
              <Laptop size={14} />
            </button>
            <button
              onClick={() => setTheme('light')}
              title="Light Theme"
              className={`flex-1 h-7 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-[var(--surface-hover)] text-[var(--fg)] font-medium'
                  : 'text-[var(--fg-subtle)] hover:text-[var(--fg)]'
              }`}
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Dark Theme"
              className={`flex-1 h-7 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[var(--surface-hover)] text-[var(--fg)] font-medium'
                  : 'text-[var(--fg-subtle)] hover:text-[var(--fg)]'
              }`}
            >
              <Moon size={14} />
            </button>
          </div>

          {/* User Profile / Role Switcher */}
          <div
            onClick={() => (onOpenLogin ? onOpenLogin() : switchRole(isAdmin ? 'USER' : 'ADMIN'))}
            className="flex items-center justify-between px-2 py-1.5 rounded-[6px] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
            title={isAdmin ? 'Click to preview Passenger View or switch accounts' : 'Click to log in as Divisional Admin'}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold"
                style={{
                  backgroundColor: isAdmin ? 'var(--border-strong)' : 'rgba(48, 164, 108, 0.2)',
                  color: isAdmin ? 'var(--fg)' : '#30A46C'
                }}
              >
                {isAdmin ? 'CR' : 'PB'}
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-[var(--fg)] leading-none flex items-center gap-1.5">
                  <span className="truncate">{isAdmin ? 'Divisional Admin' : 'Public Viewer'}</span>
                </div>
                <div className="text-[10px] text-[var(--fg-subtle)] font-mono mt-0.5 truncate">
                  {isAdmin ? 'Full Operational Access' : 'Read-Only Live Feed'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenLogin) onOpenLogin();
                else switchRole(isAdmin ? 'USER' : 'ADMIN');
              }}
              className="p-1 rounded text-[var(--fg-subtle)] hover:text-[var(--fg)]"
              title={isAdmin ? 'Switch to Passenger View' : 'Log in as Admin'}
            >
              {isAdmin ? (
                <Train size={14} className="text-[#30A46C]" />
              ) : (
                <Shield size={14} className="text-[#0070F3]" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Bar (56px tall, 1px bottom border) */}
        <header className="h-[56px] px-3 sm:px-6 border-b border-[var(--border)] bg-[var(--bg-2)] flex items-center justify-between shrink-0 sticky top-0 z-20">
          {/* Breadcrumb on Left with Mobile Hamburger */}
          <div className="flex items-center gap-2 text-xs font-mono min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-[6px] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors shrink-0"
              aria-label="Open Menu"
            >
              <Menu size={15} />
            </button>
            <span className="hidden sm:inline text-[var(--fg-subtle)]">Mumbai Suburban</span>
            <span className="hidden sm:inline text-[var(--border-strong)]">/</span>
            {activeLine ? (
              <span
                className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-semibold truncate max-w-[140px] sm:max-w-none"
                style={{
                  background: `${lineColor}18`,
                  color: lineColor,
                  border: `1px solid ${lineColor}44`
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lineColor, boxShadow: `0 0 6px ${lineColor}` }} />
                <span className="truncate">{activeLine.short}</span>
                <button
                  type="button"
                  onClick={() => setSelectedLine('all')}
                  className="ml-1 text-[10px] opacity-75 hover:opacity-100 hover:scale-110 cursor-pointer font-bold px-0.5"
                  title="Reset to All Lines"
                >
                  ✕
                </button>
              </span>
            ) : (
              <span className="text-[var(--fg-muted)] text-[11px]">All Lines</span>
            )}
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-[var(--fg)] font-medium truncate text-[11px] sm:text-xs">{currentNav.label}</span>
          </div>

          {/* Center: Global Search Field (⌘K Hint) */}
          <div
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-3 w-72 h-[34px] px-3 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--fg-subtle)] hover:border-[var(--border-strong)] cursor-pointer transition-colors"
          >
            <Search size={14} />
            <span className="flex-1 text-left">Search anything...</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--fg-subtle)]">
              ⌘K
            </kbd>
          </div>

          {/* Right: Date-range, Run Optimizer / Live Badge, Role Switch, Bell */}
          <div className="flex items-center gap-2.5">
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-[var(--fg-muted)] px-2.5 py-1 rounded-[6px] border border-[var(--border)] bg-[var(--surface)]">
              <Clock size={13} className="text-[#0070F3]" />
              <span>19 – 25 Oct 2026</span>
            </div>

            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => switchRole('USER')}
                  className="hidden sm:flex items-center gap-1.5 h-[34px] px-2.5 rounded-[6px] text-xs font-medium bg-[var(--surface)] border border-[var(--border)] hover:border-[#30A46C] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-all cursor-pointer"
                  title="Switch to Passenger / Station View"
                >
                  <Train size={13} className="text-[#30A46C]" />
                  <span>Passenger View</span>
                </button>

                <Button
                  variant="primary"
                  size="md"
                  icon={<Play size={13} />}
                  onClick={onRunOptimizer}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? 'Solving...' : 'Run Optimizer'}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-[6px] border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">Live Passenger Feed</span>
                  <span className="sm:hidden">Live</span>
                </div>

                <button
                  type="button"
                  onClick={() => (onOpenLogin ? onOpenLogin() : switchRole('ADMIN'))}
                  className="h-[34px] px-3 rounded-[6px] text-xs font-semibold bg-[#0070F3] hover:bg-[#0070F3]/90 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Shield size={13} />
                  <span>Admin Login</span>
                </button>
              </>
            )}

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-[6px] flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={15} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E5484D]" />
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[var(--surface)] border border-[var(--border-strong)] rounded-[12px] shadow-2xl p-3 z-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] font-semibold text-[var(--fg)]">
                    <span>Operational Alerts</span>
                    <span className="text-[11px] font-mono text-[#E5484D]">2 Active</span>
                  </div>
                  <div className="p-2 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] space-y-1">
                    <span className="font-semibold text-[var(--danger)] block">OHE Defect Detected</span>
                    <p className="text-[var(--fg-muted)]">Kalyan mast 118 groove wear exceeds 3.2mm.</p>
                  </div>
                  <div className="p-2 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] space-y-1">
                    <span className="font-semibold text-[var(--warning)] block">USFD Caution Active</span>
                    <p className="text-[var(--fg-muted)]">30 km/h speed restriction at KM 48/16.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Active line accent stripe */}
        {activeLine && <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${lineColor}, transparent)` }} />}

        {/* Animated 2px Optimizer Progress Line (Top of content) */}
        {isOptimizing && (
          <div className="w-full bg-transparent overflow-hidden">
            <div className="optimizer-line" />
          </div>
        )}

        {/* Content Container (max-width 1360px, responsive padding, bottom padding for mobile bar) */}
        <main className="flex-1 max-w-[1360px] w-full mx-auto p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-[300px] max-w-[85vw] bg-[var(--bg-2)] border-r border-[var(--border)] h-full flex flex-col justify-between p-4 z-50 shadow-2xl animate-slide-in">
            <div className="space-y-4 overflow-y-auto flex-1">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[var(--fg)] rounded-[5px] flex items-center justify-center font-bold text-xs text-[var(--bg)]">
                    RB
                  </div>
                  <div>
                    <span className="font-semibold text-sm tracking-tight text-[var(--fg)] block">
                      RailBlock AI
                    </span>
                    <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                      Automatic Block Planning
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-[6px] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]"
                  aria-label="Close Menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Line Filter Chips for Mobile */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-subtle)]">
                  Active Corridor Line
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => { setSelectedLine('all'); setMobileMenuOpen(false); }}
                    className={`h-7 rounded-[6px] text-[11px] font-mono font-bold transition-all ${
                      selectedLine === 'all'
                        ? 'bg-[var(--fg)] text-[var(--bg)]'
                        : 'bg-[var(--surface)] text-[var(--fg-muted)] border border-[var(--border)]'
                    }`}
                  >
                    ALL
                  </button>
                  <button
                    onClick={() => { setSelectedLine('central'); setMobileMenuOpen(false); }}
                    className={`h-7 rounded-[6px] text-[11px] font-mono font-bold transition-all ${
                      selectedLine === 'central'
                        ? 'bg-[#E5484D] text-white'
                        : 'bg-[var(--surface)] text-[var(--fg-muted)] border border-[var(--border)]'
                    }`}
                  >
                    CR
                  </button>
                  <button
                    onClick={() => { setSelectedLine('western'); setMobileMenuOpen(false); }}
                    className={`h-7 rounded-[6px] text-[11px] font-mono font-bold transition-all ${
                      selectedLine === 'western'
                        ? 'bg-[#3E8BFF] text-white'
                        : 'bg-[var(--surface)] text-[var(--fg-muted)] border border-[var(--border)]'
                    }`}
                  >
                    WR
                  </button>
                  <button
                    onClick={() => { setSelectedLine('harbour'); setMobileMenuOpen(false); }}
                    className={`h-7 rounded-[6px] text-[11px] font-mono font-bold transition-all ${
                      selectedLine === 'harbour'
                        ? 'bg-[#30A46C] text-white'
                        : 'bg-[var(--surface)] text-[var(--fg-muted)] border border-[var(--border)]'
                    }`}
                  >
                    HR
                  </button>
                </div>
              </div>

              {/* All 8 Navigation items */}
              <div className="space-y-1 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] block mb-1">
                  System Views
                </span>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full h-[38px] px-3 rounded-[6px] flex items-center gap-3 text-[13px] font-medium transition-colors text-left cursor-pointer ${
                        active
                          ? 'bg-[var(--surface-hover)] text-[var(--fg)] font-semibold border-l-2 border-[#0070F3]'
                          : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="flex-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer: Theme & User */}
            <div className="pt-3 border-t border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between bg-[var(--surface)] p-1 rounded-[6px] border border-[var(--border)]">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-1 text-xs flex items-center justify-center gap-1 rounded transition-colors ${
                    theme === 'light' ? 'bg-[var(--surface-hover)] text-[var(--fg)] font-medium' : 'text-[var(--fg-subtle)]'
                  }`}
                >
                  <Sun size={13} /> Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-1 text-xs flex items-center justify-center gap-1 rounded transition-colors ${
                    theme === 'dark' ? 'bg-[var(--surface-hover)] text-[var(--fg)] font-medium' : 'text-[var(--fg-subtle)]'
                  }`}
                >
                  <Moon size={13} /> Dark
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="w-7 h-7 rounded-full bg-[var(--border-strong)] flex items-center justify-center font-mono font-bold text-[var(--fg)]">
                  CR
                </div>
                <div className="truncate flex-1">
                  <div className="font-medium text-[var(--fg)] leading-none">Divisional Planner</div>
                  <div className="text-[10px] text-[var(--fg-subtle)] font-mono mt-0.5">Mumbai Division</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[var(--bg-2)]/95 backdrop-blur-md border-t border-[var(--border)] z-40 flex items-center justify-around px-1">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
                active ? 'text-[#0070F3]' : 'text-[var(--fg-subtle)]'
              }`}
            >
              <Icon size={16} />
              <span className="mt-0.5 truncate max-w-[60px]">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
            mobileMenuOpen ? 'text-[#0070F3]' : 'text-[var(--fg-subtle)]'
          }`}
        >
          <Menu size={16} />
          <span className="mt-0.5">More</span>
        </button>
      </nav>
    </div>
  );
};
