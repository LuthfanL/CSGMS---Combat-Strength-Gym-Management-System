<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'idPayment';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'invoice',
        'idMember',
        'idGuest',
        'idPackage',
        'payment_type',
        'payment_method',
        'amount',
        'status',
        'verified_by',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function uniqueIds(): array
    {
        return ['idPayment'];
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

    public function package()
    {
        return $this->belongsTo(MembershipPackage::class, 'idPackage', 'idPackage');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by', 'idUser');
    }
}
