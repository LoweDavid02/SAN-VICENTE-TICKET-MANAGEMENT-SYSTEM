<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add latitude, longitude, and geocoded_address to tickets table.
     * These are populated by the Geocoding API when a ticket is submitted.
     */
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->decimal('latitude',  10, 7)->nullable()->after('location');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('geocoded_address')->nullable()->after('longitude');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'geocoded_address']);
        });
    }
};
