<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    protected $primaryKey = 'idUser';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'is_active',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function uniqueIds(): array
    {
        return ['idUser'];
    }

    // ---- Relationships ----

    public function member()
    {
        return $this->hasOne(Member::class, 'idUser', 'idUser');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'idUser', 'idUser');
    }

    public function verifiedPayments()
    {
        return $this->hasMany(Payment::class, 'verified_by', 'idUser');
    }
}
