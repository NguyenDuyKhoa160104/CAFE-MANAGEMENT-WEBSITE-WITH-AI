<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CafeTable extends Model
{
    use HasFactory;

    protected $table = 'cafe_tables';

    protected $fillable = [
        'table_code',
        'area_id',
        'name',
        'capacity',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'sort_order' => 'integer',
    ];

    public function area()
    {
        return $this->belongsTo(Area::class);
    }
}
