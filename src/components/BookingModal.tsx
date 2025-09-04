import React, { useState, useEffect } from 'react';
import { X, Mail, User, Phone, CreditCard, Bus, Plane, Car, Train } from 'lucide-react';
import { BookingData, User as UserType } from '../types';
import { travelService, TransportMode } from '../services/travelService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: BookingData;
  onBookingComplete: (user: UserType) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onBookingComplete
}) => {
  const [step, setStep] = useState(1);
  const [selectedTransport, setSelectedTransport] = useState<TransportMode | null>(null);
  const [availableTransports, setAvailableTransports] = useState<TransportMode[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Load available transport modes when modal opens
  useEffect(() => {
    if (isOpen && bookingData.from && bookingData.to) {
      const transports = travelService.getAvailableTransportModes(
        bookingData.from.id,
        bookingData.to.id
      );
      setAvailableTransports(transports);
      if (transports.length > 0) {
        setSelectedTransport(transports[0]); // Select first available by default
      }
    }
  }, [isOpen, bookingData.from, bookingData.to]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      value = value.substring(0, 19); // Limit to 16 digits + 3 spaces
    }

    // Format expiry date
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
    }

    // Format CVV (numbers only)
    if (field === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 3);
    }

    // Format phone number
    if (field === 'phone') {
      value = value.replace(/\D/g, '').substring(0, 11);
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Complete booking
      const user: UserType = {
        id: Math.random().toString(36).substring(2),
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };
      onBookingComplete(user);
    }
  };

  const isStep1Valid = formData.name && formData.email && formData.phone;
  const isStep2Valid = formData.cardNumber && formData.expiryDate && formData.cvv;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1DBCBC] to-[#16A5A5] text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Complete Your Booking</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-4 space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-white' : 'text-white/50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'bg-white text-[#1DBCBC] border-white' : 'border-white/50'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm">Personal Info</span>
            </div>
            <div className="flex-1 h-0.5 bg-white/30"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-white' : 'text-white/50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? 'bg-white text-[#1DBCBC] border-white' : 'border-white/50'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm">Payment</span>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="p-6 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-800 mb-3">Trip Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">From:</span>
              <span className="font-medium">{bookingData.from?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span className="font-medium">{bookingData.to?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Departure:</span>
              <span className="font-medium">{bookingData.departureDate}</span>
            </div>
            {bookingData.tripType === 'round-trip' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Return:</span>
                <span className="font-medium">{bookingData.returnDate}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Passengers:</span>
              <span className="font-medium">{bookingData.passengers}</span>
            </div>
            {selectedTransport && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport:</span>
                  <span className="font-medium capitalize">{selectedTransport.type} - {selectedTransport.operator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{selectedTransport.duration}</span>
                </div>
              </>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-[#1DBCBC]">
                ₦{selectedTransport ? (selectedTransport.price * bookingData.passengers).toLocaleString() : (bookingData.passengers * 15000).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Transport Mode Selection */}
              {availableTransports.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Transport Mode</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {availableTransports.map((transport) => (
                      <button
                        key={`${transport.type}-${transport.operator}`}
                        type="button"
                        onClick={() => setSelectedTransport(transport)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedTransport === transport
                            ? 'border-[#1DBCBC] bg-[#1DBCBC]/5'
                            : 'border-gray-200 hover:border-[#1DBCBC]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {transport.type === 'bus' && <Bus className="w-5 h-5 text-[#1DBCBC]" />}
                            {transport.type === 'flight' && <Plane className="w-5 h-5 text-[#1DBCBC]" />}
                            {transport.type === 'car' && <Car className="w-5 h-5 text-[#1DBCBC]" />}
                            {transport.type === 'train' && <Train className="w-5 h-5 text-[#1DBCBC]" />}
                            <div className="text-left">
                              <div className="font-medium text-gray-800 capitalize">{transport.type}</div>
                              <div className="text-sm text-gray-600">{transport.operator}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#1DBCBC]">₦{transport.price.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">{transport.duration}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DBCBC] focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DBCBC] focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DBCBC] focus:border-transparent"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DBCBC] focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DBCBC] focus:border-transparent"
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DBCBC] focus:border-transparent"
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is a demo. No actual payment will be processed.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              className="flex-1 px-6 py-3 bg-[#1DBCBC] text-white rounded-lg hover:bg-[#16A5A5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {step === 1 ? 'Continue to Payment' : 'Complete Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
