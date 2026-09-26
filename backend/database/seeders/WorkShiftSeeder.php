<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WorkShift;

class WorkShiftSeeder extends Seeder
{
    public function run(): void
    {
        $shifts = [
            [
                'shift_code' => 'SHIFT_MORNING',
                'name' => 'Ca sáng',
                'start_time' => '07:00:00',
                'end_time' => '12:00:00',
                'grace_minutes' => 10,
                'sort_order' => 1
            ],
            [
                'shift_code' => 'SHIFT_AFTERNOON',
                'name' => 'Ca chiều',
                'start_time' => '12:00:00',
                'end_time' => '17:00:00',
                'grace_minutes' => 10,
                'sort_order' => 2
            ],
            [
                'shift_code' => 'SHIFT_EVENING',
                'name' => 'Ca tối',
                'start_time' => '17:00:00',
                'end_time' => '22:00:00',
                'grace_minutes' => 10,
                'sort_order' => 3
            ]
        ];

        foreach ($shifts as $s) {
            WorkShift::firstOrCreate(
                ['shift_code' => $s['shift_code']],
                $s
            );
        }
    }
}
