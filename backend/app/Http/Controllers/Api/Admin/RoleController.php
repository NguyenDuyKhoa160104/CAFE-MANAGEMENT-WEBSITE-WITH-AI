<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\Permission;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::withCount('staffs')->get();
        return response()->json(['message' => 'Lấy danh sách vai trò thành công', 'data' => $roles]);
    }

    public function show($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        return response()->json(['message' => 'Lấy chi tiết vai trò thành công', 'data' => $role]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_code' => 'required|string|max:50|unique:roles,role_code',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'status' => 'in:ACTIVE,INACTIVE',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id'
        ]);

        $role = Role::create($validated);
        
        if (isset($validated['permission_ids'])) {
            $role->permissions()->sync($validated['permission_ids']);
        }

        return response()->json(['message' => 'Tạo vai trò thành công', 'data' => $role], 201);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        
        $validated = $request->validate([
            'role_code' => 'required|string|max:50|unique:roles,role_code,' . $id,
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'status' => 'in:ACTIVE,INACTIVE',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id'
        ]);

        $role->update($validated);

        if (isset($validated['permission_ids'])) {
            $role->permissions()->sync($validated['permission_ids']);
        }

        return response()->json(['message' => 'Cập nhật vai trò thành công', 'data' => $role]);
    }

    public function updateStatus(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        if ($role->is_system) {
            return response()->json(['message' => 'Không thể đổi trạng thái vai trò hệ thống'], 403);
        }
        $request->validate(['status' => 'required|in:ACTIVE,INACTIVE']);
        $role->update(['status' => $request->status]);
        return response()->json(['message' => 'Cập nhật trạng thái thành công', 'data' => $role]);
    }

    public function destroy($id)
    {
        $role = Role::withCount('staffs')->findOrFail($id);
        
        if ($role->is_system) {
            return response()->json(['message' => 'Không thể xóa vai trò hệ thống.'], 403);
        }

        if ($role->staffs_count > 0) {
            return response()->json(['message' => 'Không thể xóa vai trò đang có nhân viên sử dụng.'], 409);
        }

        $role->delete();
        return response()->json(['message' => 'Xóa vai trò thành công']);
    }

    public function updatePermissions(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $request->validate(['permissions' => 'array', 'permissions.*' => 'exists:permissions,id']);
        $role->permissions()->sync($request->permissions);
        return response()->json(['message' => 'Cập nhật quyền thành công']);
    }

    public function getPermissions()
    {
        $permissions = Permission::whereNotIn('module', ['Kho', 'Đặt bàn'])
            ->get()
            ->groupBy('module');
        return response()->json(['message' => 'Lấy danh sách quyền thành công', 'data' => $permissions]);
    }
}
