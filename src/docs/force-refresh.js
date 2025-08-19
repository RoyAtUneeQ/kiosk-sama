/**
 * Force refresh script for Docsify documentation
 * Use this in browser console when testing documentation updates
 */

(function() {
    console.log('🔄 Force refreshing Docsify documentation...');
    
    // Clear all caches
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Remove service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => registration.unregister());
        });
    }
    
    // Add cache-busting parameter to current URL
    const url = new URL(window.location);
    url.searchParams.set('_refresh', Date.now());
    
    console.log('✅ Caches cleared. Reloading with cache-busting parameter...');
    
    // Force reload with cache-busting
    window.location.href = url.toString();
})();
