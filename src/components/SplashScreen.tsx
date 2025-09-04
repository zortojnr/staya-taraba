import React, { useEffect, useState } from 'react';
import StayaLogo from './StayaLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase(1), 500);
    const timer2 = setTimeout(() => setAnimationPhase(2), 1500);
    const timer3 = setTimeout(() => setAnimationPhase(3), 2500);
    const timer4 = setTimeout(() => onComplete(), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1DBCBC] to-[#16A5A5] flex items-center justify-center z-50">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full animate-ping" style={{ animationDelay: '500ms' }}></div>
      </div>

      {/* Logo Container */}
      <div className="relative z-10 text-center">
        {/* STAYA Logo Animation */}
        <div className={`mb-8 transition-all duration-1000 ${
          animationPhase >= 1 ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-180'
        }`}>
          <StayaLogo size="xl" className="mx-auto" />
        </div>

        {/* Additional Text */}
        <div className={`transition-all duration-1000 delay-500 ${
          animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-wider">
            Your Journey Starts Here
          </h2>
          <div className="h-1 w-32 bg-white mx-auto mb-4"></div>
        </div>

        {/* Tagline */}
        <div className={`transition-all duration-1000 delay-1000 ${
          animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <p className="text-xl text-white/90 tracking-[0.3em] font-light">
            BOOK • STAY • TRAVEL
          </p>
        </div>

        {/* Loading Dots */}
        <div className={`mt-8 flex justify-center space-x-2 transition-opacity duration-500 ${
          animationPhase >= 2 ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
        </div>
      </div>
    </div>
  );
};
