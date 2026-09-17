export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  code: string; // e.g. 6620901001 for Student, T-104 for Teacher, AD-01 for Admin
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone: string;
  avatar: string;
}

export type RoomType = 'computer_lab' | 'lecture' | 'studio' | 'conference';

export interface RoomEquipment {
  id: string;
  name: string;
  iconName: string;
  count: number;
  condition: 'good' | 'fair' | 'maintenance';
}

export interface Room {
  id: string;
  code: string; // e.g. LAB-301, ROOM-201
  name: string;
  building: string;
  floor: number;
  capacity: number;
  roomType: RoomType;
  description: string;
  equipments: RoomEquipment[];
  openTime: string; // e.g. '08:00'
  closeTime: string; // e.g. '18:00'
  image: string;
  status: 'available' | 'maintenance' | 'closed';
  allowInstantBookingForTeachers: boolean;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. PSC-2026-001
  roomId: string;
  roomCode: string;
  roomName: string;
  userId: string;
  userCode: string;
  userName: string;
  userRole: UserRole;
  userDepartment: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  purpose: string;
  subjectCode?: string;
  subjectName?: string;
  attendeeCount: number;
  advisorTeacherId?: string;
  advisorTeacherName?: string;
  status: BookingStatus;
  createdAt: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
}
