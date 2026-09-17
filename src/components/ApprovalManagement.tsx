import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  Building, 
  AlertCircle,
  Search,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { Booking, BookingStatus, User as CurrentUserType } from '../types';

interface ApprovalManagementProps {
  bookings: Booking[];
  currentUser: CurrentUserType;
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string, reason: string) => void;
}

export const ApprovalManagement: React.FC<ApprovalManagementProps> = ({
  bookings,
  currentUser,
  onApproveBooking,
  onRejectBooking,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.userName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.userCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.roomName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.roomCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.purpose.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const approvedCount = bookings.filter((b) => b.status === 'approved').length;
  const rejectedCount = bookings.filter((b) => b.status === 'rejected').length;

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingBookingId) return;
    onRejectBooking(rejectingBookingId, rejectReason || 'ไม่ผ่านเกณฑ์การพิจารณาการใช้ห้องเรียน');
    setRejectingBookingId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e7edf6] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-[#D6297E]">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0C1A4B] font-kanit flex items-center gap-2">
              ระบบตรวจสอบและอนุมัติการจองห้องเรียน
              <span className="text-xs font-semibold text-[#1877C9] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                สิทธิ์: {currentUser.role === 'admin' ? 'ผู้ดูแลระบบอาคาร' : 'อาจารย์ผู้รับผิดชอบ'}
              </span>
            </h2>
            <p className="text-xs text-[#5b6785]">
              พิจารณาคำขอจองห้องเรียนของนักศึกษาและบุคลากร ตรวจสอบความถูกต้องและป้องกันความซ้ำซ้อน
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5b6785]" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้จอง, รหัส, เลขที่คำขอ..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e7edf6] text-xs focus:ring-2 focus:ring-[#EC4899] bg-[#f5f8fd]/50 focus:bg-white text-[#16223f]"
          />
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-[#e7edf6] pb-1 text-xs font-semibold">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all ${
            filterStatus === 'pending'
              ? 'bg-[#D6297E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>รออนุมัติ</span>
          {pendingCount > 0 && (
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
              filterStatus === 'pending' ? 'bg-white text-[#D6297E]' : 'bg-[#EC4899] text-white'
            }`}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterStatus('approved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all ${
            filterStatus === 'approved'
              ? 'bg-[#0C1A4B] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>อนุมัติแล้ว ({approvedCount})</span>
        </button>

        <button
          onClick={() => setFilterStatus('rejected')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all ${
            filterStatus === 'rejected'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>ไม่อนุมัติ ({rejectedCount})</span>
        </button>

        <button
          onClick={() => setFilterStatus('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all ${
            filterStatus === 'all'
              ? 'bg-[#0C1A4B] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>ทั้งหมด ({bookings.length})</span>
        </button>
      </div>

      {/* Bookings Approval List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
            <ShieldCheck className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">ไม่พบรายการคำขอในหมวดหมู่นี้</h3>
            <p className="text-xs text-slate-400">
              ไม่มีคำขอที่ตรงกับเงื่อนไขการค้นหาในปัจจุบัน
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const isPending = booking.status === 'pending';
            const isApproved = booking.status === 'approved';
            const isRejected = booking.status === 'rejected';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md border border-slate-200">
                      {booking.bookingNumber}
                    </span>
                    <span className="text-xs font-bold text-[#002D62] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {booking.roomCode}: {booking.roomName}
                    </span>
                    {/* Status Badge */}
                    {isPending && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> รอการพิจารณา
                      </span>
                    )}
                    {isApproved && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> อนุมัติแล้ว
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" /> ไม่อนุมัติ
                      </span>
                    )}
                  </div>

                  {/* Purpose */}
                  <div className="text-sm font-semibold text-slate-800">
                    {booking.purpose}
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>ผู้ขอ: <strong className="text-slate-700">{booking.userName}</strong> ({booking.userCode})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>วันที่: <strong className="text-slate-700">{booking.date}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>เวลา: <strong className="text-slate-700">{booking.startTime} - {booking.endTime} น.</strong></span>
                    </div>
                    <div>
                      <span>จำนวน: {booking.attendeeCount} คน</span>
                    </div>
                  </div>

                  {/* Advisor Teacher Info */}
                  {booking.advisorTeacherName && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block">
                      อาจารย์ที่ปรึกษา/ผู้รับผิดชอบ: <strong className="text-slate-800">{booking.advisorTeacherName}</strong>
                    </div>
                  )}

                  {/* Rejection Note */}
                  {booking.rejectionReason && (
                    <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      <strong>เหตุผลที่ไม่อนุมัติ:</strong> {booking.rejectionReason}
                    </div>
                  )}

                  {/* Approved By Stamp */}
                  {booking.approvedByName && (
                    <div className="text-[11px] text-emerald-700">
                      อนุมัติโดย: {booking.approvedByName} เมื่อ {booking.approvedAt}
                    </div>
                  )}
                </div>

                {/* Right Action Buttons */}
                {isPending && (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => setRejectingBookingId(booking.id)}
                      className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      ไม่อนุมัติ
                    </button>
                    <button
                      onClick={() => onApproveBooking(booking.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs transition-all shadow-sm shadow-emerald-200 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      อนุมัติการจอง
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              ระบุเหตุผลการไม่อนุมัติ
            </h3>
            <p className="text-xs text-slate-500">
              แจ้งเหตุผลให้ผู้ยื่นคำขอทราบ เช่น ติดกิจกรรมวิทยาลัย, อุปกรณ์ห้องกำลังซ่อมบำรุง หรือเอกสารไม่ครบถ้วน
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="ระบุเหตุผล..."
              className="w-full p-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingBookingId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
