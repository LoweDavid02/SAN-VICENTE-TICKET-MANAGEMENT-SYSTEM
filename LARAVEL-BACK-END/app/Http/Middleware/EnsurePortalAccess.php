<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePortalAccess
{
    /**
     * Enforce that the authenticated user's portal matches the route portal.
     *
     * Usage in routes: ->middleware('portal:admin')
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string $portal): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Unauthenticated.', 401);
        }

        if ($user->portal !== $portal) {
            return ApiResponse::error(
                "Access denied. This endpoint requires the [{$portal}] portal.",
                403
            );
        }

        return $next($request);
    }
}
