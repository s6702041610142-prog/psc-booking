import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  QrCode, 
  Trash2, 
  MapPin, 
  Users, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Booking, User } from '../types';

interface MyBookingsProps {
  bookings: Booking[];
  currentUser: User;
  onCancelBooking: (bookingId: string) => void;
  onOpenNewBooking: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  bookings,
  currentUser,
  onCancelBooking,
  onOpenNewBooking,
}) => {
  const [selectedQrBooking, setSelectedQrBooking] = useState<Booking | null>(null);

  // Filter bookings belonging to currentUser
  const myBookings = bookings.filter((b) => b.userId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6600]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              ประวัติและสถานะการจองห้องเรียนของฉัน
            </h2>
            <p className="text-xs text-slate-500">
              บัญชี: {currentUser.name} ({currentUser.code}) • สังกัด {currentUser.department}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewBooking}
          className="px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#00387A] text-white font-semibold text-xs transition-colors shadow-sm"
        >
          + ขอจองห้องเรียนใหม่
        </button>
      </div>

      {/* Bookings List */}
      {myBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">คุณยังไม่มีประวัติการจองห้องเรียน</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            เลือกดูห้องปฏิบัติการคอมพิวเตอร์ หรือห้องเรียนอัจฉริยะ และทำรายการจองได้ง่ายๆ ตลอด 24 ชม.
          </p>
          <button
            onClick={onOpenNewBooking}
            className="mt-2 px-4 py-2 rounded-xl bg-[#FF6600] text-white text-xs font-semibold hover:bg-[#EA580C] transition-colors"
          >
            ค้นหาห้องว่างเพื่อจองตอนนี้
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myBookings.map((b) => {
            const isApproved = b.status === 'approved';
            const isPending = b.status === 'pending';
            const isRejected = b.status === 'rejected';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                      {b.bookingNumber}
                    </span>
                    {isPending && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> รออนุมัติ
                      </span>
                    )}
                    {isApproved && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> อนุมัติแล้ว
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" /> ไม่อนุมัติ
                      </span>
                    )}
                  </div>

                  {/* Room Name */}
                  <div>
                    <h3 className="text-base font-bold text-[#002D62]">
                      {b.roomCode}: {b.roomName}
                    </h3>
                    <p className="text-xs text-slate-700 font-medium mt-1">
                      {b.purpose}
                    </p>
                  </div>

                  {/* Schedule Details */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">วันที่ใช้งาน:</span>
                      <span className="font-bold text-slate-800">{b.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">ช่วงเวลา:</span>
                      <span className="font-bold text-[#002D62]">{b.startTime} - {b.endTime} น.</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">จำนวนผู้เข้าใช้:</span>
                      <span>{b.attendeeCount} คน</span>
                    </div>
                    {b.advisorTeacherName && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">อาจารย์ผู้รับผิดชอบ:</span>
                        <span className="font-medium text-slate-700">{b.advisorTeacherName}</span>
                      </div>
                    )}
                  </div>

                  {b.rejectionReason && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                      <strong>เหตุผล:</strong> {b.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {isApproved ? (
                    <button
                      onClick={() => setSelectedQrBooking(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#002D62]" />
                      <span>QR ปลดล็อกห้อง</span>
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {isPending && (
                    <button
                      onClick={() => onCancelBooking(b.id)}
                      className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 hover:underline font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      ยกเลิกคำขอนี้
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Pass Modal Simulator */}
      {selectedQrBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#002D62]">PSC Digital Smart Pass</h3>
              <p className="text-xs text-slate-500">สแกนที่เครื่องอ่านประตูห้องเรียนเพื่อเข้าใช้งาน</p>
            </div>

            {/* Generated Mock QR visual */}
            <div className="p-4 bg-slate-900 rounded-2xl text-white inline-block shadow-inner">
              <div className="w-44 h-44 bg-white p-3 rounded-xl flex items-center justify-center">
                {/* SVG QR representation */}
                <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v4h-2v-4zm-4-2h2v2h-2v-2zm4-2h4v2h-4v-2zm-2 4v2h-2v-2h2zm2 2v2h2v-2h-2zm-6-2h2v4h-2v-4zm4-6h2v2h-2v-2zm2 2h2v2h-2v-2zm-4 0h2v2h-2v-2z" />
                </svg>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1 text-left">
              <div className="font-bold text-slate-800">{selectedQrBooking.roomCode} - {selectedQrBooking.roomName}</div>
              <div>วันที่: {selectedQrBooking.date} เวลา: {selectedQrBooking.startTime} - {selectedQrBooking.endTime} น.</div>
              <div className="text-[11px] text-emerald-700 font-mono">CODE: {selectedQrBooking.bookingNumber}</div>
            </div>

            <button
              onClick={() => setSelectedQrBooking(null)}
              className="w-full py-2 rounded-xl bg-[#002D62] text-white text-xs font-semibold hover:bg-[#00387A]"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
