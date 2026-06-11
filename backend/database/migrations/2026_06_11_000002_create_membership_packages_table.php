<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_packages', function (Blueprint $table) {
            $table->char('idPackage', 36)->primary();
            $table->string('name', 255);
            $table->integer('duration');
            $table->text('facilities');
            $table->decimal('price', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_packages');
    }
};
