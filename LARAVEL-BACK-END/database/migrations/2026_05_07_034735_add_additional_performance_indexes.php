<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Add additional performance indexes for tracking_id, coordinates, and notifications.
     */
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Unique index for tracking_id (used in guest tracking)
            $table->unique('tracking_id', 'idx_tickets_tracking_id_unique');
            
            // Spatial index for latitude/longitude (map queries)
            $table->index(['latitude', 'longitude'], 'idx_tickets_coordinates');
            
            // Index for resident_id (when filtering by resident)
            $table->index('resident_id', 'idx_tickets_resident_id');
        });

        Schema::table('notifications', function (Blueprint $table) {
            // Index for user notifications queries
            $table->index(['user_id', 'read', 'created_at'], 'idx_notifications_user_read');
            
            // Index for portal-specific notifications
            $table->index(['portal', 'created_at'], 'idx_notifications_portal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropUnique('idx_tickets_tracking_id_unique');
            $table->dropIndex('idx_tickets_coordinates');
            $table->dropIndex('idx_tickets_resident_id');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_user_read');
            $table->dropIndex('idx_notifications_portal');
        });
    }
};
