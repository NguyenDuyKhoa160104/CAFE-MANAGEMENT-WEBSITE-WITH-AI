<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Area;
use App\Models\CafeTable;

class CafeTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $area1 = Area::where('area_code', 'AREA01')->first();
        $area2 = Area::where('area_code', 'AREA02')->first();
        $area3 = Area::where('area_code', 'AREA03')->first();
        $area4 = Area::where('area_code', 'AREA04')->first();

        if (!$area1 || !$area2 || !$area3 || !$area4) {
            return;
        }

        $tables = [
            // Tầng 1
            ['table_code' => 'T01', 'area_id' => $area1->id, 'name' => 'Bàn 01', 'capacity' => 2, 'status' => 'AVAILABLE', 'sort_order' => 1],
            ['table_code' => 'T02', 'area_id' => $area1->id, 'name' => 'Bàn 02', 'capacity' => 4, 'status' => 'AVAILABLE', 'sort_order' => 2],
            ['table_code' => 'T03', 'area_id' => $area1->id, 'name' => 'Bàn 03', 'capacity' => 4, 'status' => 'OCCUPIED', 'sort_order' => 3],
            ['table_code' => 'T04', 'area_id' => $area1->id, 'name' => 'Bàn 04', 'capacity' => 6, 'status' => 'AVAILABLE', 'sort_order' => 4],
            
            // Tầng 2
            ['table_code' => 'T05', 'area_id' => $area2->id, 'name' => 'Bàn 05', 'capacity' => 2, 'status' => 'RESERVED', 'sort_order' => 1],
            ['table_code' => 'T06', 'area_id' => $area2->id, 'name' => 'Bàn 06', 'capacity' => 4, 'status' => 'AVAILABLE', 'sort_order' => 2],
            ['table_code' => 'T07', 'area_id' => $area2->id, 'name' => 'Bàn 07', 'capacity' => 4, 'status' => 'AVAILABLE', 'sort_order' => 3],
            ['table_code' => 'T08', 'area_id' => $area2->id, 'name' => 'Bàn 08', 'capacity' => 2, 'status' => 'OCCUPIED', 'sort_order' => 4],

            // Sân vườn
            ['table_code' => 'T09', 'area_id' => $area3->id, 'name' => 'Bàn sân vườn 01', 'capacity' => 4, 'status' => 'AVAILABLE', 'sort_order' => 1],
            ['table_code' => 'T10', 'area_id' => $area3->id, 'name' => 'Bàn sân vườn 02', 'capacity' => 6, 'status' => 'INACTIVE', 'sort_order' => 2],
            ['table_code' => 'T11', 'area_id' => $area3->id, 'name' => 'Bàn sân vườn 03', 'capacity' => 4, 'status' => 'AVAILABLE', 'sort_order' => 3],
            
            // Phòng máy lạnh
            ['table_code' => 'T12', 'area_id' => $area4->id, 'name' => 'Bàn VIP 01', 'capacity' => 8, 'status' => 'AVAILABLE', 'sort_order' => 1],
            ['table_code' => 'T13', 'area_id' => $area4->id, 'name' => 'Bàn VIP 02', 'capacity' => 4, 'status' => 'RESERVED', 'sort_order' => 2],
        ];

        foreach ($tables as $table) {
            CafeTable::updateOrCreate(
                ['table_code' => $table['table_code']],
                $table
            );
        }
    }
}
