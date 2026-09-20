<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = "admins";
    protected $fillable = [
        'admin_code',
        'full_name',
        'email',
        'phone',
        'password',
        'avatar',
        'status',
    ];
    protected $hidden = [
        'password',
        'remember_token',
    ];
}
