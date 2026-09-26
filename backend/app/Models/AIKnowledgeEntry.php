<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AIKnowledgeEntry extends Model
{
    use HasFactory;

    protected $table = 'ai_knowledge_entries';

    protected $fillable = [
        'title',
        'category',
        'content',
        'status',
        'sort_order',
        'created_by',
        'updated_by',
    ];

    public function createdBy()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(Admin::class, 'updated_by');
    }
}
