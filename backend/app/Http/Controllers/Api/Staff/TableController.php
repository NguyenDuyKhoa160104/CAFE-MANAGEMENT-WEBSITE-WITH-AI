<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Staff\StaffTableService;

class TableController extends Controller
{
    protected $tableService;

    public function __construct(StaffTableService $tableService)
    {
        $this->tableService = $tableService;
    }

    public function getAreas(Request $request)
    {
        $areas = $this->tableService->getAreas($request);
        return response()->json([
            'message' => 'Lấy danh sách khu vực thành công',
            'data' => $areas
        ]);
    }

    public function getTables(Request $request)
    {
        $tables = $this->tableService->getTables($request);
        return response()->json([
            'message' => 'Lấy danh sách bàn thành công',
            'data' => $tables
        ]);
    }

    public function getTableDetail($id)
    {
        $table = $this->tableService->getTableDetail($id);
        return response()->json([
            'message' => 'Lấy chi tiết bàn thành công',
            'data' => $table
        ]);
    }
}
