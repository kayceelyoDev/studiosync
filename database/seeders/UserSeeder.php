<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed one user per role for development and testing.
     *
     * Credentials:
     *  super_admin  →  superadmin@gmail.com  / admin123
     *  admin        →  admin@gmail.com        / admin123
     *  client       →  client@gmail.com       / admin123
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@gmail.com',
                'role' => 'super_admin',
            ],
            [
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'role' => 'admin',
            ],
            [
                'name' => 'Client',
                'email' => 'client@gmail.com',
                'role' => 'client',
            ],
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('admin123'),
                    'email_verified_at' => now(),
                ],
            );

            $user->syncRoles([$userData['role']]);
        }
    }
}
