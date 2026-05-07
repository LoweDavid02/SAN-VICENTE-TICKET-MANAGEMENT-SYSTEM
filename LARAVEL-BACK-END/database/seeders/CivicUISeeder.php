<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Ticket;
use App\Models\TicketTimeline;
use App\Models\TicketStatusLog;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class CivicUISeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles if they don't exist
        $adminRole = Role::firstOrCreate(['name' => 'administrator', 'guard_name' => 'web']);
        $personnelRole = Role::firstOrCreate(['name' => 'personnel', 'guard_name' => 'web']);
        $residentRole = Role::firstOrCreate(['name' => 'resident', 'guard_name' => 'web']);

        $this->command->info('✓ Roles created');

        // Create Admin Account
        $admin = User::firstOrCreate(
            ['email' => 'admin@sanvicente.gov.ph'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'password' => Hash::make('Admin@2026!'),
                'portal' => 'admin',
                'status' => 'active',
            ]
        );

        // Assign admin role
        if (!$admin->hasRole('administrator')) {
            $admin->assignRole('administrator');
        }

        $this->command->info('✓ Admin account created: admin@sanvicente.gov.ph / Admin@2026!');

        // Create Personnel Accounts
        $personnel1 = User::firstOrCreate(
            ['email' => 'personnel1@sanvicente.gov.ph'],
            [
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'password' => Hash::make('Personnel@2026!'),
                'portal' => 'personnel',
                'status' => 'active',
            ]
        );

        if (!$personnel1->hasRole('personnel')) {
            $personnel1->assignRole('personnel');
        }

        $personnel2 = User::firstOrCreate(
            ['email' => 'personnel2@sanvicente.gov.ph'],
            [
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'password' => Hash::make('Personnel@2026!'),
                'portal' => 'personnel',
                'status' => 'active',
            ]
        );

        if (!$personnel2->hasRole('personnel')) {
            $personnel2->assignRole('personnel');
        }

        $this->command->info('✓ Personnel accounts created');

        // Sample Tickets
        $tickets = [
            [
                'reference_code' => 'SV-2026-00001',
                'guest_name' => 'Pedro Reyes',
                'guest_email' => 'pedro@example.com',
                'guest_phone' => '09123456789',
                'guest_address' => 'Purok 1, San Vicente, Apalit, Pampanga',
                'title' => 'Broken Streetlight on Main Road',
                'description' => 'The streetlight near the corner of Main Road and 2nd Street has been broken for 3 days. It\'s very dark at night and poses a safety risk.',
                'category' => 'infrastructure',
                'location' => 'Main Road corner 2nd Street',
                'severity' => 'High',
                'status' => 'Completed',
                'progress' => 100,
                'assigned_to' => $personnel1->id,
            ],
            [
                'reference_code' => 'SV-2026-00002',
                'guest_name' => 'Ana Garcia',
                'guest_email' => 'ana@example.com',
                'guest_phone' => '09234567890',
                'guest_address' => 'Purok 2, San Vicente, Apalit, Pampanga',
                'title' => 'Clogged Drainage System',
                'description' => 'The drainage in front of our house is clogged and water is overflowing during rain. This has been happening for over a week.',
                'category' => 'sanitation',
                'location' => 'Purok 2, near the basketball court',
                'severity' => 'Medium',
                'status' => 'In Progress',
                'progress' => 65,
                'assigned_to' => $personnel2->id,
            ],
            [
                'reference_code' => 'SV-2026-00003',
                'guest_name' => 'Carlos Mendoza',
                'guest_email' => 'carlos@example.com',
                'guest_phone' => '09345678901',
                'guest_address' => 'Purok 3, San Vicente, Apalit, Pampanga',
                'title' => 'Pothole on Barangay Road',
                'description' => 'There is a large pothole on the barangay road that is causing damage to vehicles. It needs immediate repair.',
                'category' => 'infrastructure',
                'location' => 'Barangay Road, near the chapel',
                'severity' => 'High',
                'status' => 'Under Review',
                'progress' => 30,
                'assigned_to' => $personnel1->id,
            ],
            [
                'reference_code' => 'SV-2026-00004',
                'guest_name' => 'Lisa Fernandez',
                'guest_email' => 'lisa@example.com',
                'guest_phone' => '09456789012',
                'guest_address' => 'Purok 4, San Vicente, Apalit, Pampanga',
                'title' => 'Uncollected Garbage',
                'description' => 'Garbage has not been collected for 2 weeks in our area. The smell is becoming unbearable.',
                'category' => 'waste_management',
                'location' => 'Purok 4, residential area',
                'severity' => 'High',
                'status' => 'Pending',
                'progress' => 10,
                'assigned_to' => null,
            ],
            [
                'reference_code' => 'SV-2026-00005',
                'guest_name' => 'Roberto Cruz',
                'guest_email' => 'roberto@example.com',
                'guest_phone' => '09567890123',
                'guest_address' => 'Purok 5, San Vicente, Apalit, Pampanga',
                'title' => 'Water Supply Interruption',
                'description' => 'Our area has been experiencing water supply interruptions for the past 3 days. We need assistance.',
                'category' => 'other',
                'location' => 'Purok 5, entire area',
                'severity' => 'High',
                'status' => 'In Progress',
                'progress' => 65,
                'assigned_to' => $personnel1->id,
            ],
            [
                'reference_code' => 'SV-2026-00006',
                'guest_name' => 'Elena Santos',
                'guest_email' => 'elena@example.com',
                'guest_phone' => '09678901234',
                'guest_address' => 'Purok 1, San Vicente, Apalit, Pampanga',
                'title' => 'Stray Dogs in the Area',
                'description' => 'There are several stray dogs roaming around our area. They are becoming aggressive and pose a danger to children.',
                'category' => 'public_safety',
                'location' => 'Purok 1, near the school',
                'severity' => 'Medium',
                'status' => 'Under Review',
                'progress' => 30,
                'assigned_to' => null,
            ],
            [
                'reference_code' => 'SV-2026-00007',
                'guest_name' => 'Miguel Torres',
                'guest_email' => 'miguel@example.com',
                'guest_phone' => '09789012345',
                'guest_address' => 'Purok 2, San Vicente, Apalit, Pampanga',
                'title' => 'Broken Basketball Court Light',
                'description' => 'The light at the basketball court has been broken for a month. We can\'t play in the evening anymore.',
                'category' => 'infrastructure',
                'location' => 'Barangay Basketball Court',
                'severity' => 'Low',
                'status' => 'Pending',
                'progress' => 10,
                'assigned_to' => null,
            ],
            [
                'reference_code' => 'SV-2026-00008',
                'guest_name' => 'Sofia Reyes',
                'guest_email' => 'sofia@example.com',
                'guest_phone' => '09890123456',
                'guest_address' => 'Purok 3, San Vicente, Apalit, Pampanga',
                'title' => 'Request for Medical Assistance',
                'description' => 'My elderly mother needs medical assistance. She has difficulty walking and needs help getting to the health center.',
                'category' => 'health_&_medical',
                'location' => 'Purok 3, house #25',
                'severity' => 'High',
                'status' => 'Completed',
                'progress' => 100,
                'assigned_to' => $personnel2->id,
            ],
            [
                'reference_code' => 'SV-2026-00009',
                'guest_name' => 'Diego Ramos',
                'guest_email' => 'diego@example.com',
                'guest_phone' => '09901234567',
                'guest_address' => 'Purok 4, San Vicente, Apalit, Pampanga',
                'title' => 'Noise Complaint',
                'description' => 'There is excessive noise from a nearby establishment late at night. It\'s disturbing the peace of residents.',
                'category' => 'public_order',
                'location' => 'Purok 4, near the store',
                'severity' => 'Medium',
                'status' => 'Rejected',
                'progress' => 0,
                'assigned_to' => null,
                'rejection_reason' => 'Establishment has proper permits. Noise levels are within acceptable limits.',
            ],
            [
                'reference_code' => 'SV-2026-00010',
                'guest_name' => 'Carmen Lopez',
                'guest_email' => 'carmen@example.com',
                'guest_phone' => '09012345678',
                'guest_address' => 'Purok 5, San Vicente, Apalit, Pampanga',
                'title' => 'Request for Barangay Clearance',
                'description' => 'I would like to request assistance in processing my barangay clearance for employment purposes.',
                'category' => 'other',
                'location' => 'Barangay Hall',
                'severity' => 'Low',
                'status' => 'Completed',
                'progress' => 100,
                'assigned_to' => $admin->id,
            ],
        ];

        foreach ($tickets as $ticketData) {
            $ticket = Ticket::create($ticketData);

            // Create timeline entry
            TicketTimeline::create([
                'ticket_id' => $ticket->id,
                'status' => $ticket->status,
                'note' => 'Ticket submitted by guest',
                'updated_by' => null,
            ]);

            // Create status log
            TicketStatusLog::create([
                'ticket_id' => $ticket->id,
                'changed_by' => null,
                'from_status' => 'Pending',
                'to_status' => $ticket->status,
                'note' => 'Initial status',
            ]);

            $this->command->info("✓ Created ticket: {$ticket->reference_code}");
        }

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('Civic UI Seeder Complete!');
        $this->command->info('========================================');
        $this->command->info('Admin Login:');
        $this->command->info('  Email: admin@sanvicente.gov.ph');
        $this->command->info('  Password: Admin@2026!');
        $this->command->info('');
        $this->command->info('Personnel Login:');
        $this->command->info('  Email: personnel1@sanvicente.gov.ph');
        $this->command->info('  Password: Personnel@2026!');
        $this->command->info('');
        $this->command->info('Sample Tickets: 10 tickets created');
        $this->command->info('Reference Codes: SV-2026-00001 to SV-2026-00010');
        $this->command->info('========================================');
    }
}

