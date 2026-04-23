<?php

use Illuminate\Support\Facades\Route;

// Root — API info
Route::get('/', function () {
    return response()->json([
        'name'    => config('app.name'),
        'version' => 'v1',
        'status'  => 'running',
    ]);
});

// Health check — JSON response for Render and monitoring tools
Route::get('/up', function () {
    return response()->json([
        'status'    => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});
