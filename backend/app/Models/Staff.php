<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Staff extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'staffs';

    protected $fillable = [
        'staff_code',
        'full_name',
        'email',
        'phone',
        'password',
        'avatar',
        'avatar_public_id',
        'position',
        'role_id',
        'hire_date',
        'base_salary',
        'status',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'base_salary' => 'decimal:2',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class, 'staff_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function hasPermission(string $permissionCode): bool
    {
        if (!$this->role || $this->role->status !== 'ACTIVE') {
            return false;
        }

        return $this->role->permissions()->where('permission_code', $permissionCode)->exists();
    }
}
