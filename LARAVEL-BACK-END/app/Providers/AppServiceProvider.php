<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Routing\UrlGenerator;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(UrlGenerator $url): void
    {
        // Force HTTPS on Render (production)
        if (config('app.env') === 'production') {
            $url->forceScheme('https');
        }
    }
}
