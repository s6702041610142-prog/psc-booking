import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoomCatalog } from './components/RoomCatalog';
import { CalendarTimeline } from './components/CalendarTimeline';
import { BookingModal } from './components/BookingModal';
import { ApprovalManagement } from './components/ApprovalManagement';
import { MyBookings } from './components/MyBookings';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { SystemArchitectureModal } from './components/SystemArchitectureModal';
import { ResetClassroomModal } from './components/ResetClassroomModal';
import { LoginPage } from './components/LoginPage';
import { PSC_USERS, PSC_ROOMS, INITIAL_BOOKINGS } from './data/mockData';
import { Room, Booking, User } from './types';
import { CheckCircle2, Bell, Cloud, RefreshCw } from 'lucide-react';
import { 
  subscribeRooms, 
  subscribeBookings, 
  addBooking as addBookingToDb, 
  updateBookingStatus as updateBookingStatusInDb, 
  resetAllToDefault as resetAllToDefaultInDb,
  clearAllBookings as clearAllBookingsInDb,
  resetSingleRoom as resetSingleRoomInDb,
  seedInitialDataIfEmpty
} from './lib/firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('psc_auth_user');
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch (e) {
      console.error('Error loading stored user:', e);
    }
    return null; // Show LoginPage on first load
  });

  const [rooms, setRooms] = useState<Room[]>(PSC_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeTab, setActiveTab] = useState<string>('rooms');
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  
  // Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetRoomId, setResetTargetRoomId] = useState<string | undefined>(undefined);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Subscribe to real-time Firestore database updates
  useEffect(() => {
    seedInitialDataIfEmpty();

    const unsubRooms = subscribeRooms((updatedRooms) => {
      if (updatedRooms && updatedRooms.length > 0) {
        setRooms(updatedRooms);
      }
      setIsCloudConnected(true);
      setIsSyncing(false);
    });

    const unsubBookings = subscribeBookings((updatedBookings) => {
      setBookings(updatedBookings);
      setIsCloudConnected(true);
      setIsSyncing(false);
    });

    return () => {
      unsubRooms();
      unsubBookings();
    };
  }, []);

  // Reset Handlers (Teachers & Admins only)
  const handleOpenResetModal = (roomId?: string) => {
    if (!currentUser || currentUser.role === 'student') {
      showToast('ขออภัย! สิทธิ์นักศึกษาไม่สามารถรีเซ็ตห้องเรียนได้ (อนุญาตเฉพาะอาจารย์หรือผู้ดูแลระบบเท่านั้น)', 'error');
      return;
    }
    setResetTargetRoomId(roomId);
    setIsResetModalOpen(true);
  };

  const handleResetAllToDefault = async () => {
    if (!currentUser || currentUser.role === 'student') {
      showToast('ขออภัย! เฉพาะอาจารย์หรือผู้ดูแลระบบเท่านั้นที่มีสิทธิ์รีเซ็ตระบบ', 'error');
      return;
    }
    try {
      await resetAllToDefaultInDb();
      showToast('รีเซ็ตข้อมูลห้องเรียนและตารางการจองกลับเป็นค่าเริ่มต้นบน Cloud เรียบร้อยแล้ว (ซิงค์ทุกเครื่อง)', 'success');
    } catch (err) {
      console.error(err);
      setRooms(PSC_ROOMS);
      setBookings(INITIAL_BOOKINGS);
      showToast('รีเซ็ตข้อมูลห้องเรียนกลับเป็นค่าเริ่มต้นมาตรฐานเรียบร้อยแล้ว', 'success');
    }
  };

  const handleClearAllBookings = async () => {
    if (!currentUser || currentUser.role === 'student') {
      showToast('ขออภัย! เฉพาะอาจารย์หรือผู้ดูแลระบบเท่านั้นที่มีสิทธิ์ล้างการจอง', 'error');
      return;
    }
    try {
      await clearAllBookingsInDb();
      showToast('ล้างการจองทั้งหมดบน Cloud สำเร็จ! ห้องเรียนทุกเครื่องว่าง 100% พร้อมให้จองใหม่', 'success');
    } catch (err) {
      console.error(err);
      setBookings([]);
      setRooms((prev) => prev.map((r) => ({ ...r, status: 'available' })));
      showToast('ล้างการจองทั้งหมดแล้ว', 'success');
    }
  };

  const handleResetSingleRoom = async (roomId: string) => {
    if (!currentUser || currentUser.role === 'student') {
      showToast('ขออภัย! เฉพาะอาจารย์หรือผู้ดูแลระบบเท่านั้นที่มีสิทธิ์รีเซ็ตห้องเรียน', 'error');
      return;
    }
    const targetRoom = rooms.find((r) => r.id === roomId);
    try {
      await resetSingleRoomInDb(roomId);
      showToast(`รีเซ็ตห้อง ${targetRoom?.code || roomId} และล้างการจองบน Cloud เรียบร้อยแล้ว`, 'success');
    } catch (err) {
      console.error(err);
      setBookings((prev) => prev.filter((b) => b.roomId !== roomId));
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status: 'available' } : r)));
      showToast(`รีเซ็ตห้อง ${targetRoom?.code || roomId} เรียบร้อยแล้ว`, 'success');
    }
  };

  // Login & Logout Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    const roleLabel = user.role === 'admin' ? 'ผู้ดูแลระบบ' : user.role === 'teacher' ? 'อาจารย์' : 'นักศึกษา';
    showToast(`ยินดีต้อนรับ ${user.name} (${roleLabel}) เข้าสู่ระบบ PSC`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('psc_auth_user');
    setCurrentUser(null);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  // Open booking modal for a specific room
  const handleOpenBooking = (room: Room, defaultStartTime?: string, defaultEndTime?: string) => {
    setSelectedRoomForBooking(room);
    setIsBookingModalOpen(true);
  };

  // Submit new booking
  const handleSubmitBooking = async (newBooking: Booking) => {
    try {
      await addBookingToDb(newBooking);
      if (newBooking.status === 'approved') {
        showToast(`จองห้อง ${newBooking.roomCode} สำเร็จและได้รับการอนุมัติทันที! (บันทึกลง Cloud แล้ว)`, 'success');
      } else {
        showToast(`ส่งคำขอจองห้อง ${newBooking.roomCode} ไปยัง Cloud สำเร็จ กรุณารอการอนุมัติ`, 'info');
      }
    } catch (err) {
      console.error('Error saving booking to Firestore:', err);
      // Fallback to local state
      setBookings((prev) => [newBooking, ...prev]);
      showToast(`บันทึกคำขอจองห้อง ${newBooking.roomCode} เรียบร้อยแล้ว`, 'info');
    }
  };

  // Approve booking
  const handleApproveBooking = async (bookingId: string) => {
    if (!currentUser) return;
    const updateData = {
      approvedBy: currentUser.code,
      approvedByName: `${currentUser.name} (${currentUser.role === 'admin' ? 'เจ้าหน้าที่อาคาร' : 'อาจารย์'})`,
      approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    try {
      await updateBookingStatusInDb(bookingId, 'approved', updateData);
      showToast('อนุมัติคำขอจองห้องเรียนบน Cloud เรียบร้อยแล้ว (อัปเดตทุกเครื่องทันที)', 'success');
    } catch (err) {
      console.error(err);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'approved', ...updateData } : b))
      );
      showToast('อนุมัติคำขอจองห้องเรียนเรียบร้อยแล้ว', 'success');
    }
  };

  // Reject booking
  const handleRejectBooking = async (bookingId: string, reason: string) => {
    try {
      await updateBookingStatusInDb(bookingId, 'rejected', { rejectionReason: reason });
      showToast('ปฏิเสธคำขอจองห้องเรียนบน Cloud แล้ว', 'info');
    } catch (err) {
      console.error(err);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'rejected', rejectionReason: reason } : b))
      );
      showToast('ปฏิเสธคำขอจองห้องเรียนแล้ว', 'info');
    }
  };

  // Cancel own booking
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateBookingStatusInDb(bookingId, 'cancelled');
      showToast('ยกเลิกรายการจองห้องเรียนบน Cloud แล้ว', 'info');
    } catch (err) {
      console.error(err);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
      showToast('ยกเลิกรายการจองห้องเรียนแล้ว', 'info');
    }
  };

  const pendingApprovalsCount = bookings.filter((b) => b.status === 'pending').length;

  // If not logged in, display the LoginPage
  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold border ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                  : toastMessage.type === 'error'
                  ? 'bg-rose-900 text-rose-100 border-rose-700'
                  : 'bg-[#002D62] text-white border-blue-800'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Bell className="w-5 h-5 text-[#FF6600] shrink-0" />
              )}
              <span>{toastMessage.message}</span>
            </div>
          </div>
        )}
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-[#002D62] text-white border-blue-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Bell className="w-5 h-5 text-[#FF6600] shrink-0" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentUser={currentUser}
        onSelectUser={(user) => {
          setCurrentUser(user);
          localStorage.setItem('psc_auth_user', JSON.stringify(user));
          showToast(`สลับบัญชีใช้งานเป็น: ${user.name} (${user.role})`, 'info');
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenResetModal={() => handleOpenResetModal()}
        onLogout={handleLogout}
      />

      {/* Cloud Status Banner */}
      <div className="bg-gradient-to-r from-[#0C1A4B] via-[#122566] to-[#0C1A4B] text-white border-b border-white/10 py-2 px-4 sm:px-6 text-xs shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCloudConnected ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCloudConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-semibold font-prompt flex items-center gap-1.5">
              <span>{isCloudConnected ? 'ฐานข้อมูล Cloud Firestore เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อฐานข้อมูล Cloud...'}</span>
              <span className="text-slate-400 font-normal hidden sm:inline">• ข้อมูลซิงค์ทุกเครื่องแบบ Real-time</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
              <Cloud className="w-3.5 h-3.5 text-[#2B9BE0]" />
              <span>เปิดจากเครื่องอื่นหรือมือถือก็เห็นข้อมูลการจองตรงกันทันที</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Body Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'rooms' && (
          <RoomCatalog
            rooms={rooms}
            bookings={bookings}
            currentUser={currentUser}
            onBookRoom={(room) => handleOpenBooking(room)}
            onViewSchedule={(room) => {
              setActiveTab('calendar');
            }}
            onOpenResetModal={handleOpenResetModal}
            onQuickResetRoom={handleResetSingleRoom}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTimeline
            rooms={rooms}
            bookings={bookings}
            currentUser={currentUser}
            onBookSlot={(room, defaultStart, defaultEnd) => {
              handleOpenBooking(room, defaultStart, defaultEnd);
            }}
            onOpenResetModal={handleOpenResetModal}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalManagement
            bookings={bookings}
            currentUser={currentUser}
            onApproveBooking={handleApproveBooking}
            onRejectBooking={handleRejectBooking}
          />
        )}

        {activeTab === 'my-bookings' && (
          <MyBookings
            bookings={bookings}
            currentUser={currentUser}
            onCancelBooking={handleCancelBooking}
            onOpenNewBooking={() => {
              setSelectedRoomForBooking(rooms[0]);
              setIsBookingModalOpen(true);
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <DashboardAnalytics rooms={rooms} bookings={bookings} />
        )}

        {activeTab === 'architecture' && (
          <SystemArchitectureModal />
        )}
      </main>

      {/* Booking Form Modal */}
      {isBookingModalOpen && selectedRoomForBooking && (
        <BookingModal
          room={selectedRoomForBooking}
          currentUser={currentUser}
          existingBookings={bookings}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedRoomForBooking(null);
          }}
          onSubmitBooking={handleSubmitBooking}
        />
      )}

      {/* Reset Classroom Modal */}
      <ResetClassroomModal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetTargetRoomId(undefined);
        }}
        rooms={rooms}
        currentUser={currentUser}
        defaultRoomId={resetTargetRoomId}
        onResetAllToDefault={handleResetAllToDefault}
        onClearAllBookings={handleClearAllBookings}
        onResetSingleRoom={handleResetSingleRoom}
      />

      {/* Footer matching https://pongsawadi.ac.th/psc2023/ */}
      <footer className="bg-[#0C1A4B] text-slate-300 pt-10 pb-8 border-t-4 border-[#EC4899] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* College Brand Column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <img 
                  src="https://pongsawadi.ac.th/psc2023/wp-content/uploads/2026/07/%E0%B8%95%E0%B8%A3%E0%B8%B2-LOGO-01-scaled.png" 
                  alt="วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <div className="font-bold text-white text-base font-kanit">
                    วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์
                  </div>
                  <div className="text-[#2B9BE0] text-xs font-medium">
                    Pongsawadi Technological College (PSC)
                  </div>
                </div>
              </div>

              <address className="not-italic text-slate-400 text-xs leading-relaxed space-y-1">
                <p>14/5 หมู่ที่ 6 ถนนพิบูลสงคราม ตำบลสวนใหญ่ อำเภอเมือง จังหวัดนนทบุรี 11000</p>
                <p>
                  โทรศัพท์: <a href="tel:029675050" className="text-white hover:underline">0 2967 5050</a> | 
                  Line@: <span className="text-[#EC4899] font-semibold">@psc1972</span>
                </p>
              </address>

              <div className="flex items-center gap-3 pt-1">
                <a 
                  href="https://www.facebook.com/pongsawadi" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#1877C9] flex items-center justify-center text-white transition-colors"
                  title="Facebook"
                >
                  f
                </a>
                <a 
                  href="https://www.instagram.com/psc_pongsawadi/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#EC4899] flex items-center justify-center text-white transition-colors"
                  title="Instagram"
                >
                  ◎
                </a>
                <a 
                  href="https://www.tiktok.com/@pongsawadicollege" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
                  title="TikTok"
                >
                  ♪
                </a>
                <a 
                  href="https://www.youtube.com/@pongsawadicollege" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-600 flex items-center justify-center text-white transition-colors"
                  title="YouTube"
                >
                  ▶
                </a>
              </div>
            </div>

            {/* Student Services Links */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm font-kanit text-pink-300">
                สำหรับนักศึกษาและอาจารย์
              </h4>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li>
                  <a href="https://student.pongsawadi.ac.th/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    • ตรวจสอบผลการเรียน (Student Portal)
                  </a>
                </li>
                <li>
                  <a href="https://student.pongsawadi.ac.th/check-password/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    • ตรวจสอบรหัสผ่านนักศึกษา
                  </a>
                </li>
                <li>
                  <a href="http://itapp.pongsawadi.ac.th/login" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    • ระบบฝึกงานนักศึกษา
                  </a>
                </li>
                <li>
                  <a href="https://exam.pongsawadi.ac.th/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    • ระบบสอบออนไลน์
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick System Navigation */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm font-kanit text-blue-300">
                ระบบจองห้องเรียนออนไลน์
              </h4>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li>
                  <button onClick={() => setActiveTab('rooms')} className="hover:text-white transition-colors">
                    • ค้นหาและดูสเปกห้องเรียน
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('calendar')} className="hover:text-white transition-colors">
                    • ผังการใช้งานห้องเรียนรายสัปดาห์
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('my-bookings')} className="hover:text-white transition-colors">
                    • ตรวจสอบสถานะคำขอ / QR Pass
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('architecture')} className="text-pink-400 hover:text-pink-300 transition-colors font-semibold">
                    • สถาปัตยกรรมระบบ & REST API
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>
              © 2026 วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์ (PSC). สงวนลิขสิทธิ์ทุกประการ.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>PSC Smart Room Cloud v2.6.0 (Active)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
