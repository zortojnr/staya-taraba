import React from 'react';
import { CheckCircle, Download, Share2, Calendar, MapPin, Users } from 'lucide-react';
import { Booking } from '../types';

interface BookingSuccessProps {
  booking: Booking;
  onNewBooking: () => void;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({ booking, onNewBooking }) => {
  const bookingRef = `STAYA-${booking.id.toUpperCase().slice(0, 8)}`;

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert('Booking confirmation will be downloaded (Demo)');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'STAYA Booking Confirmation',
        text: `My trip from ${booking.bookingData.from?.name} to ${booking.bookingData.to?.name} is confirmed!`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `My trip from ${booking.bookingData.from?.name} to ${booking.bookingData.to?.name} is confirmed! Booking ref: ${bookingRef}`;
      navigator.clipboard.writeText(text);
      alert('Booking details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1DBCBC] via-[#16A5A5] to-[#0E8B8B] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-white/90">Your journey is all set. Get ready for an amazing trip!</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/30 mb-6">
          {/* Booking Reference */}
          <div className="text-center mb-6 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
            <p className="text-2xl font-bold text-[#1DBCBC] tracking-wider">{bookingRef}</p>
          </div>

          {/* Trip Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#1DBCBC]/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#1DBCBC]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Route</p>
                <p className="font-semibold text-gray-800">
                  {booking.bookingData.from?.name} → {booking.bookingData.to?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#1DBCBC]/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#1DBCBC]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Travel Dates</p>
                <p className="font-semibold text-gray-800">
                  {new Date(booking.bookingData.departureDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                  {booking.bookingData.tripType === 'round-trip' && booking.bookingData.returnDate && (
                    <span>
                      {' - '}
                      {new Date(booking.bookingData.returnDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#1DBCBC]/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-[#1DBCBC]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Passengers</p>
                <p className="font-semibold text-gray-800">
                  {booking.bookingData.passengers} {booking.bookingData.passengers === 1 ? 'Passenger' : 'Passengers'}
                </p>
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-[#1DBCBC]/5 rounded-lg p-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount Paid</span>
                <span className="text-2xl font-bold text-[#1DBCBC]">
                  ₦{booking.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Passenger Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{booking.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{booking.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{booking.user.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-white hover:bg-white/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-white hover:bg-white/30 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
          
          <button
            onClick={onNewBooking}
            className="w-full bg-white text-[#1DBCBC] py-3 rounded-lg font-semibold hover:bg-white/90 transition-all"
          >
            Book Another Trip
          </button>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-6 text-white/80 text-sm">
          <p>Need help? Contact us at</p>
          <p className="font-semibold">09115915128</p>
        </div>
      </div>
    </div>
  );
};
