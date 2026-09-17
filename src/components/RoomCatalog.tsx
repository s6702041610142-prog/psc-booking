import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Monitor, 
  Users, 
  Tv, 
  Wind, 
  Wifi, 
  Calendar, 
  CheckCircle2, 
  SlidersHorizontal,
  Zap,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Award,
  RotateCcw
} from 'lucide-react';
import { Room, RoomType, Booking, User } from '../types';
import { getTodayDateStr } from '../data/mockData';

interface RoomCatalogProps {
  rooms: Room[];
  bookings: Booking[];
  currentUser: User;
  onBookRoom: (room: Room) => void;
  onViewSchedule: (room: Room) => void;
  onOpenResetModal?: (roomId?: string) => void;
  onQuickResetRoom?: (roomId: string) => void;
}

export const RoomCatalog: React.FC<RoomCatalogProps> = ({
  rooms,
  bookings,
  currentUser,
  onBookRoom,
  onViewSchedule,
  onOpenResetModal,
  onQuickResetRoom,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [minCapacity, setMinCapacity] = useState<number>(0);

  const todayStr = getTodayDateStr(0);

  // Helper to determine real-time occupancy today
  const getRoomTodayStatus = (roomId: string) => {
    const todayBookings = bookings.filter(
      (b) => b.roomId === roomId && b.date === todayStr && b.status === 'approved'
    );
    if (todayBookings.length === 0) {
      return { statusText: 'ว่างตลอดทั้งวัน', isBusyNow: false, todayCount: 0 };
    }
    return {
      statusText: `มีจองแล้ว ${todayBookings.length} รายการวันนี้`,
      isBusyNow: todayBookings.length > 0,
      todayCount: todayBookings.length,
    };
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.equipments.some((eq) => eq.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === 'all' || room.roomType === selectedType;
      const matchesBuilding = selectedBuilding === 'all' || room.building.includes(selectedBuilding);
      const matchesCapacity = room.capacity >= minCapacity;

      return matchesSearch && matchesType && matchesBuilding && matchesCapacity;
    });
  }, [rooms, searchQuery, selectedType, selectedBuilding, minCapacity]);

  const getRoomTypeBadge = (type: RoomType) => {
    switch (type) {
      case 'computer_lab':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#1877C9] border border-blue-200/80">
            <Monitor className="w-3 h-3 text-[#1877C9]" /> คอมพิวเตอร์แล็บ
          </span>
        );
      case 'lecture':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-pink-50 text-[#D6297E] border border-pink-200/80">
            <Tv className="w-3 h-3 text-[#D6297E]" /> Smart Classroom
          </span>
        );
      case 'studio':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80">
            <Zap className="w-3 h-3 text-purple-700" /> สตูดิโอดิจิทัลมีเดีย
          </span>
        );
      case 'conference':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <Users className="w-3 h-3 text-emerald-700" /> หอประชุม / สัมมนา
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Section - In the exact style of https://pongsawadi.ac.th/psc2023/ */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 shadow-sm border border-[#e7edf6] psc-hero-gradient">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-[#D6297E] border border-pink-200">
              <Award className="w-3.5 h-3.5 text-[#EC4899]" />
              <span>PSC Smart Campus • สถาบันอาชีวศึกษาชั้นนำ EST. 1972</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0C1A4B] tracking-tight leading-tight">
              ระบบจองห้องเรียน & ห้องปฏิบัติการ{' '}
              <span className="bg-gradient-to-r from-[#D6297E] via-[#EC4899] to-[#1877C9] bg-clip-text text-transparent">
                วิทยาลัยเทคโนโลยีพงษ์สวัสดิ์
              </span>
            </h1>

            <p className="text-[#5b6785] text-sm sm:text-base leading-relaxed max-w-2xl">
              บริการค้นหาและจองห้องเรียนอัจฉริยะ (Active Learning), คอมพิวเตอร์แล็บสเปกสูง และสตูดิโองานมัลติมีเดีย 
              พร้อมระบบตรวจสอบเวลาชนกัน (Conflict Prevention) และการอนุมัติแบบเรียลไทม์
            </p>

            {/* Quick Metrics */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-[#5b6785]">
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#e7edf6] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>พร้อมใช้งาน <b>{rooms.length}</b> ห้อง</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#e7edf6] shadow-2xs">
                <Clock className="w-4 h-4 text-[#2B9BE0] shrink-0" />
                <span>เวลาเปิดบริการ <b>08:00 - 18:00 น.</b></span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#e7edf6] shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#EC4899] shrink-0" />
                <span>สิทธิ์ปัจจุบัน: <b className="text-[#0C1A4B]">{currentUser.name}</b></span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white aspect-4/3 group">
              <img
                src="https://pongsawadi.ac.th/psc2023/wp-content/uploads/2026/07/2.png"
                alt="PSC IT Center"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C1A4B]/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-xs font-bold text-pink-300">อาคาร 3 ศูนย์เทคโนโลยีสารสนเทศ</span>
                <span className="text-sm font-semibold">PSC Modern IT Laboratories</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#e7edf6] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5b6785]" />
            <input
              type="text"
              placeholder="ค้นหาห้องแล็บ, รหัสห้อง (เช่น LAB-301), ตึก หรืออุปกรณ์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e7edf6] text-sm text-[#16223f] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EC4899] focus:border-transparent transition-all bg-[#f5f8fd]/50 focus:bg-white"
            />
          </div>

          {/* Room Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#e7edf6] text-sm text-[#16223f] focus:outline-none focus:ring-2 focus:ring-[#EC4899] bg-white cursor-pointer"
            >
              <option value="all">ประเภทห้อง: ทั้งหมด</option>
              <option value="computer_lab">💻 ห้องปฏิบัติการคอมพิวเตอร์</option>
              <option value="lecture">📖 Smart Classroom</option>
              <option value="studio">🎬 สตูดิโอดิจิทัลมีเดีย</option>
              <option value="conference">🏛️ หอประชุม / สัมมนา</option>
            </select>
          </div>

          {/* Building Filter */}
          <div>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#e7edf6] text-sm text-[#16223f] focus:outline-none focus:ring-2 focus:ring-[#EC4899] bg-white cursor-pointer"
            >
              <option value="all">อาคาร: ทั้งหมด</option>
              <option value="อาคาร 3">อาคาร 3 (ศูนย์ IT & Tech)</option>
              <option value="อาคาร 2">อาคาร 2 (เฉลิมพระเกียรติ)</option>
              <option value="อาคาร 4">อาคาร 4 (ศูนย์นวัตกรรม 21st)</option>
              <option value="อาคาร 1">อาคาร 1 (อำนวยการ)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#e7edf6] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#5b6785] flex items-center gap-1 font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5" /> ตัวกรองด่วน:
            </span>
            <button
              onClick={() => setSelectedType(selectedType === 'computer_lab' ? 'all' : 'computer_lab')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                selectedType === 'computer_lab'
                  ? 'bg-[#1877C9] text-white shadow-xs'
                  : 'bg-[#f5f8fd] text-[#5b6785] hover:bg-slate-200/60'
              }`}
            >
              ห้องคอมฯ High-Spec
            </button>
            <button
              onClick={() => setSelectedType(selectedType === 'lecture' ? 'all' : 'lecture')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                selectedType === 'lecture'
                  ? 'bg-[#D6297E] text-white shadow-xs'
                  : 'bg-[#f5f8fd] text-[#5b6785] hover:bg-slate-200/60'
              }`}
            >
              Active Learning
            </button>
            <button
              onClick={() => setMinCapacity(minCapacity === 40 ? 0 : 40)}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                minCapacity === 40
                  ? 'bg-[#EC4899] text-white shadow-xs'
                  : 'bg-[#f5f8fd] text-[#5b6785] hover:bg-slate-200/60'
              }`}
            >
              ความจุ 40+ ที่นั่ง
            </button>

            {(selectedType !== 'all' || selectedBuilding !== 'all' || minCapacity > 0 || searchQuery !== '') && (
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedBuilding('all');
                  setMinCapacity(0);
                  setSearchQuery('');
                }}
                className="text-[#D6297E] hover:underline font-bold ml-1"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[#5b6785] font-medium">
              พบ <span className="text-[#D6297E] font-bold">{filteredRooms.length}</span> ห้องเรียน
            </div>

            {onOpenResetModal && (currentUser.role === 'teacher' || currentUser.role === 'admin') && (
              <button
                onClick={() => onOpenResetModal()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs shadow-2xs group cursor-pointer"
                title="รีเซ็ตสถานะและตารางการจองห้องเรียนทั้งหมด (เฉพาะอาจารย์/แอดมิน)"
              >
                <RotateCcw className="w-3 h-3 text-rose-600 group-hover:-rotate-90 transition-transform duration-300" />
                <span>รีเซ็ตห้องเรียน</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Room Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const todayStatus = getRoomTodayStatus(room.id);

          return (
            <div
              key={room.id}
              className="group bg-white rounded-2xl overflow-hidden border border-[#e7edf6] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-1"
            >
              {/* Card Image Header */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C1A4B]/80 via-black/20 to-transparent"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="bg-[#0C1A4B]/90 backdrop-blur-md text-white font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-white/20 shadow">
                    {room.code}
                  </span>
                  {getRoomTypeBadge(room.roomType)}
                </div>

                {/* Bottom Specs on Image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-1.5 font-medium drop-shadow-sm">
                    <Users className="w-3.5 h-3.5 text-pink-300" />
                    <span>รองรับ {room.capacity} ที่นั่ง</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0C1A4B]/80 px-2.5 py-0.5 rounded-md backdrop-blur-sm border border-white/10 font-medium">
                    <Clock className="w-3 h-3 text-[#2B9BE0]" />
                    <span>{room.openTime} - {room.closeTime} น.</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-[#0C1A4B] leading-snug group-hover:text-[#D6297E] transition-colors font-kanit">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#5b6785]">
                    <MapPin className="w-3.5 h-3.5 text-[#EC4899] shrink-0" />
                    <span className="truncate">{room.building} (ชั้น {room.floor})</span>
                  </div>
                  <p className="text-xs text-[#5b6785] line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>
                </div>

                {/* Equipments Preview */}
                <div className="pt-2 border-t border-[#e7edf6] space-y-2">
                  <div className="text-[11px] font-bold text-[#0C1A4B] uppercase tracking-wider">
                    อุปกรณ์และเทคโนโลยีประจำห้อง:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {room.equipments.slice(0, 3).map((eq) => (
                      <span
                        key={eq.id}
                        className="inline-flex items-center gap-1 text-[11px] bg-[#f5f8fd] text-[#16223f] px-2.5 py-1 rounded-md font-medium border border-[#e7edf6]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]"></span>
                        {eq.name.split('/')[0]}
                      </span>
                    ))}
                    {room.equipments.length > 3 && (
                      <span className="text-[10px] text-[#5b6785] px-1.5 py-1 font-medium bg-slate-50 rounded-md">
                        +{room.equipments.length - 3} รายการ
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-[#f5f8fd] border border-[#e7edf6]">
                  <span className="text-[#5b6785]">สถานะวันนี้:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold flex items-center gap-1.5 ${
                        todayStatus.todayCount > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          todayStatus.todayCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      ></span>
                      {todayStatus.statusText}
                    </span>

                    {onOpenResetModal && (currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenResetModal(room.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={`รีเซ็ตข้อมูลและคืนค่าห้อง ${room.code} (เฉพาะอาจารย์/แอดมิน)`}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onViewSchedule(room)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#e7edf6] text-[#16223f] hover:bg-[#f5f8fd] text-xs font-semibold transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#2B9BE0]" />
                    ดูผังการใช้ห้อง
                  </button>

                  <button
                    onClick={() => onBookRoom(room)}
                    className="btn-psc-primary flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all"
                  >
                    <span>จองห้องนี้</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
