<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'idAudit';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'idUser',
        'action',
        'module',
        'description',
        'old_data',
        'new_data',
    ];

    protected function casts(): array
    {
        return [
            'old_data' => 'array',
            'new_data' => 'array',
        ];
    }

    public function uniqueIds(): array
    {
        return ['idAudit'];
    }

    // ---- Relationships ----

    public function user()
    {
        return $this->belongsTo(User::class, 'idUser', 'idUser');
    }
}
