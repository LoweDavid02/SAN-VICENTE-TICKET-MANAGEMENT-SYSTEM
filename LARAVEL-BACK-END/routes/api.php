<?php

use App\Http\Controllers\Api\V1\Admin\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\Personnel\PersonnelController;
use App\Http\Controllers\Api\V1\Resident\ResidentController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ── Public — rate-limited to prevent brute force ──────────────────────
    Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
        Route::post('/login',    [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']);
    });

    // ── Protected ─────────────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {

        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me',      [AuthController::class, 'me']);
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
        });

        // ── Resident ───────────────────────────────────────────────────────
        Route::middleware(['role:resident', 'portal:resident'])->prefix('resident')->group(function () {
            Route::get('/dashboard',                    [ResidentController::class, 'dashboard']);
            Route::get('/tickets',                      [ResidentController::class, 'myTickets']);
            Route::post('/tickets',                     [ResidentController::class, 'submitTicket']);
            Route::get('/tickets/{id}',                 [ResidentController::class, 'showTicket']);
            Route::get('/profile',                      [ResidentController::class, 'profile']);
            Route::patch('/profile',                    [ResidentController::class, 'updateProfile']);
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
