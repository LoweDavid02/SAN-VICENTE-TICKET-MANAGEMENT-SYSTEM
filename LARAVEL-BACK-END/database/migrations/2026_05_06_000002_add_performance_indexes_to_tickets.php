<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add performance indexes to tickets table for faster queries.
     */
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Single column indexes for frequently filtered fields
            $table->index('status', 'idx_tickets_status');
            $table->index('category', 'idx_tickets_category');
            $table->index('severity', 'idx_tickets_severity');
            $table->index('created_at', 'idx_tickets_created_at');
            $table->index('assigned_to', 'idx_tickets_assigned_to');
            
            // Composite indexes for common query patterns
            $table->index(['status', 'created_at'], 'idx_tickets_status_created');
            $table->index(['assigned_to', 'status'], 'idx_tickets_assigned_status');
            $table->index(['category', 'status'], 'idx_tickets_category_status');
        });

        Schema::table('ticket_timeline', function (Blueprint $table) {
            // Index for timeline queries
            $table->index(['ticket_id', 'created_at'], 'idx_timeline_ticket_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex('idx_tickets_status');
            $table->dropIndex('idx_tickets_category');
            $table->dropIndex('idx_tickets_severity');
            $table->dropIndex('idx_tickets_created_at');
            $table->dropIndex('idx_tickets_assigned_to');
            $table->dropIndex('idx_tickets_status_created');
            $table->dropIndex('idx_tickets_assigned_status');
            $table->dropIndex('idx_tickets_category_status');
        });

        Schema::table('ticket_timeline', function (Blueprint $table) {
            $table->dropIndex('idx_timeline_ticket_created');
        });
    }
};
