<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GymOperatingHour extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'idOperatingHour';
    public $incrementing = false;
    protected $keyType = 'string';
    
    // Disable timestamps since migration doesn't have them
    public $timestamps = false;

    protected $fillable = [
        'day',
        'open_time',
        'close_time',
        'is_closed',
    ];

    protected function casts(): array
    {
        return [
            'is_closed' => 'boolean',
        ];
    }
}
