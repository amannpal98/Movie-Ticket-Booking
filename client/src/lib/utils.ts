import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  // Convert from cents to dollars (if amount is in cents)
  const dollars = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function generateBookingReference(): string {
  return `CT${Math.floor(Math.random() * 10000000)}`;
}

export function getRatingColor(rating: number): string {
  if (rating >= 8) return 'text-green-500';
  if (rating >= 7) return 'text-yellow-500';
  if (rating >= 6) return 'text-orange-500';
  return 'text-red-500';
}

export function getGenresString(genres: string[]): string {
  return genres.join(', ');
}

export function extractYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getDatesForNext7Days(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

export function getRowAndSeatFromSeatNumber(seatNumber: string): { row: string; seat: number } {
  const row = seatNumber.charAt(0);
  const seat = parseInt(seatNumber.substring(1));
  return { row, seat };
}

export function generateSeatLabels(rows: number, seatsPerRow: number, rowLabels: string[]): string[] {
  const seats: string[] = [];
  
  for (let i = 0; i < rows; i++) {
    const rowLabel = rowLabels[i];
    for (let j = 1; j <= seatsPerRow; j++) {
      seats.push(`${rowLabel}${j}`);
    }
  }
  
  return seats;
}
