<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'idAttendance';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'attendance_type',
        'idMember',
        'idGuest',
        'checkin_time',
    ];

    protected function casts(): array
    {
        return [
            'checkin_time' => 'datetime',
        ];
    }

    public function uniqueIds(): array
    {
        return ['idAttendance'];
    }

    // ---- Relationships ----

    public function member()
    {
        return $this->belongsTo(Member::class, 'idMember', 'idMember');
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class, 'idGuest', 'idGuest');
    }
}
