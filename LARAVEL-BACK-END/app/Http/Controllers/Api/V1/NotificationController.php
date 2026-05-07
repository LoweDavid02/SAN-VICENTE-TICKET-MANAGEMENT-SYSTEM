<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get user's notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $notifications = Notification::where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhereNull('user_id'); // Include global notifications
            })
            ->where(function ($query) use ($user) {
                $query->where('portal', $user->portal)
                      ->orWhereNull('portal'); // Include cross-portal notifications
            })
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'title' => $n->title,
                'body' => $n->body,
                'link' => $n->link,
                'portal' => $n->portal,
                'read' => $n->read,
                'time' => $n->time_ago,
                'created_at' => $n->created_at->toIso8601String(),
            ]);

        $unreadCount = Notification::where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhereNull('user_id');
            })
            ->where(function ($query) use ($user) {
                $query->where('portal', $user->portal)
                      ->orWhereNull('portal');
            })
            ->where('read', false)
            ->count();

        return ApiResponse::success([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->markAsRead();

        return ApiResponse::success(null, 'Notification marked as read');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        
        Notification::where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhereNull('user_id');
            })
            ->where(function ($query) use ($user) {
                $query->where('portal', $user->portal)
                      ->orWhereNull('portal');
            })
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return ApiResponse::success(null, 'All notifications marked as read');
    }

    /**
     * Delete notification.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->delete();

        return ApiResponse::success(null, 'Notification deleted');
    }
}
