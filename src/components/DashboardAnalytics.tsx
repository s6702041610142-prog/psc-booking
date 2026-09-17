import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Monitor, 
  Building2, 
  ShieldCheck, 
  PieChart, 
  Zap,
  Activity
} from 'lucide-react';
import { Room, Booking } from '../types';
import { getTodayDateStr } from '../data/mockData';

interface DashboardAnalyticsProps {
  rooms: Room[];
  bookings: Booking[];
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  rooms,
  bookings,
}) => {
  const todayStr = getTodayDateStr(0);

  const totalBookings = bookings.length;
  const todayBookings = bookings.filter((b) => b.date === todayStr);
  const approvedBookings = bookings.filter((b) => b.status === 'approved').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  const approvalRate = totalBookings > 0 ? Math.round((approvedBookings / totalBookings) * 100) : 0;

  // Calculate usage count per room
  const roomUsageMap: { [key: string]: number } = {};
  bookings.forEach((b) => {
    roomUsageMap[b.roomCode] = (roomUsageMap[b.roomCode] || 0) + 1;
  });

  const popularRooms = Object.entries(roomUsageMap)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#002D62]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              รายงานและสถิติภาพรวมการใช้ห้องเรียน (Analytics Dashboard)
            </h2>
            <p className="text-xs text-slate-500">
              วิเคราะห์ความถี่การใช้งานห้องปฏิบัติการและอัตราการจัดสรรพื้นที่การเรียนรู้
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>Realtime Data Synced</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">ห้องเรียนทั้งหมด</div>
            <div className="text-2xl font-black text-[#002D62] mt-1">{rooms.length} ห้อง</div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> พร้อมใช้งาน 100%
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#002D62] flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">การจองในวันนี้</div>
            <div className="text-2xl font-black text-[#FF6600] mt-1">{todayBookings.length} รายการ</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {todayBookings.filter((b) => b.status === 'approved').length} รายการอนุมัติแล้ว
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6600] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">อัตราการอนุมัติ</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{approvalRate}%</div>
            <div className="text-[11px] text-slate-500 mt-1">
              จากคำขอทั้งหมด {totalBookings} รายการ
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">คำขอรอตรวจสอบ</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{pendingBookings} รายการ</div>
            <div className="text-[11px] text-amber-600 mt-1 font-medium">
              ต้องดำเนินการพิจารณา
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Rooms Ranking */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              สถิติห้องเรียนและแล็บที่มีการใช้งานสูงสุด
            </h3>
            <span className="text-xs text-slate-400 font-medium">ความถี่การจอง</span>
          </div>

          <div className="space-y-3 pt-2">
            {rooms.map((room) => {
              const count = roomUsageMap[room.code] || 0;
              const percentage = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;

              return (
                <div key={room.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF6600]"></span>
                      {room.code}: {room.name}
                    </span>
                    <span className="font-mono text-slate-600 font-medium">
                      {count} ครั้ง ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#002D62] to-[#FF6600] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Slot Peak Hours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">
            ช่วงเวลาที่มีการใช้งานหนาแน่น (Peak Hours)
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-orange-900">ช่วงบ่าย (13:00 - 15:00 น.)</div>
                <div className="text-[11px] text-orange-700">ชั่วโมงยอดนิยมสำหรับการเรียนการสอนปฏิบัติการ</div>
              </div>
              <span className="px-2 py-1 rounded bg-[#FF6600] text-white font-bold text-[11px]">
                Peak
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-900">ช่วงเช้า (08:30 - 10:30 น.)</div>
                <div className="text-[11px] text-blue-700">วิชาบรรยายและสัมมนาช่วงเช้า</div>
              </div>
              <span className="px-2 py-1 rounded bg-[#002D62] text-white font-bold text-[11px]">
                Medium
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">ช่วงเย็น (17:00 - 18:30 น.)</div>
                <div className="text-[11px] text-slate-500">ติวสอบและแข่งขันโครงงานวิชาชีพ</div>
              </div>
              <span className="px-2 py-1 rounded bg-slate-200 text-slate-700 font-bold text-[11px]">
                Regular
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
            * วิทยาลัยเปิดระบบให้จองล่วงหน้าได้สูงสุด 14 วันทำการ
          </div>
        </div>
      </div>
    </div>
  );
};
