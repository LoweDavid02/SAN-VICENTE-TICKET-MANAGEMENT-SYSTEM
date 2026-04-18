<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Authenticate a user and issue a Sanctum token.
     *
     * Validates that the submitted portal matches the user's portal column.
     * This prevents a resident from logging in via the admin portal URL.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials)) {
            return ApiResponse::error('Invalid email or password.', 401);
        }

        /** @var User $user */
        $user = Auth::user();

        // Enforce portal matching
        if ($user->portal !== $request->portal) {
            Auth::logout();
            return ApiResponse::error(
                "This account does not belong to the {$request->portal} portal.",
                403
            );
        }

        // Check account status
        if ($user->status !== 'active') {
            Auth::logout();
            return ApiResponse::error('Your account has been suspended or deactivated.', 403);
        }

        // Revoke old tokens to enforce single-session (optional — remove if multi-device needed)
        $user->tokens()->delete();

        $token = $user->createToken("{$user->portal}-token")->plainTextToken;

        return ApiResponse::success([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ], 'Login successful.');
    }

    /**
     * Register a new user and issue a token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'portal'     => $request->portal,
            'status'     => 'active',
        ]);

        // Assign the Spatie role matching the portal
        $user->assignRole($request->portal);

        $token = $user->createToken("{$user->portal}-token")->plainTextToken;

        return ApiResponse::success([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ], 'Registration successful.', 201);
    }

    /**
     * Revoke the current access token (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::success(null, 'Logged out successfully.');
    }

    /**
     * Return the authenticated user with their role.
     */
    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(
            $this->formatUser($request->user()),
            'Authenticated user retrieved.'
        );
    }

    /**
     * Format user data for API responses.
     */
    private function formatUser(User $user): array
    {
        return [
            'id'         => $user->id,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'full_name'  => $user->full_name,
            'email'      => $user->email,
            'portal'     => $user->portal,
            'status'     => $user->status,
            'role'       => $user->getRoleNames()->first(),
            'created_at' => $user->created_at,
        ];
    }
}
