<?php

namespace App\Http\Controllers\Api\Traits;

use App\Models\User;

trait FormatsUser
{
    /**
     * Format a User model into a consistent API array.
     * Used by Admin, Resident, and Personnel controllers.
     */
    protected function formatUser(User $user): array
    {
        return [
            'id'         => $user->id,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'full_name'  => $user->full_name,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'address'    => $user->address,
            'bio'        => $user->bio,
            'avatar'     => $user->avatar,
            'portal'     => $user->portal,
            'status'     => $user->status,
            'role'       => $user->getRoleNames()->first(),
            'created_at' => $user->created_at,
        ];
    }
}
