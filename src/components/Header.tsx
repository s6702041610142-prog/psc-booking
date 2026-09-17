import React, { useState } from 'react';
import { 
  Building2, 
  CalendarDays, 
  CheckSquare, 
  Clock, 
  BarChart3, 
  FileCode2, 
  UserCheck, 
  GraduationCap, 
  ShieldCheck, 
  Layers,
  Phone,
  ExternalLink,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  RotateCcw,
  LogOut
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  onSelectUser?: (user: User) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingApprovalsCount: number;
  onQuickBook?: () => void;
  onOpenResetModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser: _onSelectUser,
  activeTab,
  onTabChange,
  pendingApprovalsCount,
  onQuickBook,
  onOpenResetModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-[#D6297E] border border-pink-200">
            <GraduationCap className="w-3 h-3" /> นักศึกษา
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1877C9] border border-blue-200">
            <UserCheck className="w-3 h-3" /> อาจารย์ผู้สอน
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3" /> งานอาคาร / แอดมิน
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e7edf6] shadow-sm">
      {/* Top Bar - Official PSC Identity Info */}
      <div className="bg-[#0C1A4B] text-white px-4 py-1.5 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span className="inline-flex items-center gap-1 text-pink-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-ping inline-block"></span>
              PSC Smart Campus 2026
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#2B9BE0]" /> 0 2967 5050
            </span>
            <span className="hidden sm:inline">Line@: @psc1972</span>
            <span className="hidden lg:inline bg-white/10 px-2 py-0.5 rounded text-[10px] text-amber-300">
              EST. 1972 (50+ ปีแห่งคุณภาพ)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <a 
              href="https://pongsawadi.ac.th/psc2023/" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-300 hover:text-white hover:underline transition-colors"
            >
              <span>เว็บไซต์วิทยาลัย pongsawadi.ac.th</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand matching https://pongsawadi.ac.th/psc2023/ */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => onTabChange('rooms')}
          >
            <img 
              src="https://pongsawadi.ac.th/psc2023/wp-content/uploads/2026/07/%E0%B8%95%E0%B8%A3%E0%B8%B2-LOGO-01-scaled.png" 
              alt="วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์" 
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-transform group-hover:scale-105 duration-200 shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-bold text-[#0C1A4B] text-base sm:text-lg leading-tight tracking-tight font-kanit">
                วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์
              </span>
              <span className="text-[11px] sm:text-xs text-[#5b6785] font-medium tracking-wide">
                Pongsawadi Technological College • ระบบจองห้องเรียนออนไลน์
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 font-medium text-sm">
            <button
              onClick={() => onTabChange('rooms')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full transition-all ${
                activeTab === 'rooms'
                  ? 'bg-pink-50 text-[#D6297E] font-semibold border border-pink-200'
                  : 'text-[#16223f] hover:text-[#D6297E] hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              ห้องเรียน & แล็บ
            </button>

            <button
              onClick={() => onTabChange('calendar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full transition-all ${
                activeTab === 'calendar'
                  ? 'bg-pink-50 text-[#D6297E] font-semibold border border-pink-200'
                  : 'text-[#16223f] hover:text-[#D6297E] hover:bg-slate-50'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              ผังการใช้งานห้อง
            </button>

            <button
              onClick={() => onTabChange('my-bookings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full transition-all ${
                activeTab === 'my-bookings'
                  ? 'bg-pink-50 text-[#D6297E] font-semibold border border-pink-200'
                  : 'text-[#16223f] hover:text-[#D6297E] hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              รายการจองของฉัน
            </button>

            {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
              <button
                onClick={() => onTabChange('approvals')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full transition-all ${
                  activeTab === 'approvals'
                    ? 'bg-pink-50 text-[#D6297E] font-semibold border border-pink-200'
                    : 'text-[#16223f] hover:text-[#D6297E] hover:bg-slate-50'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                อนุมัติคำขอ
                {pendingApprovalsCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#EC4899] text-white shadow-sm animate-pulse">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full transition-all ${
                activeTab === 'analytics'
                  ? 'bg-pink-50 text-[#D6297E] font-semibold border border-pink-200'
                  : 'text-[#16223f] hover:text-[#D6297E] hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              สถิติภาพรวม
            </button>

            <button
              onClick={() => onTabChange('architecture')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full transition-all ${
                activeTab === 'architecture'
                  ? 'bg-blue-50 text-[#1877C9] font-semibold border border-blue-200'
                  : 'text-[#16223f] hover:text-[#1877C9] hover:bg-slate-50'
              }`}
            >
              <FileCode2 className="w-4 h-4 text-[#2B9BE0]" />
              สถาปัตยกรรม & API
            </button>
          </nav>

          {/* Right Section: Role Switcher & Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reset Classrooms Action Button (Teachers & Admins only) */}
            {onOpenResetModal && (currentUser.role === 'teacher' || currentUser.role === 'admin') && (
              <button
                onClick={onOpenResetModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold transition-all shadow-2xs group"
                title="รีเซ็ตข้อมูลห้องเรียนและตารางการจอง (เฉพาะอาจารย์และผู้ดูแลระบบ)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600 group-hover:-rotate-90 transition-transform duration-300" />
                <span>รีเซ็ตห้องเรียน</span>
              </button>
            )}
            
            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl border border-[#e7edf6] bg-[#f5f8fd] hover:bg-white hover:shadow-sm transition-all text-xs"
                title="คลิกเพื่อสลับบทบาทผู้ใช้งาน (นักศึกษา/อาจารย์/แอดมิน)"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#EC4899]/30"
                />
                <div className="hidden md:block text-left">
                  <div className="font-bold text-[#0C1A4B] line-clamp-1">{currentUser.name}</div>
                  <div className="text-[11px] text-[#5b6785] flex items-center gap-1.5">
                    {getRoleBadge(currentUser.role)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Profile Dropdown */}
              {roleDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#e7edf6] p-3 z-50 animate-in fade-in slide-in-from-top-2">
                    {/* Current User Info Card */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-[#D6297E]/30 shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-bold text-[#0C1A4B] text-sm">{currentUser.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.code}</div>
                        <div className="mt-1">
                          {getRoleBadge(currentUser.role)}
                        </div>
                      </div>
                    </div>

                    {/* Logout Button */}
                    {onLogout && (
                      <div>
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition-colors shadow-2xs"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>ออกจากระบบ (Logout)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Logout Quick Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs font-bold transition-all shadow-2xs"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออก</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-[#e7edf6] hover:bg-slate-100 text-[#0C1A4B]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Expanded Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#e7edf6] space-y-1.5 animate-in fade-in duration-150">
            <button
              onClick={() => { onTabChange('rooms'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === 'rooms' ? 'bg-pink-50 text-[#D6297E] font-bold' : 'text-[#16223f] hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              ห้องเรียน & แล็บ
            </button>

            <button
              onClick={() => { onTabChange('calendar'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === 'calendar' ? 'bg-pink-50 text-[#D6297E] font-bold' : 'text-[#16223f] hover:bg-slate-50'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              ผังการใช้งานห้อง
            </button>

            <button
              onClick={() => { onTabChange('my-bookings'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === 'my-bookings' ? 'bg-pink-50 text-[#D6297E] font-bold' : 'text-[#16223f] hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              รายการจองของฉัน
            </button>

            {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
              <button
                onClick={() => { onTabChange('approvals'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
                  activeTab === 'approvals' ? 'bg-pink-50 text-[#D6297E] font-bold' : 'text-[#16223f] hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4" />
                  อนุมัติคำขอ
                </span>
                {pendingApprovalsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EC4899] text-white">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => { onTabChange('analytics'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === 'analytics' ? 'bg-pink-50 text-[#D6297E] font-bold' : 'text-[#16223f] hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              สถิติภาพรวม
            </button>

            <button
              onClick={() => { onTabChange('architecture'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === 'architecture' ? 'bg-blue-50 text-[#1877C9] font-bold' : 'text-[#16223f] hover:bg-slate-50'
              }`}
            >
              <FileCode2 className="w-4 h-4 text-[#2B9BE0]" />
              สถาปัตยกรรมฐานข้อมูล & API
            </button>

            {onOpenResetModal && (currentUser.role === 'teacher' || currentUser.role === 'admin') && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => { onOpenResetModal(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  รีเซ็ตข้อมูลห้องเรียน (เฉพาะอาจารย์/แอดมิน)
                </button>
              </div>
            )}

            {onLogout && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  ออกจากระบบ (Logout)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
