<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'customers';

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'password',
        'avatar',
        'avatar_public_id',
        'status',
    ];

    protected $hidden = [
        'password',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
