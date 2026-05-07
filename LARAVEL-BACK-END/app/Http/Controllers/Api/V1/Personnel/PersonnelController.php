<?php

namespace App\Http\Controllers\Api\V1\Personnel;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\FormatsUser;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Http\Requests\Api\UpdateTicketStatusRequest;
use App\Models\Ticket;
use App\Models\TicketTimeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    use FormatsUser;
    /** Personnel dashboard */
    public function dashboard(Request $request): JsonResponse
    {
        $user    = $request->user();
        $tickets = Ticket::where('assigned_to', $user->id)
            ->with(['resident', 'timeline.updatedBy'])
            ->orderByDesc('updated_at')
            ->get();

        return ApiResponse::success([
            'user'    => $this->formatUser($user),
            'summary' => [
                'tasks_assigned'    => $tickets->whereNotIn('status', ['Completed', 'Rejected'])->count(),
                'tasks_completed'   => $tickets->where('status', 'Completed')->count(),
                'tasks_in_progress' => $tickets->where('status', 'In Progress')->count(),
                'tasks_urgent'      => $tickets->where('severity', 'High')
                    ->whereNotIn('status', ['Completed', 'Rejected'])->count(),
            ],
            'tasks' => $tickets->map(fn($t) => $t->toApiArray())->values(),
        ], 'Personnel dashboard data retrieved.');
    }

    /** List assigned tasks */
    public function tasks(Request $request): JsonResponse
    {
        $query = Ticket::where('assigned_to', $request->user()->id)
            ->with(['resident', 'timeline.updatedBy'])
            ->orderByDesc('updated_at');

        if ($request->status && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        $tasks = $query->get();

        return ApiResponse::success(
            $tasks->map(fn($t) => $t->toApiArray())->values(),
            'Tasks retrieved.'
        );
    }

    /** Update ticket status — propagates to resident and admin */
    public function updateTaskStatus(UpdateTicketStatusRequest $request, int $id): JsonResponse
    {
        $user   = $request->user();
        $ticket = Ticket::where('assigned_to', $user->id)->findOrFail($id);

        // ✅ FIX: Use htmlspecialchars instead of strip_tags for proper XSS prevention
        $sanitizedNote = $request->field_note 
            ? htmlspecialchars($request->field_note, ENT_QUOTES, 'UTF-8') 
            : null;

        $ticket->update([
            'status'     => $request->status,
            'progress'   => Ticket::$statusProgress[$request->status] ?? $ticket->progress,
            'field_note' => $sanitizedNote,
        ]);

        TicketTimeline::create([
            'ticket_id'  => $ticket->id,
            'status'     => $request->status,
            'note'       => $sanitizedNote,
            'updated_by' => $user->id,
        ]);

        $ticket->load(['resident', 'assignedPersonnel', 'timeline.updatedBy']);

        return ApiResponse::success($ticket->toApiArray(), 'Task status updated.');
    }

    /** Personnel profile */
    public function profile(Request $request): JsonResponse
    {
        return ApiResponse::success($this->formatUser($request->user()), 'Profile retrieved.');
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->only(['first_name', 'last_name', 'email', 'phone', 'address', 'bio', 'avatar']));
        return ApiResponse::success($this->formatUser($user->fresh()), 'Profile updated.');
    }

}
