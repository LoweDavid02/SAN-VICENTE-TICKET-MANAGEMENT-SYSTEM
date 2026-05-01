# Mapbox Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Get Your Mapbox Token (2 minutes)

1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up (free, no credit card required)
3. Click **Create a token**
4. Copy the token (starts with `pk.`)

### Step 2: Add Token to .env File

Open `REACT-FRONT-END/.env` and add your token:

```bash
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxxxxxxxxxxxxxxxx
```

**Important:** Replace the entire line with your actual token!

### Step 3: Start the Dev Server

```bash
cd REACT-FRONT-END
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) and navigate to the Dashboard.

## ✅ Verification Checklist

- [ ] Map loads and shows Barangay San Vicente
- [ ] Markers appear on the map (colored dots)
- [ ] Clicking a marker shows a popup with ticket details
- [ ] Navigation controls work (zoom in/out)
- [ ] Geolocate button appears (top-right)
- [ ] No errors in browser console (F12)

## 🎯 What You Get

### Interactive Map Features
- **Custom Markers** - Color-coded by ticket status
- **Popups** - Click markers to see ticket details
- **Geolocation** - Find your current location
- **Geofencing** - Boundary detection for Barangay San Vicente
- **Custom Controls** - Zoom, pan, fit bounds
- **Mobile Responsive** - Works on all devices

### Performance Optimizations
- **Lazy Loading** - Map loads only when needed
- **Code Splitting** - Separate chunks for faster loading
- **Memoization** - Prevents unnecessary re-renders
- **Efficient State** - Minimal updates

## 🔧 Common Issues

### Map Not Showing?

**Check 1: Token is set**
```bash
# In REACT-FRONT-END directory
cat .env | grep MAPBOX
```

Should show:
```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxx
```

**Check 2: Restart dev server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

**Check 3: Browser console**
- Press F12
- Look for errors
- Common error: "Invalid token" means token is wrong

### Markers Not Showing?

**Check ticket data has coordinates:**
```javascript
// Tickets must have latitude and longitude
{
  latitude: 14.9467,   // Number, not string
  longitude: 120.7548, // Number, not string
}
```

### Geolocation Not Working?

**Requirements:**
- HTTPS (or localhost)
- Browser permission granted
- Location services enabled on device

## 📱 Test on Mobile

1. Get your local IP:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. Update Vite config to allow network access:
   ```javascript
   // vite.config.js
   server: {
     host: '0.0.0.0',
     port: 5174,
   }
   ```

3. Access from phone:
   ```
   http://YOUR_IP:5174
   ```

## 🎨 Customization

### Change Map Style

Edit `src/components/Map/MapboxMap.jsx`:

```javascript
// Line 23
const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v11';
```

**Available styles:**
- `streets-v12` - Default street map
- `outdoors-v12` - Topographic map
- `light-v11` - Light theme
- `dark-v11` - Dark theme
- `satellite-v9` - Satellite imagery
- `satellite-streets-v12` - Satellite with labels

### Change Marker Colors

Edit `src/components/Map/MapboxMap.jsx`:

```javascript
// Line 26
const MARKER_COLORS = {
  'Pending': '#EF4444',      // Red
  'In Progress': '#3B82F6',  // Blue
  'Completed': '#10B981',    // Green
};
```

## 🚀 Production Deployment

### 1. Add Token to Render

In Render dashboard:
1. Go to your service
2. Click **Environment**
3. Add variable:
   ```
   VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxx
   ```

### 2. Deploy

```bash
git add .
git commit -m "Add Mapbox integration"
git push origin main
```

Render will automatically rebuild and deploy.

### 3. Verify

1. Open deployed app
2. Navigate to Dashboard
3. Check map loads
4. Test marker clicks
5. Test geolocation

## 📚 Next Steps

- Read [MAPBOX-INTEGRATION-GUIDE.md](./MAPBOX-INTEGRATION-GUIDE.md) for detailed documentation
- Explore [Mapbox Examples](https://docs.mapbox.com/mapbox-gl-js/example/)
- Customize map style in [Mapbox Studio](https://studio.mapbox.com/)
- Add more features (clustering, heatmaps, 3D buildings)

## 💡 Pro Tips

1. **Free Tier Limits:**
   - 50,000 map loads/month
   - Unlimited API requests
   - No credit card required

2. **Token Security:**
   - Restrict token to your domain in Mapbox dashboard
   - Never commit tokens to Git
   - Use environment variables

3. **Performance:**
   - Map is lazy-loaded (only loads when Dashboard is opened)
   - Separate chunk for Mapbox (~600KB)
   - Memoized components prevent re-renders

4. **Accessibility:**
   - Keyboard navigation supported
   - Screen reader friendly
   - ARIA labels on controls

## 🆘 Need Help?

1. **Check browser console** (F12) for errors
2. **Verify token** is correct and active
3. **Test with minimal example** to isolate issue
4. **Check Mapbox status:** [https://status.mapbox.com/](https://status.mapbox.com/)

## 📖 Documentation

- [Full Integration Guide](./MAPBOX-INTEGRATION-GUIDE.md)
- [Mapbox GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/)
- [react-map-gl Docs](https://visgl.github.io/react-map-gl/)
- [Turf.js Docs](https://turfjs.org/)

---

**Ready to go?** Just add your token to `.env` and start the dev server! 🎉
