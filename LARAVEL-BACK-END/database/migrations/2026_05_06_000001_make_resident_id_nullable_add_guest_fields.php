<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Make resident_id nullable to support guest-based ticket submissions.
     * Add guest tracking fields for non-authenticated submissions.
     */
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Make resident_id nullable to allow guest submissions
            $table->unsignedBigInteger('resident_id')->nullable()->change();
            
            // Add guest information fields
            $table->string('guest_name')->nullable()->after('resident_id');
            $table->string('guest_email')->nullable()->after('guest_name');
            $table->string('guest_phone')->nullable()->after('guest_email');
            $table->text('guest_address')->nullable()->after('guest_phone');
            
            // Add index on tracking_id for fast guest lookups
            $table->index('tracking_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Remove guest fields
            $table->dropColumn(['guest_name', 'guest_email', 'guest_phone', 'guest_address']);
            
            // Remove tracking_id index
            $table->dropIndex(['tracking_id']);
            
            // Make resident_id required again (this will fail if there are guest tickets)
            $table->unsignedBigInteger('resident_id')->nullable(false)->change();
        });
    }
};
