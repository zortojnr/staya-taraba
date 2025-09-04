import { Location } from '../types';

// Nigerian travel route pricing and data service
export interface RouteInfo {
  id: string;
  from: string;
  to: string;
  distance: number; // in kilometers
  estimatedDuration: string;
  basePrice: number; // in Naira
  transportModes: TransportMode[];
  isActive: boolean;
}

export interface TransportMode {
  type: 'bus' | 'flight' | 'train' | 'car';
  operator: string;
  price: number;
  duration: string;
  availability: 'available' | 'limited' | 'unavailable';
  departureTime?: string;
  arrivalTime?: string;
}

// Taraba State focused routes with real Nigerian travel data
const tarabaRoutes: RouteInfo[] = [
  // Intra-Taraba routes
  {
    id: 'tar-jalingo-wukari',
    from: 'tar-1', // Jalingo
    to: 'tar-2', // Wukari
    distance: 195,
    estimatedDuration: '3h 30m',
    basePrice: 3500,
    transportModes: [
      { type: 'bus', operator: 'ABC Transport', price: 3500, duration: '3h 30m', availability: 'available' },
      { type: 'car', operator: 'Private Hire', price: 15000, duration: '2h 45m', availability: 'available' }
    ],
    isActive: true
  },
  {
    id: 'tar-jalingo-gembu',
    from: 'tar-1', // Jalingo
    to: 'tar-4', // Gembu
    distance: 180,
    estimatedDuration: '4h 15m',
    basePrice: 4000,
    transportModes: [
      { type: 'bus', operator: 'Peace Mass Transit', price: 4000, duration: '4h 15m', availability: 'available' },
      { type: 'car', operator: 'Private Hire', price: 18000, duration: '3h 30m', availability: 'limited' }
    ],
    isActive: true
  },
  {
    id: 'tar-jalingo-bali',
    from: 'tar-1', // Jalingo
    to: 'tar-3', // Bali
    distance: 85,
    estimatedDuration: '1h 45m',
    basePrice: 2000,
    transportModes: [
      { type: 'bus', operator: 'Taraba Line Transport', price: 2000, duration: '1h 45m', availability: 'available' },
      { type: 'car', operator: 'Private Hire', price: 8000, duration: '1h 20m', availability: 'available' }
    ],
    isActive: true
  },
  
  // Taraba to major Nigerian cities
  {
    id: 'tar-jalingo-abuja',
    from: 'tar-1', // Jalingo
    to: 'ng-1', // Abuja
    distance: 450,
    estimatedDuration: '7h 30m',
    basePrice: 8500,
    transportModes: [
      { type: 'bus', operator: 'ABC Transport', price: 8500, duration: '7h 30m', availability: 'available' },
      { type: 'flight', operator: 'Air Peace', price: 45000, duration: '1h 15m', availability: 'limited' },
      { type: 'car', operator: 'Private Hire', price: 35000, duration: '6h 45m', availability: 'available' }
    ],
    isActive: true
  },
  {
    id: 'tar-jalingo-lagos',
    from: 'tar-1', // Jalingo
    to: 'ng-2', // Lagos
    distance: 850,
    estimatedDuration: '12h 30m',
    basePrice: 15000,
    transportModes: [
      { type: 'bus', operator: 'God is Good Motors', price: 15000, duration: '12h 30m', availability: 'available' },
      { type: 'flight', operator: 'Air Peace', price: 65000, duration: '1h 45m', availability: 'available' },
      { type: 'car', operator: 'Private Hire', price: 60000, duration: '11h 15m', availability: 'limited' }
    ],
    isActive: true
  },
  {
    id: 'tar-jalingo-kano',
    from: 'tar-1', // Jalingo
    to: 'ng-3', // Kano
    distance: 520,
    estimatedDuration: '8h 45m',
    basePrice: 10000,
    transportModes: [
      { type: 'bus', operator: 'Borno Express', price: 10000, duration: '8h 45m', availability: 'available' },
      { type: 'flight', operator: 'Max Air', price: 50000, duration: '1h 30m', availability: 'limited' },
      { type: 'car', operator: 'Private Hire', price: 40000, duration: '7h 30m', availability: 'available' }
    ],
    isActive: true
  },
  {
    id: 'tar-jalingo-jos',
    from: 'tar-1', // Jalingo
    to: 'ng-6', // Jos
    distance: 280,
    estimatedDuration: '5h 15m',
    basePrice: 6000,
    transportModes: [
      { type: 'bus', operator: 'Peace Mass Transit', price: 6000, duration: '5h 15m', availability: 'available' },
      { type: 'car', operator: 'Private Hire', price: 25000, duration: '4h 30m', availability: 'available' }
    ],
    isActive: true
  },
  {
    id: 'tar-jalingo-makurdi',
    from: 'tar-1', // Jalingo
    to: 'ng-7', // Makurdi
    distance: 220,
    estimatedDuration: '4h 30m',
    basePrice: 5000,
    transportModes: [
      { type: 'bus', operator: 'Cross Line Transport', price: 5000, duration: '4h 30m', availability: 'available' },
      { type: 'car', operator: 'Private Hire', price: 20000, duration: '3h 45m', availability: 'available' }
    ],
    isActive: true
  },
  {
    id: 'tar-jalingo-yola',
    from: 'tar-1', // Jalingo
    to: 'ng-8', // Yola
    distance: 160,
    estimatedDuration: '3h 15m',
    basePrice: 4500,
    transportModes: [
      { type: 'bus', operator: 'Adamawa Transport', price: 4500, duration: '3h 15m', availability: 'available' },
      { type: 'car', operator: 'Private Hire', price: 16000, duration: '2h 45m', availability: 'available' }
    ],
    isActive: true
  }
];

