<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gym_operating_hours', function (Blueprint $table) {
            $table->char('idOperatingHour', 36)->primary();
            $table->enum('day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])->unique();
            $table->time('open_time')->nullable();
            $table->time('close_time')->nullable();
            $table->tinyInteger('is_closed')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gym_operating_hours');
    }
};
