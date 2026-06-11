<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipPackage extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'idPackage';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'duration',
        'facilities',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'duration' => 'integer',
            'price' => 'decimal:2',
        ];
    }

    public function uniqueIds(): array
    {
        return ['idPackage'];
    }

    // ---- Relationships ----

    public function memberships()
    {
        return $this->hasMany(Membership::class, 'idPackage', 'idPackage');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'idPackage', 'idPackage');
    }
}
