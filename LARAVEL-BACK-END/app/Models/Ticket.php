<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tracking_id',
        'title',
        'description',
        'category',
        'location',
        'latitude',
        'longitude',
        'geocoded_address',
        'severity',
        'status',
        'progress',
        'resident_id',
        'assigned_to',
        'field_note',
        'images',
    ];

    protected $casts = [
        'images'    => 'array',
        'latitude'  => 'float',
        'longitude' => 'float',
    ];

    // Progress map per status
    public static array $statusProgress = [
        'Pending'      => 10,
        'Under Review' => 30,
        'In Progress'  => 65,
        'Completed'    => 100,
        'Rejected'     => 0,
    ];

    public function resident(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resident_id');
    }

    public function assignedPersonnel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function timeline(): HasMany
    {
        return $this->hasMany(TicketTimeline::class)->orderByDesc('created_at');
    }

    /**
     * Format ticket for API response.
     */
    public function toApiArray(): array
    {
        return [
            'id'               => $this->id,
            'tracking_id'      => $this->tracking_id,
            'title'            => $this->title,
            'description'      => $this->description,
            'category'         => $this->category,
            'location'         => $this->location,
            'latitude'         => $this->latitude,
            'longitude'        => $this->longitude,
            'geocoded_address' => $this->geocoded_address,
            'severity'         => $this->severity,
            'status'           => $this->status,
            'progress'         => $this->progress,
            'resident'         => $this->resident ? [
                'id'        => $this->resident->id,
                'full_name' => $this->resident->full_name,
                'email'     => $this->resident->email,
            ] : null,
            'assigned_to'  => $this->assignedPersonnel ? [
                'id'        => $this->assignedPersonnel->id,
                'full_name' => $this->assignedPersonnel->full_name,
                'email'     => $this->assignedPersonnel->email,
            ] : null,
            'field_note'   => $this->field_note,
            'images'       => $this->images ?? [],
            'timeline'     => $this->timeline->map(fn($t) => [
                'status'     => $t->status,
                'note'       => $t->note,
                'updated_by' => $t->updatedBy?->full_name,
                'time'       => $t->created_at->diffForHumans(),
            ])->toArray(),
            'submitted'    => $this->created_at->format('M d, Y'),
            'updated'      => $this->updated_at->diffForHumans(),
            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,
        ];
    }
}
