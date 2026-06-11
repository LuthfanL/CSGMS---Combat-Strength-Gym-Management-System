<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'idNotif';
    public $incrementing = false;
    protected $keyType = 'string';

    // Notification table only has created_at, no updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'idMember',
        'recipient_email',
        'subject',
        'message',
        'status',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }

    public function uniqueIds(): array
    {
        return ['idNotif'];
    }

    // ---- Relationships ----

    public function member()
    {
        return $this->belongsTo(Member::class, 'idMember', 'idMember');
    }
}