// Service class for travel data
export class TravelService {
  private routes: RouteInfo[] = tarabaRoutes;

  // Get route information between two locations
  getRouteInfo(fromId: string, toId: string): RouteInfo | null {
    return this.routes.find(route => 
      (route.from === fromId && route.to === toId) ||
      (route.from === toId && route.to === fromId)
    ) || null;
  }

  // Calculate pricing based on passengers and transport mode
  calculatePrice(fromId: string, toId: string, passengers: number, transportType?: string): number {
    const route = this.getRouteInfo(fromId, toId);
    if (!route) return 0;

    let basePrice = route.basePrice;
    
    // If specific transport type is requested
    if (transportType) {
      const transport = route.transportModes.find(mode => mode.type === transportType);
      if (transport) {
        basePrice = transport.price;
      }
    }

    // Apply passenger multiplier
    let totalPrice = basePrice * passengers;

    // Apply dynamic pricing based on demand (simulated)
    const demandMultiplier = this.getDemandMultiplier(fromId, toId);
    totalPrice *= demandMultiplier;

    // Round to nearest 500 Naira
    return Math.round(totalPrice / 500) * 500;
  }

  // Get available transport modes for a route
  getAvailableTransportModes(fromId: string, toId: string): TransportMode[] {
    const route = this.getRouteInfo(fromId, toId);
    return route ? route.transportModes.filter(mode => mode.availability !== 'unavailable') : [];
  }

  // Simulate demand-based pricing
  private getDemandMultiplier(fromId: string, toId: string): number {
    // Simulate higher demand for popular routes
    const popularRoutes = ['tar-jalingo-abuja', 'tar-jalingo-lagos', 'tar-jalingo-kano'];
    const routeId = `tar-${fromId}-${toId}`;
    
    if (popularRoutes.includes(routeId)) {
      return 1.1 + (Math.random() * 0.2); // 10-30% increase
    }
    
    return 0.9 + (Math.random() * 0.2); // 10% decrease to 10% increase
  }

  // Get estimated travel time
  getEstimatedDuration(fromId: string, toId: string, transportType?: string): string {
    const route = this.getRouteInfo(fromId, toId);
    if (!route) return 'N/A';

    if (transportType) {
      const transport = route.transportModes.find(mode => mode.type === transportType);
      return transport ? transport.duration : route.estimatedDuration;
    }

    return route.estimatedDuration;
  }

  // Check if route is available
  isRouteAvailable(fromId: string, toId: string): boolean {
    const route = this.getRouteInfo(fromId, toId);
    return route ? route.isActive : false;
  }

  // Get all routes from a specific location
  getRoutesFrom(fromId: string): RouteInfo[] {
    return this.routes.filter(route => route.from === fromId || route.to === fromId);
  }

  // Simulate real-time updates (for future API integration)
  async fetchLiveData(fromId: string, toId: string): Promise<RouteInfo | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return route with updated pricing
    const route = this.getRouteInfo(fromId, toId);
    if (route) {
      // Update prices with current demand
      const updatedRoute = { ...route };
      updatedRoute.transportModes = route.transportModes.map(mode => ({
        ...mode,
        price: Math.round(mode.price * this.getDemandMultiplier(fromId, toId))
      }));
      return updatedRoute;
    }
    
    return null;
  }
}

// Export singleton instance
export const travelService = new TravelService();
