import React, { useState } from 'react';
import { User } from '../types';
import { PSC_USERS } from '../data/mockData';
import { 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  School
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick fill helper for testing
  const handleQuickFill = (userVal: string, passVal: string) => {
    setUsername(userVal);
    setPassword(passVal);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านให้ครบถ้วน');
      return;
    }

    setIsLoading(true);

    // Simulate quick authentication check
    setTimeout(() => {
      let matchedUser: User | null = null;

      // Check credentials based on specification
      if (trimmedUser === 'student' && trimmedPass === '1234') {
        matchedUser = PSC_USERS.find((u) => u.role === 'student') || PSC_USERS[0];
      } else if (trimmedUser === 'teacher' && trimmedPass === 'root') {
        matchedUser = PSC_USERS.find((u) => u.role === 'teacher') || PSC_USERS[1];
      } else if (trimmedUser === 'root' && trimmedPass === 'root') {
        matchedUser = PSC_USERS.find((u) => u.role === 'admin') || PSC_USERS[3];
      }

      if (matchedUser) {
        // Store in localStorage for session persistence
        localStorage.setItem('psc_auth_user', JSON.stringify(matchedUser));
        onLoginSuccess(matchedUser);
      } else {
        setErrorMessage('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081232] via-[#0C1A4B] to-[#1a2d6b] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden font-prompt">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#D6297E]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#1877C9]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header info */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between text-xs text-slate-300 relative z-10">
        <div className="flex items-center gap-2">
          <School className="w-4 h-4 text-[#2B9BE0]" />
          <span className="font-semibold tracking-wide">วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์ (PSC)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="hidden sm:inline">ระบบออนไลน์พร้อมใช้งาน • Cloud Connected</span>
        </div>
      </div>

      {/* Center Card */}
      <div className="max-w-md sm:max-w-lg w-full mx-auto my-auto py-6 relative z-10">
        <div className="bg-white/95 backdrop-blur-xl text-[#16223f] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Logo & College Identity */}
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-white shadow-md border border-slate-100 ring-4 ring-pink-50">
              <img
                src="https://pongsawadi.ac.th/psc2023/wp-content/uploads/2023/01/psc150.png"
                alt="ตราสัญลักษณ์วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto transition-transform hover:scale-105 duration-200"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0C1A4B] font-kanit">
                เข้าสู่ระบบจองห้องเรียนออนไลน์
              </h1>
              <p className="text-xs sm:text-sm text-[#5b6785] mt-1 font-medium">
                Pongsawadi Technological College • Classroom Booking
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-[#0C1A4B] mb-1.5 font-kanit">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้งาน (เช่น student, teacher, root)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-[#16223f] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D6297E] focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#0C1A4B] font-kanit">
                  รหัสผ่าน (Password)
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-[#16223f] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D6297E] focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0C1A4B] transition-colors"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 font-kanit"
              style={{
                background: 'linear-gradient(135deg, #D6297E 0%, #B81D67 100%)',
                boxShadow: '0 8px 20px -6px rgba(214, 41, 126, 0.5)'
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังตรวจสอบข้อมูล...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ (Sign In)</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#5b6785] font-semibold">
                หรือคลิกเลือกบัญชีทดสอบด่วน (Demo Accounts)
              </span>
            </div>
          </div>

          {/* Quick Login Account Cards */}
          <div className="space-y-2">
            {/* Student */}
            <button
              type="button"
              onClick={() => handleQuickFill('student', '1234')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0C1A4B] group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                    <span>นักศึกษา (Student)</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.2 rounded-full">นักศึกษา</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    User: <strong className="text-slate-800">student</strong> • Pass: <strong className="text-slate-800">1234</strong>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                คลิกกรอก <ArrowRight className="w-3 h-3" />
              </span>
            </button>

            {/* Teacher */}
            <button
              type="button"
              onClick={() => handleQuickFill('teacher', 'root')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0C1A4B] group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                    <span>อาจารย์ (Teacher)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">อนุมัติได้</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    User: <strong className="text-slate-800">teacher</strong> • Pass: <strong className="text-slate-800">root</strong>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                คลิกกรอก <ArrowRight className="w-3 h-3" />
              </span>
            </button>

            {/* Admin */}
            <button
              type="button"
              onClick={() => handleQuickFill('root', 'root')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-pink-100 bg-pink-50/50 hover:bg-pink-50 hover:border-pink-300 transition-all text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-100 text-[#D6297E] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0C1A4B] group-hover:text-[#D6297E] transition-colors flex items-center gap-1.5">
                    <span>ผู้ดูแลระบบ (Admin)</span>
                    <span className="text-[10px] bg-pink-100 text-[#D6297E] px-2 py-0.2 rounded-full font-bold">สิทธิ์สูงสุด</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    User: <strong className="text-slate-800">root</strong> • Pass: <strong className="text-slate-800">root</strong>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-[#D6297E] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                คลิกกรอก <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-xs text-slate-300 space-y-1">
          <p>© 2026 วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์ (Pongsawadi Technological College)</p>
          <p className="text-[11px] text-slate-400">
            ระบบจัดเก็บข้อมูลบน Google Cloud Firestore • ซิงค์ข้ามเครื่องแบบ Real-time
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-4xl mx-auto w-full text-center text-[11px] text-slate-400 py-2">
        <span>ติดต่อสอบถามข้อมูลการใช้งาน: งานศูนย์คอมพิวเตอร์และอาคารสถานที่ วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์ โทร 02-588-1234</span>
      </div>
    </div>
  );
};
