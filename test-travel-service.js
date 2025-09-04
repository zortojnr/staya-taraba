// Simple test for the travel service
import { travelService } from './src/services/travelService.js';

console.log('Testing STAYA Travel Service...');

// Test route from Jalingo to Abuja
const fromId = 'tar-1'; // Jalingo
const toId = 'ng-1';   // Abuja
const passengers = 2;

console.log(`\nTesting route: ${fromId} -> ${toId} for ${passengers} passengers`);

// Test route availability
const isAvailable = travelService.isRouteAvailable(fromId, toId);
console.log(`Route available: ${isAvailable}`);

// Test pricing calculation
const price = travelService.calculatePrice(fromId, toId, passengers);
console.log(`Total price: ₦${price.toLocaleString()}`);

// Test duration
const duration = travelService.getEstimatedDuration(fromId, toId);
console.log(`Estimated duration: ${duration}`);

// Test available transport modes
const transports = travelService.getAvailableTransportModes(fromId, toId);
console.log(`Available transport modes: ${transports.length}`);
transports.forEach(transport => {
  console.log(`- ${transport.type}: ${transport.operator} - ₦${transport.price.toLocaleString()} (${transport.duration})`);
});

console.log('\nTesting complete!');
