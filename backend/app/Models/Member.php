<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'idMember';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'idUser',
        'member_code',
        'photo',
    ];

    public function uniqueIds(): array
    {
        return ['idMember'];
    }

    // ---- Relationships ----

    public function user()
    {
        return $this->belongsTo(User::class, 'idUser', 'idUser');
    }

    public function memberships()
    {
        return $this->hasMany(Membership::class, 'idMember', 'idMember');
    }

    public function activeMembership()
    {
        return $this->hasOne(Membership::class, 'idMember', 'idMember')
            ->where('end_date', '>=', now()->toDateString())
            ->latest('end_date');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'idMember', 'idMember');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'idMember', 'idMember');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'idMember', 'idMember');
    }
}
