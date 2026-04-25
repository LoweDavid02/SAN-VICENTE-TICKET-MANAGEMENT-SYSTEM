<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * GeocodingService — converts a text address to lat/lng using Google Geocoding API.
 *
 * Falls back to approximate Barangay San Vicente coordinates if geocoding fails
 * so the ticket is still saved and shown on the map (near the barangay center).
 *
 * Barangay San Vicente, Apalit, Pampanga center: 14.9456, 120.7558
 */
class GeocodingService
{
    // Barangay San Vicente, Apalit, Pampanga — fallback center
    const DEFAULT_LAT = 14.9456;
    const DEFAULT_LNG = 120.7558;

    /**
     * Geocode an address string.
     *
     * @param  string $address
     * @return array{latitude: float, longitude: float, geocoded_address: string|null, success: bool}
     */
    public function geocode(string $address): array
    {
        $apiKey = config('services.google.maps_key');

        // If no API key configured, use default coordinates
        if (empty($apiKey)) {
            return $this->fallback($address, 'No Google Maps API key configured.');
        }

        // Append barangay context to improve geocoding accuracy
        $fullAddress = $address . ', Barangay San Vicente, Apalit, Pampanga, Philippines';

        try {
            $response = Http::timeout(5)->get('https://maps.googleapis.com/maps/api/geocode/json', [
                'address' => $fullAddress,
                'key'     => $apiKey,
                'region'  => 'PH',
                'bounds'  => '14.92,120.73|14.97,120.78', // Bias to Apalit area
            ]);

            if (! $response->ok()) {
                return $this->fallback($address, 'Geocoding API HTTP error: ' . $response->status());
            }

            $data = $response->json();

            if ($data['status'] !== 'OK' || empty($data['results'])) {
                return $this->fallback($address, 'Geocoding returned status: ' . ($data['status'] ?? 'UNKNOWN'));
            }

            $result   = $data['results'][0];
            $location = $result['geometry']['location'];

            return [
                'latitude'         => (float) $location['lat'],
                'longitude'        => (float) $location['lng'],
                'geocoded_address' => $result['formatted_address'] ?? null,
                'success'          => true,
            ];

        } catch (\Throwable $e) {
            return $this->fallback($address, $e->getMessage());
        }
    }

    /**
     * Return default barangay coordinates with a small random offset
     * so multiple tickets at the same address don't stack exactly.
     */
    private function fallback(string $address, string $reason): array
    {
        Log::warning("Geocoding failed for address: {$address}. Reason: {$reason}");

        // Small random offset (±0.001° ≈ ±100m) to spread markers
        $latOffset = (mt_rand(-100, 100) / 100000);
        $lngOffset = (mt_rand(-100, 100) / 100000);

        return [
            'latitude'         => self::DEFAULT_LAT + $latOffset,
            'longitude'        => self::DEFAULT_LNG + $lngOffset,
            'geocoded_address' => null,
            'success'          => false,
        ];
    }
}
