<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_filter([
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        env('FRONTEND_URL'),
    ]),

    'allowed_origins_patterns' => [
        // Only allow HTTPS Render subdomains — not HTTP
        '#^https://[a-z0-9\-]+\.onrender\.com$#',
    ],

    // Explicitly list allowed headers instead of wildcard
    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 86400, // Cache preflight for 24 hours

    // Bearer token auth (Sanctum) does not use cookies, so credentials are not
    // needed. Setting this to false also lifts the browser restriction that
    // prevents wildcard origins when credentials are enabled.
    'supports_credentials' => false,
];
