<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * GeocodingService — converts a text address to lat/lng.
 *
 * Strategy (in order):
 * 1. Nominatim (OpenStreetMap) — FREE, no API key, high accuracy for PH
 * 2. Google Geocoding API — if GOOGLE_MAPS_API_KEY is set
 * 3. Fallback — approximate Barangay San Vicente center with small offset
 *
 * Barangay San Vicente, Apalit, Pampanga center: 14.9456, 120.7558
 */
class GeocodingService
{
    const DEFAULT_LAT = 14.9456;
    const DEFAULT_LNG = 120.7558;

    // Bounding box for Apalit, Pampanga — used to bias Nominatim results
    const VIEWBOX = '120.72,14.90,120.80,14.98';

    public function geocode(string $address): array
    {
        // Try Nominatim first (free, no key needed)
        $result = $this->nominatim($address);
        if ($result['success']) return $result;

        // Try Google if key is configured
        $apiKey = config('services.google.maps_key');
        if (!empty($apiKey)) {
            $result = $this->google($address, $apiKey);
            if ($result['success']) return $result;
        }

        return $this->fallback($address, 'All geocoding methods failed.');
    }

    /**
     * Nominatim (OpenStreetMap) geocoding — free, no API key.
     */
    private function nominatim(string $address): array
    {
        // Append barangay context for accuracy
        $fullAddress = $address . ', Barangay San Vicente, Apalit, Pampanga, Philippines';

        try {
            $response = Http::timeout(8)
                ->withHeaders([
                    // Nominatim requires a User-Agent identifying your app
                    'User-Agent' => 'BarangayConnect/1.0 (noreply@barangay.gov)',
                    'Accept-Language' => 'en',
                ])
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q'              => $fullAddress,
                    'format'         => 'json',
                    'limit'          => 1,
                    'countrycodes'   => 'ph',
                    'viewbox'        => self::VIEWBOX,
                    'bounded'        => 0,  // 0 = prefer viewbox but don't restrict
                    'addressdetails' => 1,
                ]);

            if (!$response->ok()) {
                return ['success' => false, 'reason' => 'Nominatim HTTP ' . $response->status()];
            }

            $results = $response->json();

            if (empty($results)) {
                // Try without barangay context (broader search)
                $response2 = Http::timeout(8)
                    ->withHeaders(['User-Agent' => 'BarangayConnect/1.0 (noreply@barangay.gov)'])
                    ->get('https://nominatim.openstreetmap.org/search', [
                        'q'            => $address . ', Apalit, Pampanga, Philippines',
                        'format'       => 'json',
                        'limit'        => 1,
                        'countrycodes' => 'ph',
                    ]);

                $results = $response2->json() ?? [];
            }

            if (empty($results)) {
                return ['success' => false, 'reason' => 'Nominatim: no results'];
            }

            $hit = $results[0];

            return [
                'latitude'         => (float) $hit['lat'],
                'longitude'        => (float) $hit['lon'],
                'geocoded_address' => $hit['display_name'] ?? null,
                'success'          => true,
            ];

        } catch (\Throwable $e) {
            return ['success' => false, 'reason' => 'Nominatim exception: ' . $e->getMessage()];
        }
    }

    /**
     * Google Geocoding API — requires GOOGLE_MAPS_API_KEY.
     */
    private function google(string $address, string $apiKey): array
    {
        $fullAddress = $address . ', Barangay San Vicente, Apalit, Pampanga, Philippines';

        try {
            $response = Http::timeout(5)->get('https://maps.googleapis.com/maps/api/geocode/json', [
                'address' => $fullAddress,
                'key'     => $apiKey,
                'region'  => 'PH',
                'bounds'  => '14.92,120.73|14.97,120.78',
            ]);

            if (!$response->ok()) {
                return ['success' => false, 'reason' => 'Google HTTP ' . $response->status()];
            }

            $data = $response->json();

            if ($data['status'] !== 'OK' || empty($data['results'])) {
                return ['success' => false, 'reason' => 'Google status: ' . ($data['status'] ?? 'UNKNOWN')];
            }

            $loc = $data['results'][0]['geometry']['location'];

            return [
                'latitude'         => (float) $loc['lat'],
                'longitude'        => (float) $loc['lng'],
                'geocoded_address' => $data['results'][0]['formatted_address'] ?? null,
                'success'          => true,
            ];

        } catch (\Throwable $e) {
            return ['success' => false, 'reason' => 'Google exception: ' . $e->getMessage()];
        }
    }

    /**
     * Fallback — barangay center with small random offset.
     */
    private function fallback(string $address, string $reason): array
    {
        Log::warning("Geocoding failed for: {$address}. Reason: {$reason}");

        $latOffset = (mt_rand(-80, 80) / 100000);
        $lngOffset = (mt_rand(-80, 80) / 100000);

        return [
            'latitude'         => self::DEFAULT_LAT + $latOffset,
            'longitude'        => self::DEFAULT_LNG + $lngOffset,
            'geocoded_address' => null,
            'success'          => false,
        ];
    }
}
