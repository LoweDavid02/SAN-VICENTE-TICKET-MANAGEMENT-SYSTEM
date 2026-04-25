<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Services\GeocodingService;
use Illuminate\Database\Seeder;

/**
 * Re-geocodes all tickets using the improved GeocodingService (Nominatim).
 * Run: php artisan db:seed --class=RegeocodingSeeder
 */
class RegeocodingSeeder extends Seeder
{
    public function run(): void
    {
        $geocoder = new GeocodingService();
        $tickets  = Ticket::all();
        $success  = 0;
        $fallback = 0;

        foreach ($tickets as $ticket) {
            // Rate limit: Nominatim allows 1 req/sec
            sleep(1);

            $result = $geocoder->geocode($ticket->location);

            $ticket->update([
                'latitude'         => $result['latitude'],
                'longitude'        => $result['longitude'],
                'geocoded_address' => $result['geocoded_address'],
            ]);

            if ($result['success']) {
                $success++;
                $this->command->line("  ✓ {$ticket->tracking_id}: {$ticket->location} → {$result['latitude']}, {$result['longitude']}");
            } else {
                $fallback++;
                $this->command->warn("  ~ {$ticket->tracking_id}: {$ticket->location} → fallback coords");
            }
        }

        $this->command->info("Re-geocoded {$tickets->count()} tickets: {$success} accurate, {$fallback} fallback.");
    }
}
