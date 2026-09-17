import { Booking } from '../types';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictReason?: string;
  conflictingBooking?: Booking;
}

/**
 * Converts "HH:mm" time string into total minutes from midnight for easy comparison
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Checks whether two time ranges overlap:
 * Range A: [startA, endA)
 * Range B: [startB, endB)
 * Overlap condition: startA < endB && endA > startB
 */
export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return aStart < bEnd && aEnd > bStart;
}

/**
 * Validates whether a new booking request conflicts with any existing bookings in the system
 * Evaluates both 'approved' and 'pending' bookings on the same room & date.
 * Excludes the current booking if updating (by ignoreBookingId).
 */
export function checkBookingConflict(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  existingBookings: Booking[],
  ignoreBookingId?: string
): ConflictCheckResult {
  // Validate time order
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    return {
      hasConflict: true,
      conflictReason: 'เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด',
    };
  }

  // Filter bookings on the same room and same date that are active (approved or pending)
  const candidateBookings = existingBookings.filter((b) => {
    if (b.id === ignoreBookingId) return false;
    if (b.roomId !== roomId) return false;
    if (b.date !== date) return false;
    // Cancelled or rejected bookings do not block slots
    return b.status === 'approved' || b.status === 'pending';
  });

  for (const existing of candidateBookings) {
    if (isTimeOverlapping(startTime, endTime, existing.startTime, existing.endTime)) {
      const statusLabel = existing.status === 'approved' ? 'อนุมัติแล้ว' : 'รอการอนุมัติ';
      return {
        hasConflict: true,
        conflictingBooking: existing,
        conflictReason: `เกิดการจองซ้อนทับกับรายการ [${existing.bookingNumber}] เวลา ${existing.startTime} - ${existing.endTime} น. (${statusLabel}) โดย ${existing.userName}`,
      };
    }
  }

  return {
    hasConflict: false,
  };
}
