import React from 'react';
import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react';
import StayaLogo from './StayaLogo';

export const Footer: React.FC = () => {
  const phoneNumber = '09115915128';
  const whatsappNumber = '2349115915128';

  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hello! I would like to inquire about booking a trip with STAYA.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    window.open('mailto:info@staya.com.ng', '_self');
  };

  return (
    <footer className="bg-[#0E8B8B] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <StayaLogo size="sm" variant="compact" className="mr-4" />
              <div>
                <h3 className="text-2xl font-bold tracking-wider">STAYA</h3>
                <div className="h-0.5 w-16 bg-white"></div>
              </div>
            </div>
            <p className="text-white/80 mb-4 max-w-md">
              Your trusted travel companion for exploring Taraba State and Nigeria.
              Connecting communities, creating opportunities, and making travel accessible for everyone.
            </p>
            <p className="text-sm text-white/60">
              Licensed by the Nigerian Civil Aviation Authority (NCAA) and
              registered with the Corporate Affairs Commission (CAC).
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Destinations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Travel Packages</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <button
                onClick={handleCall}
                className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors group"
              >
                <Phone className="w-5 h-5 group-hover:animate-pulse" />
                <span>{phoneNumber}</span>
              </button>
              
              <button
                onClick={handleWhatsApp}
                className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors group"
              >
                <MessageCircle className="w-5 h-5 group-hover:animate-bounce" />
                <span>WhatsApp</span>
              </button>
              
              <button
                onClick={handleEmail}
                className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors group"
              >
                <Mail className="w-5 h-5 group-hover:animate-pulse" />
                <span>info@staya.com.ng</span>
              </button>
              
              <div className="flex items-start space-x-3 text-white/80">
                <MapPin className="w-5 h-5 mt-0.5" />
                <div>
                  <p>123 Travel Street</p>
                  <p>Victoria Island, Lagos</p>
                  <p>Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 text-sm mb-4 md:mb-0">
              © 2024 STAYA. All rights reserved. | Book • Stay • Travel
            </div>
            <div className="flex space-x-6 text-sm text-white/60">
              <span>Powered by Innovation</span>
              <span>•</span>
              <span>Made in Nigeria 🇳🇬</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
