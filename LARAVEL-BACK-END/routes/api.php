<?php

use App\Http\Controllers\Api\V1\Admin\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\Guest\GuestController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\Personnel\PersonnelController;
use App\Http\Controllers\HealthCheckController;
use Illuminate\Support\Facades\Route;

// ── Health Check & Keep-Alive (Public, No Rate Limit) ──────────────────────
// Used by external monitoring services to prevent cold starts
Route::get('/health', [HealthCheckController::class, 'index']);
Route::get('/ping', [HealthCheckController::class, 'ping']);

Route::prefix('v1')->group(function () {

    // ── Public — rate-limited to prevent brute force ──────────────────────
    Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
        Route::post('/login',    [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']);
    });

    // ── Guest Ticket Submission (Public, No Authentication) ────────────────
    Route::prefix('guest')->middleware('throttle:15,1')->group(function () {
        Route::post('/tickets',              [GuestController::class, 'submitTicket']);
        Route::get('/tickets/{trackingCode}', [GuestController::class, 'trackTicket']);
    });

    // ── Civic UI Public Routes (Simplified paths) ──────────────────────────
    // Submit ticket with photos - stricter rate limit to prevent storage abuse
    Route::post('/tickets', [GuestController::class, 'submitTicket'])
        ->middleware('throttle:uploads');
    
    // Track and confirm - standard rate limit
    Route::middleware('throttle:15,1')->group(function () {
        Route::post('/tickets/track',          [GuestController::class, 'trackTicketPost']);
        Route::patch('/tickets/{ref}/confirm', [GuestController::class, 'confirmResolution']);
    });

    // ── Protected ─────────────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {

        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me',      [AuthController::class, 'me']);
        });

        // ── Notifications (All Portals) ───────────────────────────────────
        Route::prefix('notifications')->group(function () {
            Route::get('/',                [NotificationController::class, 'index']);
            Route::patch('/{id}/read',     [NotificationController::class, 'markAsRead']);
            Route::post('/mark-all-read',  [NotificationController::class, 'markAllAsRead']);
            Route::delete('/{id}',         [NotificationController::class, 'destroy']);
        });

        // ── Admin ──────────────────────────────────────────────────────────
        Route::middleware(['role:admin', 'portal:admin'])->prefix('admin')->group(function () {
            Route::get('/dashboard',                    [AdminController::class, 'dashboard']);
            Route::get('/tickets',                      [AdminController::class, 'tickets']);
            Route::patch('/tickets/{id}/status',        [AdminController::class, 'updateTicketStatus']);
            Route::post('/tickets/{id}/assign',         [AdminController::class, 'assignTicket']);
            Route::get('/users',                        [AdminController::class, 'users']);
            Route::post('/users',                       [AdminController::class, 'createUser']);
            Route::delete('/users/{id}',                [AdminController::class, 'deleteUser']);
            Route::patch('/users/{id}/status',          [AdminController::class, 'updateUserStatus']);
            Route::get('/personnel',                    [AdminController::class, 'personnel']);
            Route::get('/profile',                      [AdminController::class, 'profile']);
            Route::patch('/profile',                    [AdminController::class, 'updateProfile']);
            Route::get('/map',                          [AdminController::class, 'mapTickets']);
        });

        // ── Personnel ──────────────────────────────────────────────────────
        Route::middleware(['role:personnel', 'portal:personnel'])->prefix('personnel')->group(function () {
            Route::get('/dashboard',                    [PersonnelController::class, 'dashboard']);
            Route::get('/tasks',                        [PersonnelController::class, 'tasks']);
            Route::patch('/tasks/{id}/status',          [PersonnelController::class, 'updateTaskStatus']);
            Route::get('/profile',                      [PersonnelController::class, 'profile']);
            Route::patch('/profile',                    [PersonnelController::class, 'updateProfile']);
        });
    });
});
