import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Users, ArrowRightLeft, Clock, DollarSign } from 'lucide-react';
import { BookingData, Location } from '../types';
import { travelService } from '../services/travelService';
import StayaLogo from './StayaLogo';

interface HeroSectionProps {
  bookingData: BookingData;
  onBookingChange: (data: BookingData) => void;
  onBookNow: () => void;
}

// Taraba State destinations (prioritized)
const tarabaDestinations: Location[] = [
  {
    id: 'tar-1',
    name: 'Jalingo',
    country: 'Taraba State, Nigeria',
    image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Capital city of Taraba State'
  },
  {
    id: 'tar-2',
    name: 'Wukari',
    country: 'Taraba State, Nigeria',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Ancient Jukun kingdom headquarters'
  },
  {
    id: 'tar-3',
    name: 'Bali',
    country: 'Taraba State, Nigeria',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Historic emirate town'
  },
  {
    id: 'tar-4',
    name: 'Gembu',
    country: 'Taraba State, Nigeria',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Mambilla Plateau headquarters'
  },
  {
    id: 'tar-5',
    name: 'Serti',
    country: 'Taraba State, Nigeria',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Agricultural hub of Taraba'
  },
  {
    id: 'tar-6',
    name: 'Takum',
    country: 'Taraba State, Nigeria',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Border town with Cameroon'
  },
  {
    id: 'tar-7',
    name: 'Ibi',
    country: 'Taraba State, Nigeria',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'River port town on River Benue'
  },
  {
    id: 'tar-8',
    name: 'Mutum-Biyu',
    country: 'Taraba State, Nigeria',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Commercial center in Gassol LGA'
  }
];

// Major Nigerian destinations for inter-state travel
const nigerianDestinations: Location[] = [
  {
    id: 'ng-1',
    name: 'Abuja',
    country: 'Federal Capital Territory, Nigeria',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Federal capital territory'
  },
  {
    id: 'ng-2',
    name: 'Lagos',
    country: 'Lagos State, Nigeria',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Commercial capital of Nigeria'
  },
  {
    id: 'ng-3',
    name: 'Kano',
    country: 'Kano State, Nigeria',
    image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Ancient commercial center'
  },
  {
    id: 'ng-4',
    name: 'Port Harcourt',
    country: 'Rivers State, Nigeria',
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Oil city and garden city'
  },
  {
    id: 'ng-5',
    name: 'Kaduna',
    country: 'Kaduna State, Nigeria',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Centre of learning'
  },
  {
    id: 'ng-6',
    name: 'Jos',
    country: 'Plateau State, Nigeria',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Plateau state capital'
  },
  {
    id: 'ng-7',
    name: 'Makurdi',
    country: 'Benue State, Nigeria',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Food basket capital'
  },
  {
    id: 'ng-8',
    name: 'Yola',
    country: 'Adamawa State, Nigeria',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Land of beauty'
  },
  {
    id: 'ng-9',
    name: 'Bauchi',
    country: 'Bauchi State, Nigeria',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Pearl of tourism'
  },
  {
    id: 'ng-10',
    name: 'Gombe',
    country: 'Gombe State, Nigeria',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format&q=80',
    description: 'Jewel in the savannah'
  }
];

// Combined destinations with Taraba prioritized
const popularDestinations: Location[] = [...tarabaDestinations, ...nigerianDestinations];

