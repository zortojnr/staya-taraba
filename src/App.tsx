import React, { useState, useEffect } from 'react';
import { BookingData, User, Booking, AppState } from './types';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BookingModal } from './components/BookingModal';
import { BookingSuccess } from './components/BookingSuccess';
import { Footer } from './components/Footer';
import { travelService } from './services/travelService';

function App() {
  // Set default dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [appState, setAppState] = useState<AppState>({
    isLoading: false,
    showSplash: true,
    user: null,
    currentBooking: {
      from: null,
      to: null,
      departureDate: tomorrow.toISOString().split('T')[0],
      returnDate: nextWeek.toISOString().split('T')[0],
      passengers: 1,
      tripType: 'round-trip'
    }
  });

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  const handleSplashComplete = () => {
    setAppState(prev => ({ ...prev, showSplash: false }));
  };

  const handleBookingChange = (bookingData: BookingData) => {
    setAppState(prev => ({ ...prev, currentBooking: bookingData }));
  };

  const handleBookNow = () => {
    // Basic validation
    if (!appState.currentBooking.from) {
      alert('Please select a departure location');
      return;
    }
    if (!appState.currentBooking.to) {
      alert('Please select a destination');
      return;
    }
    if (appState.currentBooking.from.id === appState.currentBooking.to.id) {
      alert('Departure and destination cannot be the same');
      return;
    }
    if (!appState.currentBooking.departureDate) {
      alert('Please select a departure date');
      return;
    }
    if (appState.currentBooking.tripType === 'round-trip' && !appState.currentBooking.returnDate) {
      alert('Please select a return date for round trip');
      return;
    }
    if (appState.currentBooking.tripType === 'round-trip' &&
        appState.currentBooking.returnDate &&
        appState.currentBooking.returnDate <= appState.currentBooking.departureDate) {
      alert('Return date must be after departure date');
      return;
    }

    // Check route availability
    const fromId = appState.currentBooking.from.id;
    const toId = appState.currentBooking.to.id;

    if (!travelService.isRouteAvailable(fromId, toId)) {
      alert('Sorry, this route is not currently available. Please try a different destination or contact us for assistance.');
      return;
    }

    setShowBookingModal(true);
  };

  const handleBookingComplete = (user: User) => {
    // Calculate real price using travel service
    const fromId = appState.currentBooking.from?.id || '';
    const toId = appState.currentBooking.to?.id || '';
    const passengers = appState.currentBooking.passengers;

    const calculatedPrice = travelService.calculatePrice(fromId, toId, passengers);
    const finalPrice = calculatedPrice > 0 ? calculatedPrice : passengers * 15000; // Fallback price

    const booking: Booking = {
      id: Math.random().toString(36).substring(2),
      user,
      bookingData: appState.currentBooking,
      status: 'confirmed',
      createdAt: new Date(),
      totalPrice: finalPrice
    };

    setCompletedBooking(booking);
    setShowBookingModal(false);
    setAppState(prev => ({ ...prev, user }));
  };

  const handleNewBooking = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    setCompletedBooking(null);
    setAppState(prev => ({
      ...prev,
      currentBooking: {
        from: null,
        to: null,
        departureDate: tomorrow.toISOString().split('T')[0],
        returnDate: nextWeek.toISOString().split('T')[0],
        passengers: 1,
        tripType: 'round-trip'
      }
    }));
  };

  // Show splash screen first
  if (appState.showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show booking success page
  if (completedBooking) {
    return (
      <BookingSuccess
        booking={completedBooking}
        onNewBooking={handleNewBooking}
      />
    );
  }

  // Main application
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection
        bookingData={appState.currentBooking}
        onBookingChange={handleBookingChange}
        onBookNow={handleBookNow}
      />
      <Footer />

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        bookingData={appState.currentBooking}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
}

export default App;