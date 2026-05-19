<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HealthCheckController extends Controller
{
    /**
     * Health check endpoint - keeps service warm and verifies system health
     * 
     * This endpoint is designed to be pinged by external monitoring services
     * (like UptimeRobot) every 5-10 minutes to prevent Render free-tier cold starts.
     * 
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $health = [
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'service' => 'BLINKED API',
            'version' => config('app.version', '4.2.1'),
        ];

        // Check database connection (lightweight query)
        try {
            DB::connection()->getPdo();
            $health['database'] = 'connected';
        } catch (\Exception $e) {
            $health['database'] = 'disconnected';
            $health['status'] = 'degraded';
        }

        // Check cache (if using Redis/Memcached)
        try {
            Cache::put('health_check', true, 10);
            $health['cache'] = Cache::get('health_check') ? 'working' : 'failed';
        } catch (\Exception $e) {
            $health['cache'] = 'unavailable';
        }

        // Return appropriate HTTP status code
        $statusCode = $health['status'] === 'healthy' ? 200 : 503;

        return response()->json($health, $statusCode);
    }

    /**
     * Ping endpoint - minimal response for keep-alive
     * 
     * Ultra-lightweight endpoint that just returns "pong"
     * Use this if you want the absolute minimum overhead
     * 
     * @return JsonResponse
     */
    public function ping(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'timestamp' => time(),
        ]);
    }
}
