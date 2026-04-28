# PWA Setup Guide — Barangay San Vicente CMS

This guide covers the complete setup and deployment of the Progressive Web Application.

## 📦 Installation

### 1. Install Dependencies

```bash
cd REACT-FRONT-END
npm install
```

New dependencies added:
- `dexie` — IndexedDB wrapper
- `workbox-window` — Service Worker client
- `vite-plugin-pwa` — Vite PWA plugin
- `workbox-*` — Service Worker strategies

### 2. Generate VAPID Keys for Push Notifications

```bash
npx web-push generate-vapid-keys
```

Add the public key to `.env`:
```
VITE_VAPID_PUBLIC_KEY=your-public-key-here
```

Store the private key securely in your Laravel backend `.env`:
```
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_PUBLIC_KEY=your-public-key-here
```

### 3. Generate PWA Icons

You need icons in the following sizes:
- 16x16, 32x32, 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Place them in `public/icons/`:
```
public/icons/
├── icon-16.png
├── icon-32.png
├── icon-72.png
├── icon-96.png
├── icon-128.png
├── icon-144.png
├── icon-152.png
├── icon-192.png
├── icon-192-maskable.png  (with safe zone padding)
├── icon-384.png
├── icon-512.png
├── icon-512-maskable.png  (with safe zone padding)
├── badge-72.png
├── shortcut-dashboard.png
├── shortcut-new.png
└── shortcut-tickets.png
```

**Maskable icons** need 10% padding on all sides for the safe zone.

Use tools like:
- https://maskable.app/ — Test maskable icons
- https://realfavicongenerator.net/ — Generate all sizes

### 4. Generate Screenshots

Take screenshots for the install prompt:
- Desktop: 1920x1080 (wide)
- Mobile: 390x844 (narrow)

Place in `public/screenshots/`:
```
public/screenshots/
├── desktop-dashboard.png
└── mobile-tickets.png
```

## 🚀 Development

```bash
npm run dev
```

The Service Worker is enabled in dev mode for testing. Open DevTools → Application → Service Workers to inspect.

## 🏗️ Build

```bash
npm run build
```

This will:
1. Build the React app
2. Generate the Service Worker with precache manifest
3. Output to `dist/`

## 🧪 Testing PWA Features

### Test Offline Mode

1. Open Chrome DevTools → Network
2. Set throttling to "Offline"
3. Reload the page — should load from cache
4. Create/update a ticket — should queue in IndexedDB
5. Go back online — should auto-sync

### Test Install Prompt

1. Open in Chrome (desktop or Android)
2. Look for install icon in address bar
3. Or use the in-app install button (if implemented)
4. Install and verify standalone mode

### Test Push Notifications

1. Grant notification permission
2. Subscribe to push (calls `/api/push/subscribe`)
3. Send a test notification from backend
4. Verify notification appears even when tab is closed

### Test Background Sync

1. Go offline
2. Submit a form (e.g., create ticket)
3. Check IndexedDB → operations table
4. Go online
5. Verify operation replays automatically

## 📊 Lighthouse Audit

Run Lighthouse in Chrome DevTools:

```bash
# Or use CLI
npm install -g lighthouse
lighthouse https://your-domain.com --view
```

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
- PWA: 90+

## 🔧 Backend Requirements

### WebSocket Endpoint

Create a WebSocket endpoint at `/ws`:

```php
// routes/channels.php or dedicated WebSocket server
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
```

**Message Format:**

Client → Server:
```json
{ "type": "ping" }
```

Server → Client:
```json
{
  "type": "pong"
}

{
  "type": "bulk_sync",
  "data": [
    {
      "entityType": "ticket",
      "id": "123",
      "data": { ... },
      "version": 5
    }
  ]
}

{
  "type": "entity_updated",
  "data": {
    "entityType": "ticket",
    "entityId": "123",
    "data": { ... },
    "version": 6
  }
}
```

### Cache-Control Headers

Add to Laravel responses:

```php
// app/Http/Middleware/CacheControl.php
public function handle($request, Closure $next)
{
    $response = $next($request);

    if ($request->method() === 'GET' && $request->is('api/*')) {
        $response->header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    }

    if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
        $response->header('Cache-Control', 'no-store');
    }

    return $response;
}
```

Static assets (in `.htaccess` or nginx):
```
Cache-Control: public, max-age=31536000, immutable
```

### Push Notification Endpoint

```php
// app/Http/Controllers/Api/PushController.php
public function subscribe(Request $request)
{
    $user = $request->user();
    
    $user->pushSubscriptions()->updateOrCreate(
        ['endpoint' => $request->endpoint],
        [
            'public_key' => $request->keys['p256dh'],
            'auth_token' => $request->keys['auth'],
        ]
    );

    return response()->json(['success' => true]);
}

public function send(User $user, $title, $body, $url = '/')
{
    $subscriptions = $user->pushSubscriptions;

    foreach ($subscriptions as $subscription) {
        WebPush::sendNotification(
            $subscription->endpoint,
            json_encode([
                'title' => $title,
                'body' => $body,
                'url' => $url,
                'icon' => '/icons/icon-192.png',
                'badge' => '/icons/badge-72.png',
            ]),
            $subscription->public_key,
            $subscription->auth_token,
            env('VAPID_PUBLIC_KEY'),
            env('VAPID_PRIVATE_KEY')
        );
    }
}
```

## 🔐 Security Considerations

1. **Encrypted Cache** — Sensitive entities are AES-GCM encrypted in IndexedDB
2. **Auth Routes** — Never cached by Service Worker
3. **HTTPS Required** — Service Workers only work on HTTPS (or localhost)
4. **VAPID Keys** — Keep private key secret, never commit to repo

## 📱 Platform-Specific Notes

### Android

- Install via Chrome: "Add to Home Screen"
- Standalone mode works perfectly
- Push notifications work when app is closed

### iOS

- Install via Safari: Share → "Add to Home Screen"
- Limited Service Worker support (no background sync)
- Push notifications require iOS 16.4+

### Desktop

- Install via Chrome/Edge: Install icon in address bar
- Window Controls Overlay for native-like title bar
- Keyboard shortcuts work

## 🐛 Troubleshooting

### Service Worker Not Updating

```javascript
// Force update
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
location.reload();
```

### IndexedDB Quota Exceeded

```javascript
// Check quota
navigator.storage.estimate().then(estimate => {
  console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
});
```

### WebSocket Not Connecting

- Check CORS settings
- Verify auth token is valid
- Check firewall/proxy settings

## 📚 Resources

- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [IndexedDB Best Practices](https://web.dev/indexeddb-best-practices/)

## ✅ Acceptance Criteria Checklist

- [ ] App opens offline with zero network requests
- [ ] Offline mutations queue in IndexedDB
- [ ] Queued operations survive browser restart
- [ ] Operations replay automatically on reconnect
- [ ] SyncStatusBar shows all 4 states correctly
- [ ] Changes sync across tabs within 500ms
- [ ] WebSocket reconnects with exponential backoff
- [ ] App installs on Android/iOS/Desktop
- [ ] Push notifications work when tab is closed
- [ ] Sensitive data encrypted in IndexedDB
- [ ] Lighthouse PWA score 90+

---

**Need help?** Check the inline JSDoc comments in each file for detailed API documentation.
