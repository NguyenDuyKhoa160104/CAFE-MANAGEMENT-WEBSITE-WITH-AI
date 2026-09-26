<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = [
        'category_code',
        'name',
        'slug',
        'description',
        'image',
        'image_public_id',
        'sort_order',
        'status',
    ];

    protected $hidden = [
        'image_public_id',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