export const HeroSection: React.FC<HeroSectionProps> = ({
  bookingData,
  onBookingChange,
  onBookNow
}) => {
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{price: number, duration: string} | null>(null);
  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update route info when locations change
  useEffect(() => {
    if (bookingData.from && bookingData.to) {
      const price = travelService.calculatePrice(
        bookingData.from.id,
        bookingData.to.id,
        bookingData.passengers
      );
      const duration = travelService.getEstimatedDuration(
        bookingData.from.id,
        bookingData.to.id
      );

      if (price > 0) {
        setRouteInfo({ price, duration });
      } else {
        setRouteInfo(null);
      }
    } else {
      setRouteInfo(null);
    }
  }, [bookingData.from, bookingData.to, bookingData.passengers]);

  const handleLocationSelect = (location: Location, type: 'from' | 'to') => {
    onBookingChange({
      ...bookingData,
      [type]: location
    });
    if (type === 'from') setShowFromDropdown(false);
    if (type === 'to') setShowToDropdown(false);
  };



  const swapLocations = () => {
    onBookingChange({
      ...bookingData,
      from: bookingData.to,
      to: bookingData.from
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1DBCBC] via-[#16A5A5] to-[#0E8B8B] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-full"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          {/* STAYA Logo */}
          <div className="flex justify-center mb-8">
            <StayaLogo size="lg" className="w-48 h-48 drop-shadow-2xl" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Explore Taraba & Beyond
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Connect Taraba State to Nigeria and the world. From Jalingo to Lagos, Mambilla Plateau to Abuja - your journey starts here with STAYA
          </p>
        </div>

        {/* Booking Form - Glassmorphism */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30 shadow-2xl">
            {/* Trip Type Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/20 rounded-full p-1 backdrop-blur-sm">
                <button
                  onClick={() => onBookingChange({ ...bookingData, tripType: 'round-trip' })}
                  className={`px-6 py-2 rounded-full transition-all ${
                    bookingData.tripType === 'round-trip'
                      ? 'bg-white text-[#1DBCBC] shadow-lg'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Round Trip
                </button>
                <button
                  onClick={() => onBookingChange({ ...bookingData, tripType: 'one-way' })}
                  className={`px-6 py-2 rounded-full transition-all ${
                    bookingData.tripType === 'one-way'
                      ? 'bg-white text-[#1DBCBC] shadow-lg'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  One Way
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* From Location */}
              <div className="relative" ref={fromDropdownRef}>
                <label className="block text-white/80 text-sm font-medium mb-2">From</label>
                <div className="relative">
                  <button
                    onClick={() => setShowFromDropdown(!showFromDropdown)}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-left text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-white/25 transition-all"
                  >
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-white/70" />
                      <span>{bookingData.from?.name || 'Select departure'}</span>
                    </div>
                  </button>
                  
                  {showFromDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white backdrop-blur-lg rounded-lg shadow-2xl border border-gray-200 z-50 max-h-60 overflow-y-auto">
                      {popularDestinations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => handleLocationSelect(location, 'from')}
                          className="w-full px-4 py-3 text-left hover:bg-[#1DBCBC]/15 transition-all duration-200 border-b border-gray-100 last:border-b-0 bg-white hover:shadow-md"
                        >
                          <div className="flex items-center">
                            <img
                              src={location.image}
                              alt={location.name}
                              className="w-12 h-12 rounded-lg object-cover mr-3 shadow-md border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format&q=80';
                              }}
                            />
                            <div>
                              <div className="font-semibold text-gray-900">{location.name}</div>
                              <div className="text-sm text-gray-700 font-medium">{location.country}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex items-end justify-center pb-3">
                <button
                  onClick={swapLocations}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-3 text-white hover:bg-white/30 transition-all hover:scale-110"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </button>
              </div>

              {/* To Location */}
              <div className="relative" ref={toDropdownRef}>
                <label className="block text-white/80 text-sm font-medium mb-2">To</label>
                <div className="relative">
                  <button
                    onClick={() => setShowToDropdown(!showToDropdown)}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-left text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-white/25 transition-all"
                  >
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-white/70" />
                      <span>{bookingData.to?.name || 'Select destination'}</span>
                    </div>
                  </button>
                  
                  {showToDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white backdrop-blur-lg rounded-lg shadow-2xl border border-gray-200 z-50 max-h-60 overflow-y-auto">
                      {popularDestinations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => handleLocationSelect(location, 'to')}
                          className="w-full px-4 py-3 text-left hover:bg-[#1DBCBC]/15 transition-all duration-200 border-b border-gray-100 last:border-b-0 bg-white hover:shadow-md"
                        >
                          <div className="flex items-center">
                            <img
                              src={location.image}
                              alt={location.name}
                              className="w-12 h-12 rounded-lg object-cover mr-3 shadow-md border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format&q=80';
                              }}
                            />
                            <div>
                              <div className="font-semibold text-gray-900">{location.name}</div>
                              <div className="text-sm text-gray-700 font-medium">{location.country}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Passengers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                  <select
                    value={bookingData.passengers}
                    onChange={(e) => onBookingChange({ ...bookingData, passengers: parseInt(e.target.value) })}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num} className="text-gray-800">{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Departure Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                  <input
                    type="date"
                    value={bookingData.departureDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => onBookingChange({ ...bookingData, departureDate: e.target.value })}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </div>

              {bookingData.tripType === 'round-trip' && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Return Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                    <input
                      type="date"
                      value={bookingData.returnDate}
                      min={bookingData.departureDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => onBookingChange({ ...bookingData, returnDate: e.target.value })}
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Route Information */}
            {bookingData.from && bookingData.to && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30 mb-4">
                {routeInfo ? (
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{routeInfo.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-semibold">₦{routeInfo.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-xs text-white/80">
                      {bookingData.passengers} passenger{bookingData.passengers > 1 ? 's' : ''}
                    </div>
                  </div>
                ) : (
                  <div className="text-white/80 text-sm text-center">
                    <p>Route not available directly. Please contact us for alternative options.</p>
                    <p className="text-xs mt-1">Call: 09115915128 or WhatsApp for assistance</p>
                  </div>
                )}
              </div>
            )}

            {/* Search Button */}
            <div className="text-center">
              <button
                onClick={onBookNow}
                className="bg-white text-[#1DBCBC] px-12 py-4 rounded-full font-semibold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"
              >
                {routeInfo ? `Book Now - ₦${routeInfo.price.toLocaleString()}` : 'Book Your Journey'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
