<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Creates 3 roles and one default user per portal.
     *
     * Login credentials:
     * ┌─────────────┬──────────────────────────────┬──────────────┐
     * │ Portal      │ Email                        │ Password     │
     * ├─────────────┼──────────────────────────────┼──────────────┤
     * │ Admin       │ admin@barangay.gov           │ Admin@123    │
     * │ Resident    │ resident@barangay.gov        │ Resident@123 │
     * │ Personnel   │ personnel@barangay.gov       │ Personnel@123│
     * └─────────────┴──────────────────────────────┴──────────────┘
     */
    public function run(): void
    {
        // ── 1. Create roles ───────────────────────────────────────────────
        $adminRole     = Role::firstOrCreate(['name' => 'admin',     'guard_name' => 'web']);
        $residentRole  = Role::firstOrCreate(['name' => 'resident',  'guard_name' => 'web']);
        $personnelRole = Role::firstOrCreate(['name' => 'personnel', 'guard_name' => 'web']);

        // ── 2. Admin user ─────────────────────────────────────────────────
        $admin = User::updateOrCreate(
            ['email' => 'admin@barangay.gov'],
            [
                'first_name' => 'System',
                'last_name'  => 'Administrator',
                'password'   => Hash::make('Admin@123'),
                'portal'     => 'admin',
                'status'     => 'active',
            ]
        );
        $admin->syncRoles([$adminRole]);

        // ── 3. Resident user ──────────────────────────────────────────────
        $resident = User::updateOrCreate(
            ['email' => 'resident@barangay.gov'],
            [
                'first_name' => 'Maria',
                'last_name'  => 'Santos',
                'password'   => Hash::make('Resident@123'),
                'portal'     => 'resident',
                'status'     => 'active',
            ]
        );
        $resident->syncRoles([$residentRole]);

        // ── 4. Personnel user ─────────────────────────────────────────────
        $personnel = User::updateOrCreate(
            ['email' => 'personnel@barangay.gov'],
            [
                'first_name' => 'Elias',
                'last_name'  => 'Santos',
                'password'   => Hash::make('Personnel@123'),
                'portal'     => 'personnel',
                'status'     => 'active',
            ]
        );
        $personnel->syncRoles([$personnelRole]);

        $this->command->info('✅ Roles and users seeded successfully.');
        $this->command->table(
            ['Portal', 'Email', 'Password'],
            [
                ['Admin',     'admin@barangay.gov',     'Admin@123'],
                ['Resident',  'resident@barangay.gov',  'Resident@123'],
                ['Personnel', 'personnel@barangay.gov', 'Personnel@123'],
            ]
        );
    }
}
