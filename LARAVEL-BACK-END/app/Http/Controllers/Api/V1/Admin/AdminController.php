<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\FormatsUser;
use App\Http\Requests\Api\CreateUserRequest;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Models\Ticket;
use App\Models\TicketTimeline;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    use FormatsUser;
    /** Admin dashboard summary */
    public function dashboard(Request $request): JsonResponse
    {
        $tickets = Ticket::with(['resident', 'assignedPersonnel'])->orderByDesc('created_at')->get();

        $stats = [
            'total_users'      => User::count(),
            'total_residents'  => User::where('portal', 'resident')->count(),
            'total_personnel'  => User::where('portal', 'personnel')->count(),
            'active_users'     => User::where('status', 'active')->count(),
            'total_tickets'    => $tickets->count(),
            'pending_tickets'  => $tickets->where('status', 'Pending')->count(),
            'in_progress'      => $tickets->where('status', 'In Progress')->count(),
            'resolved_tickets' => $tickets->where('status', 'Completed')->count(),
            'urgent_tickets'   => $tickets->where('severity', 'High')
                ->whereNotIn('status', ['Completed', 'Rejected'])->count(),
        ];

        return ApiResponse::success([
            'stats'   => $stats,
            'tickets' => $tickets->map(fn($t) => $t->toApiArray())->values(),
        ], 'Admin dashboard data retrieved.');
    }

    /** List all tickets with filters */
    public function tickets(Request $request): JsonResponse
    {
        $query = Ticket::with(['resident', 'assignedPersonnel', 'timeline.updatedBy'])
            ->orderByDesc('created_at');

        if ($request->status && $request->status !== 'All') {
            $query->where('status', $request->status);
        }
        if ($request->severity && $request->severity !== 'All') {
            $query->where('severity', $request->severity);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'ilike', "%{$request->search}%")
                  ->orWhere('tracking_id', 'ilike', "%{$request->search}%");
            });
        }

        $tickets = $query->paginate(20);

        return ApiResponse::success([
            'tickets'    => collect($tickets->items())->map(fn($t) => $t->toApiArray())->values(),
            'pagination' => [
                'total'        => $tickets->total(),
                'current_page' => $tickets->currentPage(),
                'last_page'    => $tickets->lastPage(),
                'per_page'     => $tickets->perPage(),
            ],
        ], 'Tickets retrieved.');
    }

    /** Update ticket status (admin) */
    public function updateTicketStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status'     => ['required', 'in:Pending,Under Review,In Progress,Completed,Rejected'],
            'field_note' => ['nullable', 'string'],
        ]);

        $ticket = Ticket::findOrFail($id);
        $ticket->update([
            'status'     => $request->status,
            'progress'   => Ticket::$statusProgress[$request->status] ?? $ticket->progress,
            'field_note' => $request->field_note,
        ]);

        TicketTimeline::create([
            'ticket_id'  => $ticket->id,
            'status'     => $request->status,
            'note'       => $request->field_note,
            'updated_by' => $request->user()->id,
        ]);

        $ticket->load(['resident', 'assignedPersonnel', 'timeline.updatedBy']);

        return ApiResponse::success($ticket->toApiArray(), 'Ticket status updated.');
    }

    /** Assign ticket to personnel */
    public function assignTicket(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'personnel_id' => ['required', 'exists:users,id'],
            'note'         => ['nullable', 'string'],
        ]);

        $ticket    = Ticket::findOrFail($id);
        $personnel = User::where('portal', 'personnel')->findOrFail($request->personnel_id);

        $ticket->update([
            'assigned_to' => $personnel->id,
            'status'      => $ticket->status === 'Pending' ? 'Under Review' : $ticket->status,
            'progress'    => $ticket->status === 'Pending' ? 30 : $ticket->progress,
        ]);

        TicketTimeline::create([
            'ticket_id'  => $ticket->id,
            'status'     => $ticket->status,
            'note'       => "Assigned to {$personnel->full_name}." . ($request->note ? " Note: {$request->note}" : ''),
            'updated_by' => $request->user()->id,
        ]);

        $ticket->load(['resident', 'assignedPersonnel', 'timeline.updatedBy']);

        return ApiResponse::success($ticket->toApiArray(), "Ticket assigned to {$personnel->full_name}.");
    }

    /** List all users */
    public function users(Request $request): JsonResponse
    {
        $users = User::with('roles')->orderBy('created_at', 'desc')->paginate(15);

        return ApiResponse::success([
            'users'      => collect($users->items())->map(fn($u) => $this->formatUser($u))->values(),
            'pagination' => [
                'total'        => $users->total(),
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
            ],
        ], 'Users retrieved.');
    }

    /** List all personnel */
    public function personnel(Request $request): JsonResponse
    {
        $personnel = User::where('portal', 'personnel')
            ->where('status', 'active')
            ->withCount(['assignedTickets as active_tickets' => function ($q) {
                $q->whereNotIn('status', ['Completed', 'Rejected']);
            }])
            ->get()
            ->map(fn($u) => [
                'id'             => $u->id,
                'full_name'      => $u->full_name,
                'first_name'     => $u->first_name,
                'last_name'      => $u->last_name,
                'email'          => $u->email,
                'phone'          => $u->phone,
                'portal'         => $u->portal,
                'status'         => $u->status,
                'active_tickets' => $u->active_tickets,
                'created_at'     => $u->created_at,
            ]);

        return ApiResponse::success($personnel, 'Personnel retrieved.');
    }

    /** Admin profile */
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

    /**
     * Admin creates a new admin or personnel account.
     * Residents self-register via POST /auth/register instead.
     */
    public function createUser(CreateUserRequest $request): JsonResponse
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'portal'     => $request->portal,
            'status'     => 'active',
        ]);

        $user->assignRole($request->portal);

        return ApiResponse::success($this->formatUser($user), 'User created successfully.', 201);
    }

    /** Soft-delete a user account */
    public function deleteUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent self-deletion
        if ($user->id === $request->user()->id) {
            return ApiResponse::error('You cannot delete your own account.', 403);
        }

        $user->delete();

        return ApiResponse::success(null, 'User deleted successfully.');
    }

    /** Activate or suspend a user account */
    public function updateUserStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:active,inactive,suspended'],
        ]);

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return ApiResponse::error('You cannot change your own status.', 403);
        }

        $user->update(['status' => $request->status]);

        return ApiResponse::success($this->formatUser($user->fresh()), 'User status updated.');
    }

}
