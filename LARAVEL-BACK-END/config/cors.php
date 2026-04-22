<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_filter([
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        env('FRONTEND_URL'),
    ]),

    'allowed_origins_patterns' => [
        // Allow any HTTPS Render subdomain
        '#^https://[a-z0-9\-]+\.onrender\.com$#',
    ],

    // Explicitly list allowed headers
    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 86400,

    // Bearer token auth — no cookies, no CSRF needed
    'supports_credentials' => false,
];
