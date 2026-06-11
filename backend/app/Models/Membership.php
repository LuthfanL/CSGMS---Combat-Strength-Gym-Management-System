<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Membership extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'idMembership';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'idMember',
        'idPackage',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function uniqueIds(): array
    {
        return ['idMembership'];
    }

    // ---- Relationships ----

    public function member()
    {
        return $this->belongsTo(Member::class, 'idMember', 'idMember');
    }

    public function package()
    {
        return $this->belongsTo(MembershipPackage::class, 'idPackage', 'idPackage');
    }
}
