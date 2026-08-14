<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Roles must be seeded before users so syncRoles() works
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
        ]);
    }
}
