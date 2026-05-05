<?php

namespace App\Http\Controllers\Api\V1\Guest;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SubmitGuestTicketRequest;
use App\Models\Ticket;
use App\Models\TicketTimeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GuestController extends Controller
{
    /**
     * Submit a new ticket as a guest (no authentication required).
     *
     * @param SubmitGuestTicketRequest $request
     * @return JsonResponse
     */
    public function submitTicket(SubmitGuestTicketRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Generate unique tracking code: SV-YYYY-XXXXX
            $trackingId = $this->generateTrackingCode();

            // Create ticket with guest information
            $ticket = Ticket::create([
                'tracking_id'      => $trackingId,
                'title'            => $request->title,
                'description'      => $request->description,
                'category'         => $request->category,
                'location'         => $request->location,
                'latitude'         => $request->latitude,
                'longitude'        => $request->longitude,
                'severity'         => $request->severity,
                'status'           => 'Pending',
                'progress'         => 10,
                'resident_id'      => null, // Guest submission - no resident_id
                'guest_name'       => $request->guest_name,
                'guest_email'      => $request->guest_email,
                'guest_phone'      => $request->guest_phone,
                'guest_address'    => $request->guest_address,
                'images'           => $request->images ? json_encode($request->images) : null,
            ]);

            // Create initial timeline entry
            TicketTimeline::create([
                'ticket_id'   => $ticket->id,
                'status'      => 'Pending',
                'note'        => 'Ticket submitted by guest',
                'updated_by'  => null, // No user for guest submissions
            ]);

            DB::commit();

            // ✅ FIX: Don't log PII (guest_email removed)
            Log::info('Guest ticket submitted', [
                'tracking_id'  => $trackingId,
                'category'     => $request->category,
                'severity'     => $request->severity,
            ]);

            return response()->json([
                'success'      => true,
                'message'      => 'Your request has been submitted successfully!',
                'tracking_id'  => $trackingId,
                'ticket'       => [
                    'id'           => $ticket->id,
                    'tracking_id'  => $ticket->tracking_id,
                    'title'        => $ticket->title,
                    'category'     => $ticket->category,
                    'status'       => $ticket->status,
                    'severity'     => $ticket->severity,
                    'location'     => $ticket->location,
                    'created_at'   => $ticket->created_at->format('Y-m-d H:i:s'),
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Guest ticket submission failed', [
                'error'   => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit your request. Please try again.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Track a ticket by tracking code (public, no authentication required).
     *
     * @param string $trackingCode
     * @return JsonResponse
     */
    public function trackTicket(string $trackingCode): JsonResponse
    {
        try {
            // Find ticket by tracking code
            $ticket = Ticket::with(['assignedPersonnel', 'timeline.updatedBy'])
                ->where('tracking_id', strtoupper($trackingCode))
                ->first();

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found. Please check your tracking code.',
                ], 404);
            }

            // Format ticket data for guest view
            $ticketData = [
                'id'               => $ticket->id,
                'tracking_id'      => $ticket->tracking_id,
                'title'            => $ticket->title,
                'description'      => $ticket->description,
                'category'         => $ticket->category,
                'location'         => $ticket->location,
                'latitude'         => $ticket->latitude,
                'longitude'        => $ticket->longitude,
                'geocoded_address' => $ticket->geocoded_address,
                'severity'         => $ticket->severity,
                'status'           => $ticket->status,
                'progress'         => $ticket->progress,
                'images'           => $ticket->images ? json_decode($ticket->images) : [],
                'created_at'       => $ticket->created_at->format('F d, Y h:i A'),
                'updated_at'       => $ticket->updated_at->format('F d, Y h:i A'),
                
                // Guest information (only show if guest submission)
                'guest_name'       => $ticket->guest_name,
                'guest_email'      => $ticket->guest_email,
                'guest_phone'      => $ticket->guest_phone,
                
                // Assigned personnel (if any)
                'assigned_to'      => $ticket->assignedPersonnel ? [
                    'id'         => $ticket->assignedPersonnel->id,
                    'name'       => $ticket->assignedPersonnel->full_name,
                    'email'      => $ticket->assignedPersonnel->email,
                ] : null,
                
                // Timeline
                'timeline'         => $ticket->timeline->map(function ($entry) {
                    return [
                        'id'         => $entry->id,
                        'status'     => $entry->status,
                        'note'       => $entry->note,
                        'updated_by' => $entry->updatedBy ? $entry->updatedBy->full_name : 'System',
                        'created_at' => $entry->created_at->format('F d, Y h:i A'),
                    ];
                }),
            ];

            return response()->json([
                'success' => true,
                'ticket'  => $ticketData,
            ]);

        } catch (\Exception $e) {
            Log::error('Guest ticket tracking failed', [
                'tracking_code' => $trackingCode,
                'error'         => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve ticket information. Please try again.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Generate unique tracking code: SV-YYYY-XXXXX
     * Optimized to use database sequence instead of querying last ticket
     *
     * @return string
     */
    private function generateTrackingCode(): string
    {
        $year = date('Y');
        $maxAttempts = 5;

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            // Use database to get next sequence number atomically
            $sequence = DB::table('tickets')
                ->whereYear('created_at', $year)
                ->lockForUpdate()
                ->count() + 1;

            $trackingId = sprintf('SV-%s-%05d', $year, $sequence);

            // Double-check uniqueness (race condition protection)
            $exists = Ticket::where('tracking_id', $trackingId)->exists();
            
            if (!$exists) {
                return $trackingId;
            }
        }

        // Fallback to random code if sequential fails
        return sprintf('SV-%s-%05d', $year, rand(10000, 99999));
    }
}
