# Documentation Cache Management

This documentation uses Docsify with aggressive cache-busting to ensure updates are always visible immediately.

## 🔄 Cache-Busting Features

### Automatic Cache Prevention
- HTTP cache headers prevent browser caching
- Dynamic CSS loading with timestamps
- Docsify configured to disable internal caching
- Service worker registration blocked
- GitLab Pages configured with no-cache headers

### For Developers

If you're not seeing your documentation changes:

1. **Hard Refresh**: `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)

2. **Force Refresh Script**: Run in browser console:
   ```javascript
   // Load and execute force refresh script
   fetch('force-refresh.js?' + Date.now())
     .then(r => r.text())
     .then(eval);
   ```

3. **Manual Cache Clear**:
   ```javascript
   // Clear all caches and reload
   localStorage.clear();
   sessionStorage.clear();
   if ('caches' in window) caches.keys().then(n => n.forEach(c => caches.delete(c)));
   location.reload(true);
   ```

## 🚀 GitLab Pages Configuration

The GitLab CI automatically:
- Clears npm cache before building
- Sets aggressive no-cache headers
- Adds build timestamps
- Disables CI artifact caching
- Creates fresh builds every deployment

## 📝 Development Notes

- **Local Testing**: Use `docsify serve` for local development
- **Production**: GitLab Pages automatically applies cache-busting
- **Browser Testing**: Use incognito/private mode for clean testing
- **Mobile Testing**: Clear browser cache and reload

## 🛠️ Technical Implementation

### Cache-Busting Mechanisms:
1. **Meta Tags**: `Cache-Control: no-cache, no-store, must-revalidate`
2. **Dynamic CSS Loading**: Timestamp query parameters
3. **Docsify Config**: `requestHeaders`, `maxAge: 0` for search
4. **GitLab Headers**: `_headers` file with cache directives
5. **Service Worker Blocking**: Prevents offline caching
6. **Page Navigation**: Forces reload on back button

### Files Modified for Cache Control:
- `index.html` - Cache-busting configuration
- `.gitlab-ci.yml` - GitLab Pages headers
- `.nojekyll` - SPA routing support
- `force-refresh.js` - Manual refresh utility

## 📚 Docsify Documentation Structure

```
src/docs/
├── index.html          # Main entry with cache-busting
├── _coverpage.md       # Landing page
├── _sidebar.md         # Navigation menu
├── .nojekyll          # GitLab Pages SPA support
├── force-refresh.js   # Manual refresh utility
├── assets/            # Stylesheets and images
└── pages/            # Documentation content
    ├── main.md
    ├── kiosk/
    ├── remote/
    ├── howto/
    └── performance-monitoring.md
```

## ⚡ Quick Troubleshooting

**Problem**: Documentation not updating after commit
**Solution**: 
1. Check GitLab Pages deployment status
2. Wait 2-3 minutes for propagation  
3. Hard refresh browser (`Ctrl+F5`)
4. Try incognito mode

**Problem**: Styles not updating
**Solution**:
1. CSS files use timestamp query parameters
2. Check browser dev tools for 304 vs 200 responses
3. Disable browser cache in dev tools

**Problem**: Search results outdated
**Solution**:
1. Search cache disabled (`maxAge: 0`)
2. Clear localStorage and refresh
3. Search rebuilds on each page load
