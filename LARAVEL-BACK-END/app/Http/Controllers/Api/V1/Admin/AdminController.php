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
            $allowed = ['Pending', 'Under Review', 'In Progress', 'Completed', 'Rejected'];
            if (in_array($request->status, $allowed, true)) {
                $query->where('status', $request->status);
            }
        }
        if ($request->severity && $request->severity !== 'All') {
            $allowed = ['Low', 'Medium', 'High'];
            if (in_array($request->severity, $allowed, true)) {
                $query->where('severity', $request->severity);
            }
        }
        if ($request->search) {
            $search = substr(strip_tags($request->search), 0, 100);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('tracking_id', 'ilike', "%{$search}%");
            });
        }

        // Cap per_page to max 50 to prevent resource exhaustion (API4)
        $perPage = min((int) ($request->per_page ?? 20), 50);
        $tickets = $query->paginate($perPage);

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
            'field_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $ticket = Ticket::findOrFail($id);
        $ticket->update([
            'status'     => $request->status,
            'progress'   => Ticket::$statusProgress[$request->status] ?? $ticket->progress,
            'field_note' => $request->field_note ? strip_tags($request->field_note) : null,
        ]);

        TicketTimeline::create([
            'ticket_id'  => $ticket->id,
            'status'     => $request->status,
            'note'       => $request->field_note ? strip_tags($request->field_note) : null,
            'updated_by' => $request->user()->id,
        ]);

        $ticket->load(['resident', 'assignedPersonnel', 'timeline.updatedBy']);

        return ApiResponse::success($ticket->toApiArray(), 'Ticket status updated.');
    }

    /** Assign ticket to personnel */
    public function assignTicket(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'personnel_id' => ['required', 'integer', 'exists:users,id'],
            'note'         => ['nullable', 'string', 'max:500'],
        ]);

        $ticket    = Ticket::findOrFail($id);
        // Scope to personnel portal only — prevents assigning to admin/resident
        $personnel = User::where('portal', 'personnel')
                         ->where('status', 'active')
                         ->findOrFail($request->personnel_id);

        $ticket->update([
            'assigned_to' => $personnel->id,
            'status'      => $ticket->status === 'Pending' ? 'Under Review' : $ticket->status,
            'progress'    => $ticket->status === 'Pending' ? 30 : $ticket->progress,
        ]);

        $note = "Assigned to {$personnel->full_name}." . ($request->note ? ' Note: ' . strip_tags($request->note) : '');

        TicketTimeline::create([
            'ticket_id'  => $ticket->id,
            'status'     => $ticket->status,
            'note'       => $note,
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
    }    public function updateProfile(UpdateProfileRequest $request): JsonResponse
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

    /**
     * Map data — all tickets with coordinates for the geospatial map.
     * Supports filtering by status, category, date range, and search.
     */
    public function mapTickets(Request $request): JsonResponse
    {
        $query = Ticket::with(['resident'])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderByDesc('created_at');

        // Filter by status
        if ($request->status && $request->status !== 'All') {
            $allowed = ['Pending', 'Under Review', 'In Progress', 'Completed', 'Rejected'];
            if (in_array($request->status, $allowed, true)) {
                $query->where('status', $request->status);
            }
        }

        // Filter by category
        if ($request->category && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        // Filter by date range
        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search by resident name or address
        if ($request->search) {
            $search = substr(strip_tags($request->search), 0, 100);
            $query->where(function ($q) use ($search) {
                $q->where('location', 'ilike', "%{$search}%")
                  ->orWhere('title', 'ilike', "%{$search}%")
                  ->orWhereHas('resident', fn($r) => $r->whereRaw(
                      "CONCAT(first_name, ' ', last_name) ILIKE ?", ["%{$search}%"]
                  ));
            });
        }

        $tickets = $query->get();

        $markers = $tickets->map(fn($t) => [
            'id'            => $t->id,
            'tracking_id'   => $t->tracking_id,
            'title'         => $t->title,
            'description'   => $t->description,
            'category'      => $t->category,
            'location'      => $t->location,
            'latitude'      => (float) $t->latitude,
            'longitude'     => (float) $t->longitude,
            'severity'      => $t->severity,
            'status'        => $t->status,
            'submitted'     => $t->created_at->format('M d, Y'),
            'resident_name' => $t->resident?->full_name ?? 'Unknown',
        ])->values();

        return ApiResponse::success([
            'markers' => $markers,
            'total'   => $markers->count(),
        ], 'Map tickets retrieved.');
    }

}
