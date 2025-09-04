import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import StayaLogo from './StayaLogo';

export const Header: React.FC = () => {
  const phoneNumber = '09115915128';
  const whatsappNumber = '2349115915128'; // Nigerian format for WhatsApp

  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hello! I would like to inquire about booking a trip with STAYA.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <StayaLogo size="md" variant="compact" />
          </div>

          {/* Contact Buttons */}
          <div className="flex items-center space-x-3">
            {/* Call Button */}
            <button
              onClick={handleCall}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-white hover:bg-white/30 transition-all group"
              title="Call us now"
            >
              <Phone className="w-4 h-4 group-hover:animate-pulse" />
              <span className="hidden sm:inline text-sm font-medium">{phoneNumber}</span>
            </button>

            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsApp}
              className="flex items-center space-x-2 bg-green-500/80 backdrop-blur-sm border border-green-400/50 rounded-full px-4 py-2 text-white hover:bg-green-500 transition-all group"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 group-hover:animate-bounce" />
              <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
