<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'idGuest';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'phone',
    ];

    public function uniqueIds(): array
    {
        return ['idGuest'];
    }

    // ---- Relationships ----

    public function payments()
    {
        return $this->hasMany(Payment::class, 'idGuest', 'idGuest');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'idGuest', 'idGuest');
    }
}
