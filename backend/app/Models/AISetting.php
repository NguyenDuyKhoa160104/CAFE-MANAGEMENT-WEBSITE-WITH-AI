<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AISetting extends Model
{
    use HasFactory;

    protected $table = 'ai_settings';

    protected $fillable = [
        'enabled',
        'assistant_name',
        'welcome_message',
        'fallback_message',
        'maintenance_message',
        'system_prompt',
        'provider',
        'model',
        'temperature',
        'max_tokens',
        'history_limit',
        'daily_message_limit',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'temperature' => 'decimal:2',
    ];
}
