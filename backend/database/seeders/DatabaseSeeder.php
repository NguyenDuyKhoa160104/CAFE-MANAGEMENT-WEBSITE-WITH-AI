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
        $this->call([
            AdminSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            AreaSeeder::class,
            CafeTableSeeder::class,
            StaffSeeder::class,
            RolePermissionSeeder::class,
            CustomerSeeder::class,
            PromotionSeeder::class,
            WorkShiftSeeder::class,
            AIKnowledgeEntrySeeder::class,
            AISettingSeeder::class,
            DevelopmentOrderSeeder::class,
        ]);
    }
}
