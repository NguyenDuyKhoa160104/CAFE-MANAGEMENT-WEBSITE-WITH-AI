<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Area;

class AreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $areas = [
            [
                'area_code' => 'AREA01',
                'name' => 'Tầng 1',
                'description' => 'Khu vực trong nhà tầng 1',
                'sort_order' => 1,
                'status' => 'ACTIVE',
            ],
            [
                'area_code' => 'AREA02',
                'name' => 'Tầng 2',
                'description' => 'Khu vực trong nhà tầng 2',
                'sort_order' => 2,
                'status' => 'ACTIVE',
            ],
            [
                'area_code' => 'AREA03',
                'name' => 'Sân vườn',
                'description' => 'Khu vực ngoài trời thoáng mát',
                'sort_order' => 3,
                'status' => 'ACTIVE',
            ],
            [
                'area_code' => 'AREA04',
                'name' => 'Phòng máy lạnh',
                'description' => 'Phòng lạnh VIP',
                'sort_order' => 4,
                'status' => 'ACTIVE',
            ],
        ];

        foreach ($areas as $area) {
            Area::updateOrCreate(
                ['area_code' => $area['area_code']],
                $area
            );
        }
    }
}
