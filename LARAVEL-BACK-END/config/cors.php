<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        // Local development
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        // Production — set FRONTEND_URL in Render environment variables
        env('FRONTEND_URL'),
    ]),

    'allowed_origins_patterns' => [
        // Allow any *.onrender.com subdomain automatically
        '#^https://.*\.onrender\.com$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
