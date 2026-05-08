<?php

namespace App\Http\Controllers\Api\V1\Guest;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SubmitGuestTicketRequest;
use App\Models\Ticket;
use App\Models\TicketPhoto;
use App\Models\TicketTimeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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
            // Verify reCAPTCHA token with Google
            // Note: SSL verification is disabled in local development to avoid certificate issues
            // In production, proper SSL certificates should be configured on the server
            $httpClient = Http::asForm()->timeout(10);
            
            // Only disable SSL verification in local/development environment
            if (config('app.env') === 'local' || config('app.env') === 'development') {
                $httpClient = $httpClient->withoutVerifying();
            }
            
            try {
                $recaptchaResponse = $httpClient->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret'   => config('services.recaptcha.secret'),
                    'response' => $request->captcha_token,
                    'remoteip' => $request->ip(),
                ]);

                $recaptchaData = $recaptchaResponse->json();

                // Log detailed reCAPTCHA response for debugging
                Log::info('reCAPTCHA verification attempt', [
                    'success'      => $recaptchaData['success'] ?? false,
                    'error_codes'  => $recaptchaData['error-codes'] ?? [],
                    'hostname'     => $recaptchaData['hostname'] ?? null,
                    'challenge_ts' => $recaptchaData['challenge_ts'] ?? null,
                    'ip'           => $request->ip(),
                ]);

                // Check if CAPTCHA verification failed
                if (!isset($recaptchaData['success']) || !$recaptchaData['success']) {
                    $errorCodes = $recaptchaData['error-codes'] ?? [];
                    
                    // Provide user-friendly error messages based on error codes
                    $errorMessage = 'reCAPTCHA verification failed. Please try again.';
                    
                    if (in_array('missing-input-secret', $errorCodes)) {
                        $errorMessage = 'Server configuration error. Please contact support.';
                        Log::error('reCAPTCHA: Missing secret key configuration');
                    } elseif (in_array('invalid-input-secret', $errorCodes)) {
                        $errorMessage = 'Server configuration error. Please contact support.';
                        Log::error('reCAPTCHA: Invalid secret key');
                    } elseif (in_array('missing-input-response', $errorCodes)) {
                        $errorMessage = 'Please complete the reCAPTCHA verification.';
                    } elseif (in_array('invalid-input-response', $errorCodes)) {
                        $errorMessage = 'Invalid or expired reCAPTCHA. Please verify again.';
                    } elseif (in_array('bad-request', $errorCodes)) {
                        $errorMessage = 'Invalid request. Please refresh and try again.';
                    } elseif (in_array('timeout-or-duplicate', $errorCodes)) {
                        $errorMessage = 'reCAPTCHA expired or already used. Please verify again.';
                    }

                    Log::warning('reCAPTCHA verification failed', [
                        'ip'           => $request->ip(),
                        'error_codes'  => $errorCodes,
                        'hostname'     => $recaptchaData['hostname'] ?? null,
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => $errorMessage,
                        'errors'  => [
                            'captcha_token' => [$errorMessage]
                        ],
                        'debug' => config('app.debug') ? [
                            'error_codes' => $errorCodes,
                            'hostname' => $recaptchaData['hostname'] ?? null,
                        ] : null,
                    ], 422);
                }
            } catch (\Exception $e) {
                Log::error('reCAPTCHA verification request failed', [
                    'error' => $e->getMessage(),
                    'ip'    => $request->ip(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Unable to verify reCAPTCHA. Please try again.',
                    'errors'  => [
                        'captcha_token' => ['reCAPTCHA verification service unavailable. Please try again.']
                    ],
                ], 422);
            }

            DB::beginTransaction();

            // Generate unique tracking code: SV-YYYY-XXXXX
            $trackingId = $this->generateTrackingCode();

            // Create ticket with guest information
            $ticket = Ticket::create([
                'tracking_id'      => $trackingId,
                'reference_code'   => $trackingId, // Use same code for reference
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
                'images'           => null, // Will be populated with photo URLs
            ]);

            // Handle photo uploads
            $photoUrls = [];
            $uploadedFiles = []; // Track uploaded files for cleanup on failure
            
            if ($request->hasFile('photos')) {
                $photos = $request->file('photos');
                
                foreach ($photos as $index => $photo) {
                    // Validate MIME type
                    $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
                    if (!in_array($photo->getMimeType(), $allowedMimes)) {
                        continue;
                    }

                    // Validate file size (10MB max)
                    if ($photo->getSize() > 10 * 1024 * 1024) {
                        continue;
                    }

                    // Generate unique filename
                    $filename = sprintf(
                        '%s_%d_%s.%s',
                        $trackingId,
                        $index + 1,
                        Str::random(8),
                        $photo->getClientOriginalExtension()
                    );

                    // Store file in storage/app/public/tickets/
                    $path = $photo->storeAs('tickets', $filename, 'public');
                    $uploadedFiles[] = $path; // Track for cleanup

                    // Create TicketPhoto record
                    $ticketPhoto = TicketPhoto::create([
                        'ticket_id'  => $ticket->id,
                        'file_path'  => $path,
                        'file_name'  => $photo->getClientOriginalName(),
                        'mime_type'  => $photo->getMimeType(),
                        'file_size'  => $photo->getSize(),
                    ]);

                    // Add URL to array
                    $photoUrls[] = asset('storage/' . $path);
                }

                // Update ticket with photo URLs
                if (!empty($photoUrls)) {
                    $ticket->update(['images' => json_encode($photoUrls)]);
                }
            }

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
                'photos_count' => count($photoUrls),
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
                    'photos'       => $photoUrls,
                    'created_at'   => $ticket->created_at->format('Y-m-d H:i:s'),
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Clean up uploaded files on transaction failure
            if (!empty($uploadedFiles)) {
                foreach ($uploadedFiles as $path) {
                    Storage::disk('public')->delete($path);
                }
            }
            
            Log::error('Guest ticket submission failed', [
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
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
     * Uses database locking to prevent race conditions under concurrent requests.
     *
     * @return string
     */
    private function generateTrackingCode(): string
    {
        $year = date('Y');

        return DB::transaction(function () use ($year) {
            // Lock the last ticket for this year to prevent race conditions
            $lastTicket = Ticket::whereYear('created_at', $year)
                ->lockForUpdate()
                ->orderByDesc('id')
                ->first();

            $sequence = $lastTicket 
                ? ((int) substr($lastTicket->tracking_id, -5)) + 1 
                : 1;

            $trackingId = sprintf('SV-%s-%05d', $year, $sequence);

            // Double-check uniqueness (should never happen with lock, but safety first)
            if (Ticket::where('tracking_id', $trackingId)->exists()) {
                // Fallback to random if somehow duplicate exists
                return sprintf('SV-%s-%05d', $year, rand(10000, 99999));
            }

            return $trackingId;
        });
    }

    /**
     * Track ticket via POST (for civic UI).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function trackTicketPost(Request $request): JsonResponse
    {
        $request->validate([
            'reference_code' => 'required|string|min:5|max:20',
        ]);

        return $this->trackTicket($request->reference_code);
    }

    /**
     * Confirm ticket resolution (resident confirmation).
     *
     * @param string $referenceCode
     * @param Request $request
     * @return JsonResponse
     */
    public function confirmResolution(string $referenceCode, Request $request): JsonResponse
    {
        $request->validate([
            'resolved' => 'required|boolean',
            'note'     => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $ticket = Ticket::where('tracking_id', strtoupper($referenceCode))
                ->orWhere('reference_code', strtoupper($referenceCode))
                ->first();

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found.',
                ], 404);
            }

            // Only allow confirmation if ticket is Completed
            if ($ticket->status !== 'Completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket must be in Completed status to confirm resolution.',
                ], 400);
            }

            if ($request->resolved) {
                // Mark as Verified & Closed
                $ticket->update([
                    'status'   => 'Verified & Closed',
                    'progress' => 100,
                ]);

                // Create timeline entry
                TicketTimeline::create([
                    'ticket_id'   => $ticket->id,
                    'status'      => 'Verified & Closed',
                    'note'        => 'Resident confirmed resolution' . ($request->note ? ': ' . $request->note : ''),
                    'updated_by'  => null,
                ]);

                $message = 'Thank you for confirming! Your ticket has been closed.';
            } else {
                // Keep as Completed, add note
                TicketTimeline::create([
                    'ticket_id'   => $ticket->id,
                    'status'      => 'Completed',
                    'note'        => 'Resident reported issue not resolved' . ($request->note ? ': ' . $request->note : ''),
                    'updated_by'  => null,
                ]);

                $message = 'Thank you for your feedback. We will review your concern.';
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $message,
                'ticket'  => [
                    'status'   => $ticket->status,
                    'progress' => $ticket->progress,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Ticket confirmation failed', [
                'reference_code' => $referenceCode,
                'error'          => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process confirmation. Please try again.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
