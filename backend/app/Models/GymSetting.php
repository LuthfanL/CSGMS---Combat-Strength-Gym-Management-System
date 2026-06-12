<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GymSetting extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'idGym';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'gym_name',
        'logo',
        'description',
        'address',
        'phone',
        'email',
        'instagram',
        'tiktok',
        'guest_price',
    ];
}
