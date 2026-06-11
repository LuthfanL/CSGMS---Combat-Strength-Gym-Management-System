<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gym_settings', function (Blueprint $table) {
            $table->char('idGym', 36)->primary();
            $table->string('gym_name', 255);
            $table->string('logo', 255)->nullable();
            $table->text('description');
            $table->text('address');
            $table->string('phone', 20);
            $table->string('email', 255);
            $table->string('instagram', 255)->nullable();
            $table->string('tiktok', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gym_settings');
    }
};
