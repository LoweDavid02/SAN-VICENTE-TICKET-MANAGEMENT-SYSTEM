# Mapbox Deployment Checklist

## Pre-Deployment Checklist

### 1. Setup (Required)

- [ ] **Get Mapbox Token**
  - Visit [https://account.mapbox.com/](https://account.mapbox.com/)
  - Sign up (free, no credit card required)
  - Create a new token with default public scopes
  - Copy the token (starts with `pk.`)

- [ ] **Add Token to Development Environment**
  ```bash
  # Open REACT-FRONT-END/.env
  VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxx
  ```

- [ ] **Verify Token Format**
  - Token starts with `pk.`
  - Token is a long string (100+ characters)
  - No spaces or line breaks
  - No quotes around the token

### 2. Local Testing

- [ ] **Start Development Server**
  ```bash
  cd REACT-FRONT-END
  npm run dev
  ```

- [ ] **Open Application**
  - Navigate to [http://localhost:5174](http://localhost:5174)
  - Log in as admin
  - Navigate to Dashboard

- [ ] **Verify Map Loads**
  - Map appears in the dashboard
  - Barangay San Vicente is centered
  - No errors in browser console (F12)
  - Map tiles load correctly

- [ ] **Test Markers**
  - Markers appear on the map
  - Markers have correct colors (red, orange, green)
  - Hover over marker shows scale effect
  - Click marker shows popup with ticket details
  - Popup shows tracking ID, status, title, location, resident name
  - Close button on popup works

- [ ] **Test Controls**
  - Zoom in/out buttons work
  - Pan (drag) works
  - Double-click zoom works
  - Scroll zoom is disabled (prevents accidental zoom)
  - Navigation controls are visible

- [ ] **Test Geolocation**
  - Geolocate button appears (top-right)
  - Click geolocate button
  - Browser asks for permission (grant it)
  - Map flies to your location
  - Blue dot appears at your location
  - Accuracy circle is visible

- [ ] **Test Geofencing**
  - If you're outside Barangay San Vicente:
    - Red alert appears at top of map
    - Alert says "You are outside Barangay San Vicente"
  - If you're inside:
    - No alert appears

- [ ] **Test Custom Controls**
  - "Go to my location" button works (if location is available)
  - "Show all tickets" button works (fits bounds to show all markers)
  - Buttons have hover effects

- [ ] **Test Boundary Overlay**
  - Barangay boundary is visible (teal dashed line)
  - Boundary has slight fill (transparent teal)
  - Boundary matches the service area

### 3. Mobile Testing

- [ ] **Get Local IP Address**
  ```bash
  # Windows
  ipconfig
  
  # Mac/Linux
  ifconfig
  ```

- [ ] **Update Vite Config (Optional)**
  ```javascript
  // vite.config.js
  server: {
    host: '0.0.0.0',
    port: 5174,
  }
  ```

- [ ] **Access from Mobile**
  - Open `http://YOUR_IP:5174` on mobile device
  - Test all features on mobile
  - Test touch gestures (pinch zoom, pan)
  - Test geolocation on mobile
  - Verify responsive layout

### 4. Performance Testing

- [ ] **Check Bundle Size**
  ```bash
  npm run build
  # Check dist/ folder size
  # Mapbox chunk should be ~600KB
  ```

- [ ] **Check Load Time**
  - Open DevTools (F12)
  - Go to Network tab
  - Reload page
  - Check map loads in <2 seconds

- [ ] **Check Console**
  - No errors in console
  - No warnings (except chunk size, which is expected)
  - No failed network requests

### 5. Browser Compatibility

- [ ] **Test on Chrome**
  - Map loads correctly
  - All features work
  - No console errors

- [ ] **Test on Firefox**
  - Map loads correctly
  - All features work
  - No console errors

- [ ] **Test on Safari** (if available)
  - Map loads correctly
  - All features work
  - No console errors

- [ ] **Test on Edge** (if available)
  - Map loads correctly
  - All features work
  - No console errors

## Production Deployment Checklist

### 1. Environment Configuration

- [ ] **Add Token to Render**
  - Go to Render dashboard
  - Select your service
  - Navigate to **Environment** tab
  - Click **Add Environment Variable**
  - Key: `VITE_MAPBOX_TOKEN`
  - Value: `pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxx`
  - Click **Save**

- [ ] **Update .env.production**
  ```bash
  # REACT-FRONT-END/.env.production
  VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxx
  VITE_API_URL=https://your-backend.onrender.com/api/v1
  ```

- [ ] **Verify Environment Variables**
  - All required variables are set
  - No typos in variable names
  - Values are correct

### 2. Token Security

- [ ] **Restrict Token to Production URL**
  - Go to [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
  - Click on your token
  - Scroll to **URL restrictions**
  - Add: `https://your-app.onrender.com/*`
  - Add: `http://localhost:5174/*` (for development)
  - Click **Update token**

- [ ] **Verify Token Restrictions**
  - Token only works on specified URLs
  - Test on production URL
  - Test on localhost

### 3. Build and Deploy

- [ ] **Build Production Bundle**
  ```bash
  cd REACT-FRONT-END
  npm run build
  ```

- [ ] **Verify Build Success**
  - No build errors
  - dist/ folder created
  - All chunks generated
  - vendor-mapbox.js exists

- [ ] **Test Production Build Locally**
  ```bash
  npm run preview
  # Open http://localhost:4173
  ```

- [ ] **Verify Production Build**
  - Map loads correctly
  - All features work
  - No console errors

- [ ] **Commit Changes**
  ```bash
  git add .
  git commit -m "Add production-ready Mapbox integration"
  git push origin main
  ```

- [ ] **Verify Deployment**
  - Render automatically rebuilds
  - Check build logs for errors
  - Wait for deployment to complete

### 4. Post-Deployment Testing

- [ ] **Open Production App**
  - Navigate to your Render URL
  - Log in as admin
  - Navigate to Dashboard

- [ ] **Verify Map Loads**
  - Map appears correctly
  - Barangay San Vicente is centered
  - No errors in console

- [ ] **Test All Features**
  - Markers appear
  - Click marker shows popup
  - Geolocation works
  - Controls work
  - Boundary overlay visible

- [ ] **Test on Mobile**
  - Open production URL on mobile
  - Test all features
  - Verify responsive layout

- [ ] **Check Performance**
  - Map loads in <2 seconds
  - No lag when panning/zooming
  - Markers render quickly

### 5. Monitoring

- [ ] **Check Mapbox Usage**
  - Go to [https://account.mapbox.com/](https://account.mapbox.com/)
  - Navigate to **Statistics**
  - Monitor map loads
  - Ensure within free tier (50,000/month)

- [ ] **Monitor Errors**
  - Check browser console on production
  - Check Render logs
  - Set up error tracking (optional)

- [ ] **Monitor Performance**
  - Check page load times
  - Check map render times
  - Optimize if needed

## Troubleshooting Checklist

### Map Not Showing

- [ ] **Check Token**
  ```bash
  # In browser console
  console.log(import.meta.env.VITE_MAPBOX_TOKEN);
  ```
  - Should show your token
  - If undefined, token not set correctly

- [ ] **Check Console Errors**
  - Open DevTools (F12)
  - Look for Mapbox errors
  - Common: "Invalid token" or "Unauthorized"

- [ ] **Verify Token is Active**
  - Go to [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
  - Check token status
  - Ensure not expired or deleted

- [ ] **Check URL Restrictions**
  - If token has URL restrictions
  - Ensure current URL is allowed
  - Add URL if missing

### Markers Not Showing

- [ ] **Check Ticket Data**
  ```javascript
  // In browser console
  console.log('Tickets:', tickets);
  ```
  - Verify tickets have latitude and longitude
  - Verify coordinates are numbers, not strings

- [ ] **Check Coordinates**
  - Latitude: 14.938 to 14.956
  - Longitude: 120.747 to 120.763
  - Outside these bounds won't show

- [ ] **Check Console Errors**
  - Look for marker-related errors
  - Check if markers are being filtered out

### Geolocation Not Working

- [ ] **Check HTTPS**
  - Geolocation requires HTTPS (or localhost)
  - Verify production URL uses HTTPS

- [ ] **Check Browser Permission**
  - Browser may have blocked location access
  - Check browser settings
  - Grant permission if blocked

- [ ] **Check Device Settings**
  - Location services enabled on device
  - GPS enabled (for mobile)

- [ ] **Check Console Errors**
  - Look for geolocation errors
  - Common: "User denied permission"

### Performance Issues

- [ ] **Check Bundle Size**
  ```bash
  npm run build
  # Check dist/ folder
  ```
  - Mapbox chunk should be ~600KB
  - If larger, check for duplicate imports

- [ ] **Check Network**
  - Open DevTools Network tab
  - Check map tile requests
  - Slow network may cause delays

- [ ] **Limit Markers**
  - If 200+ markers, consider clustering
  - Or limit visible markers

- [ ] **Disable Animations**
  - If still slow, disable animations
  - Reduce map quality

## Optional Enhancements Checklist

### Marker Clustering

- [ ] **Install supercluster**
  ```bash
  npm install supercluster
  ```

- [ ] **Implement clustering**
  - Create cluster component
  - Add cluster markers
  - Add cluster click handler

### Heatmap Layer

- [ ] **Add heatmap layer**
  - Use Mapbox heatmap layer
  - Configure density
  - Add toggle control

### 3D Buildings

- [ ] **Enable 3D buildings**
  - Add 3D building layer
  - Configure extrusion
  - Add pitch control

### Custom Map Style

- [ ] **Create custom style**
  - Go to [Mapbox Studio](https://studio.mapbox.com/)
  - Create new style
  - Customize colors, fonts, icons
  - Publish style
  - Update MAPBOX_STYLE in code

### Search/Geocoding

- [ ] **Install Mapbox Geocoder**
  ```bash
  npm install @mapbox/mapbox-gl-geocoder
  ```

- [ ] **Add search control**
  - Create geocoder component
  - Add to map
  - Configure options

## Final Verification

- [ ] **All features work on development**
- [ ] **All features work on production**
- [ ] **No console errors**
- [ ] **Performance is acceptable**
- [ ] **Mobile responsive**
- [ ] **Token is secure**
- [ ] **Documentation is complete**
- [ ] **Team is trained on usage**

## Sign-Off

- [ ] **Developer**: Tested and verified
- [ ] **QA**: Tested and approved
- [ ] **Product Owner**: Reviewed and accepted
- [ ] **Deployment**: Completed successfully

---

**Checklist Version**: 1.0.0  
**Last Updated**: May 1, 2026  
**Status**: Ready for Use

**Next Steps:**
1. Complete all items in Pre-Deployment Checklist
2. Complete all items in Production Deployment Checklist
3. Monitor for 24 hours after deployment
4. Address any issues that arise
5. Consider optional enhancements
