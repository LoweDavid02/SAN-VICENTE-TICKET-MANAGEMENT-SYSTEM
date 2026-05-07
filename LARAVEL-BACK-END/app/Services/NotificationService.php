<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Ticket;

class NotificationService
{
    /**
     * Create a notification for specific user(s).
     */
    public static function create(array $data): Notification
    {
        return Notification::create([
            'user_id' => $data['user_id'] ?? null,
            'type' => $data['type'] ?? 'info',
            'title' => $data['title'],
            'body' => $data['body'],
            'link' => $data['link'] ?? null,
            'portal' => $data['portal'] ?? null,
        ]);
    }

    /**
     * Notify all admins.
     */
    public static function notifyAdmins(string $title, string $body, string $type = 'info', ?string $link = null): void
    {
        $admins = User::where('portal', 'admin')
            ->where('status', 'active')
            ->get();
        
        foreach ($admins as $admin) {
            self::create([
                'user_id' => $admin->id,
                'type' => $type,
                'title' => $title,
                'body' => $body,
                'link' => $link,
                'portal' => 'admin',
            ]);
        }
    }

    /**
     * Notify specific personnel.
     */
    public static function notifyPersonnel(int $personnelId, string $title, string $body, string $type = 'info', ?string $link = null): void
    {
        self::create([
            'user_id' => $personnelId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'link' => $link,
            'portal' => 'personnel',
        ]);
    }

    /**
     * Notify ticket submitter (resident only, not guests).
     */
    public static function notifyTicketSubmitter(int $ticketId, string $title, string $body, string $type = 'info'): void
    {
        $ticket = Ticket::find($ticketId);
        
        if ($ticket && $ticket->resident_id) {
            self::create([
                'user_id' => $ticket->resident_id,
                'type' => $type,
                'title' => $title,
                'body' => $body,
                'link' => '/resident/history',
                'portal' => 'resident',
            ]);
        }
    }

    /**
     * Notify on new ticket submission.
     */
    public static function onTicketCreated(Ticket $ticket): void
    {
        self::notifyAdmins(
            "New Ticket: {$ticket->tracking_id}",
            "New {$ticket->category} concern submitted" . ($ticket->guest_name ? " by {$ticket->guest_name}" : ""),
            'info',
            '/admin/tickets'
        );
    }

    /**
     * Notify on ticket assignment.
     */
    public static function onTicketAssigned(Ticket $ticket, User $personnel): void
    {
        self::notifyPersonnel(
            $personnel->id,
            "Ticket Assigned: {$ticket->tracking_id}",
            "You have been assigned to work on: {$ticket->title}",
            'info',
            '/personnel/tasks'
        );
    }

    /**
     * Notify on ticket status update.
     */
    public static function onTicketStatusUpdated(Ticket $ticket, string $oldStatus, string $newStatus): void
    {
        // Notify assigned personnel
        if ($ticket->assigned_to) {
            self::notifyPersonnel(
                $ticket->assigned_to,
                "Ticket {$ticket->tracking_id} Updated",
                "Status changed from {$oldStatus} to {$newStatus}",
                $newStatus === 'Completed' ? 'success' : 'info',
                '/personnel/tasks'
            );
        }

        // Notify resident if ticket has resident_id
        if ($ticket->resident_id) {
            self::notifyTicketSubmitter(
                $ticket->id,
                "Your Ticket {$ticket->tracking_id} Updated",
                "Status changed to {$newStatus}",
                $newStatus === 'Completed' ? 'success' : 'info'
            );
        }

        // Notify admins for important status changes
        if (in_array($newStatus, ['Completed', 'Rejected'])) {
            self::notifyAdmins(
                "Ticket {$ticket->tracking_id} {$newStatus}",
                "{$ticket->title} has been marked as {$newStatus}",
                $newStatus === 'Completed' ? 'success' : 'warning',
                '/admin/tickets'
            );
        }
    }
}
