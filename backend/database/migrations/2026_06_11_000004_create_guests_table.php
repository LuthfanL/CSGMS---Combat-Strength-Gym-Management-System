<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->char('idGuest', 36)->primary();
            $table->string('name', 255);
            $table->string('phone', 20);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};
