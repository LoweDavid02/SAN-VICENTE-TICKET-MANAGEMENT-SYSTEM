<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Rename tracking_id to reference_code if tracking_id exists
            if (Schema::hasColumn('tickets', 'tracking_id')) {
                $table->renameColumn('tracking_id', 'reference_code');
            } else {
                // Add reference_code if it doesn't exist
                $table->string('reference_code', 20)->unique()->after('id');
            }
            
            // Add rejection_reason if it doesn't exist
            if (!Schema::hasColumn('tickets', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('status');
            }
            
            // Ensure urgency_level has default
            if (Schema::hasColumn('tickets', 'urgency_level')) {
                $table->string('urgency_level', 10)->default('Medium')->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            if (Schema::hasColumn('tickets', 'reference_code')) {
                $table->renameColumn('reference_code', 'tracking_id');
            }
            
            if (Schema::hasColumn('tickets', 'rejection_reason')) {
                $table->dropColumn('rejection_reason');
            }
        });
    }
};
