<?php

namespace App\Http\Controllers\Api\V1\Resident;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SubmitTicketRequest;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Models\Ticket;
use App\Models\TicketTimeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ResidentController extends Controller
{
    /** Resident dashboard — summary + recent tickets */
    public function dashboard(Request $request): JsonResponse
    {
        $user    = $request->user();
        $tickets = Ticket::where('resident_id', $user->id)
            ->with(['assignedPersonnel', 'timeline'])
            ->orderByDesc('created_at')
            ->get();

        return ApiResponse::success([
            'user'    => $this->formatUser($user),
            'summary' => [
                'requests_submitted' => $tickets->count(),
                'requests_resolved'  => $tickets->where('status', 'Completed')->count(),
                'requests_pending'   => $tickets->whereIn('status', ['Pending', 'Under Review', 'In Progress'])->count(),
            ],
            'tickets' => $tickets->map(fn($t) => $t->toApiArray())->values(),
        ], 'Resident dashboard data retrieved.');
    }

    /** Submit a new service request */
    public function submitTicket(SubmitTicketRequest $request): JsonResponse
    {
        $user = $request->user();

        $trackingId = 'SVR-' . strtoupper(Str::random(6));

        $ticket = Ticket::create([
            'tracking_id' => $trackingId,
            'title'       => $request->title,
            'description' => $request->description,
            'category'    => $request->category,
            'location'    => $request->location,
            'severity'    => $request->severity,
            'status'      => 'Pending',
            'progress'    => 10,
            'resident_id' => $user->id,
            'assigned_to' => null,
            'images'      => $request->images ?? [],
        ]);

        // Create initial timeline entry
        TicketTimeline::create([
            'ticket_id'  => $ticket->id,
            'status'     => 'Pending',
            'note'       => 'Request submitted by resident.',
            'updated_by' => $user->id,
        ]);

        $ticket->load(['resident', 'assignedPersonnel', 'timeline.updatedBy']);

        return ApiResponse::success([
            'ticket'     => $ticket->toApiArray(),
            'trackingId' => $trackingId,
        ], 'Request submitted successfully.', 201);
    }

    /** List all tickets for this resident */
    public function myTickets(Request $request): JsonResponse
    {
        $tickets = Ticket::where('resident_id', $request->user()->id)
            ->with(['assignedPersonnel', 'timeline.updatedBy'])
            ->orderByDesc('created_at')
            ->get();

        return ApiResponse::success(
            $tickets->map(fn($t) => $t->toApiArray())->values(),
            'Tickets retrieved.'
        );
    }

    /** Get a single ticket */
    public function showTicket(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::where('resident_id', $request->user()->id)
            ->with(['assignedPersonnel', 'timeline.updatedBy'])
            ->findOrFail($id);

        return ApiResponse::success($ticket->toApiArray(), 'Ticket retrieved.');
    }

    /** Get/update profile */
    public function profile(Request $request): JsonResponse
    {
        return ApiResponse::success($this->formatUser($request->user()), 'Profile retrieved.');
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->only(['first_name', 'last_name', 'email', 'phone', 'address', 'bio', 'avatar']));

        return ApiResponse::success($this->formatUser($user->fresh()), 'Profile updated successfully.');
    }

    private function formatUser($user): array
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
