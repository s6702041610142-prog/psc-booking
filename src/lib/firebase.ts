import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PSC_ROOMS, INITIAL_BOOKINGS } from '../data/mockData';
import { Room, Booking } from '../types';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Connect to the specific Firestore database ID provided in config
const firestoreDbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = firestoreDbId ? getFirestore(app, firestoreDbId) : getFirestore(app);

const ROOMS_COLLECTION = 'rooms';
const BOOKINGS_COLLECTION = 'bookings';

/**
 * Seed initial rooms and bookings into Firestore if collection is empty
 */
export async function seedInitialDataIfEmpty() {
  try {
    const roomsSnap = await getDocs(collection(db, ROOMS_COLLECTION));
    if (roomsSnap.empty) {
      console.log('Seeding initial rooms to Firestore...');
      const batch = writeBatch(db);
      PSC_ROOMS.forEach((room) => {
        const roomRef = doc(db, ROOMS_COLLECTION, room.id);
        batch.set(roomRef, room);
      });
      await batch.commit();
    }

    const bookingsSnap = await getDocs(collection(db, BOOKINGS_COLLECTION));
    if (bookingsSnap.empty) {
      console.log('Seeding initial bookings to Firestore...');
      const batch = writeBatch(db);
      INITIAL_BOOKINGS.forEach((booking) => {
        const bookingRef = doc(db, BOOKINGS_COLLECTION, booking.id);
        batch.set(bookingRef, booking);
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error seeding initial Firestore data:', error);
  }
}

/**
 * Subscribe to real-time updates for Rooms
 */
export function subscribeRooms(callback: (rooms: Room[]) => void) {
  const roomsRef = collection(db, ROOMS_COLLECTION);
  return onSnapshot(roomsRef, (snapshot) => {
    if (snapshot.empty) {
      // If empty, return initial and trigger seed
      callback(PSC_ROOMS);
      seedInitialDataIfEmpty();
    } else {
      const loadedRooms: Room[] = [];
      snapshot.forEach((docSnap) => {
        loadedRooms.push({ ...(docSnap.data() as Room), id: docSnap.id });
      });
      // Sort by code for consistent display
      loadedRooms.sort((a, b) => a.code.localeCompare(b.code));
      callback(loadedRooms);
    }
  }, (error) => {
    console.error('Error in rooms subscription:', error);
    callback(PSC_ROOMS);
  });
}

/**
 * Subscribe to real-time updates for Bookings
 */
export function subscribeBookings(callback: (bookings: Booking[]) => void) {
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  return onSnapshot(bookingsRef, (snapshot) => {
    if (snapshot.empty) {
      callback(INITIAL_BOOKINGS);
      seedInitialDataIfEmpty();
    } else {
      const loadedBookings: Booking[] = [];
      snapshot.forEach((docSnap) => {
        loadedBookings.push({ ...(docSnap.data() as Booking), id: docSnap.id });
      });
      // Sort newest first
      loadedBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(loadedBookings);
    }
  }, (error) => {
    console.error('Error in bookings subscription:', error);
    callback(INITIAL_BOOKINGS);
  });
}

/**
 * Add a new booking
 */
export async function addBooking(booking: Booking) {
  const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
  await setDoc(docRef, booking);
}

/**
 * Update booking status (approve, reject, cancel)
 */
export async function updateBookingStatus(
  bookingId: string, 
  status: Booking['status'], 
  additionalData?: Partial<Booking>
) {
  const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(docRef, {
    status,
    ...additionalData
  });
}

/**
 * Delete a booking
 */
export async function deleteBooking(bookingId: string) {
  const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await deleteDoc(docRef);
}

/**
 * Reset all rooms and bookings to default standard
 */
export async function resetAllToDefault() {
  const batch = writeBatch(db);

  // Clear existing bookings
  const bookingsSnap = await getDocs(collection(db, BOOKINGS_COLLECTION));
  bookingsSnap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  // Re-seed default bookings
  INITIAL_BOOKINGS.forEach((b) => {
    batch.set(doc(db, BOOKINGS_COLLECTION, b.id), b);
  });

  // Re-seed default rooms
  PSC_ROOMS.forEach((r) => {
    batch.set(doc(db, ROOMS_COLLECTION, r.id), r);
  });

  await batch.commit();
}

/**
 * Clear all bookings (making all rooms 100% available)
 */
export async function clearAllBookings() {
  const batch = writeBatch(db);
  const bookingsSnap = await getDocs(collection(db, BOOKINGS_COLLECTION));
  bookingsSnap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  // Reset all room statuses to available
  const roomsSnap = await getDocs(collection(db, ROOMS_COLLECTION));
  roomsSnap.forEach((docSnap) => {
    batch.update(docSnap.ref, { status: 'available' });
  });

  await batch.commit();
}

/**
 * Reset single room bookings
 */
export async function resetSingleRoom(roomId: string) {
  const batch = writeBatch(db);
  const bookingsSnap = await getDocs(collection(db, BOOKINGS_COLLECTION));
  bookingsSnap.forEach((docSnap) => {
    const data = docSnap.data() as Booking;
    if (data.roomId === roomId) {
      batch.delete(docSnap.ref);
    }
  });

  // Update target room status
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  batch.update(roomRef, { status: 'available' });

  await batch.commit();
}
