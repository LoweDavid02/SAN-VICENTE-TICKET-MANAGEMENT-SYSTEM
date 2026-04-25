<?php

namespace Database\Seeders;

use App\Models\Ticket;
use Illuminate\Database\Seeder;

/**
 * Seeds approximate coordinates for existing tickets that have no lat/lng.
 * Uses real locations within Barangay San Vicente, Apalit, Pampanga.
 */
class TicketCoordinatesSeeder extends Seeder
{
    // Real approximate coordinates for known puroks/streets in San Vicente, Apalit
    private array $locations = [
        ['lat' => 14.9456, 'lng' => 120.7558, 'label' => 'Barangay Center'],
        ['lat' => 14.9470, 'lng' => 120.7545, 'label' => 'Purok Norte'],
        ['lat' => 14.9440, 'lng' => 120.7570, 'label' => 'Market Area'],
        ['lat' => 14.9465, 'lng' => 120.7535, 'label' => 'Rizal Street'],
        ['lat' => 14.9450, 'lng' => 120.7580, 'label' => 'Purok Sur'],
        ['lat' => 14.9480, 'lng' => 120.7560, 'label' => 'San Jose Street'],
        ['lat' => 14.9435, 'lng' => 120.7550, 'label' => 'Gomez Avenue'],
        ['lat' => 14.9460, 'lng' => 120.7525, 'label' => 'Purok 3'],
        ['lat' => 14.9475, 'lng' => 120.7565, 'label' => 'East Side'],
        ['lat' => 14.9445, 'lng' => 120.7540, 'label' => 'Block 4'],
        ['lat' => 14.9490, 'lng' => 120.7555, 'label' => 'P. Burgos'],
        ['lat' => 14.9430, 'lng' => 120.7575, 'label' => 'Flood-prone Zone'],
    ];

    public function run(): void
    {
        $tickets = Ticket::whereNull('latitude')->get();
        $count   = count($this->locations);

        foreach ($tickets as $i => $ticket) {
            $loc = $this->locations[$i % $count];

            // Small random offset so markers don't stack exactly
            $latOffset = (mt_rand(-80, 80) / 100000);
            $lngOffset = (mt_rand(-80, 80) / 100000);

            $ticket->update([
                'latitude'  => $loc['lat'] + $latOffset,
                'longitude' => $loc['lng'] + $lngOffset,
            ]);
        }

        $this->command->info('Seeded coordinates for ' . $tickets->count() . ' tickets.');
    }
}
