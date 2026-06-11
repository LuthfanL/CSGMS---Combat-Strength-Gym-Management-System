<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->char('idAudit', 36)->primary();
            $table->char('idUser', 36);
            $table->string('action', 255);
            $table->string('module', 255);
            $table->text('description');
            $table->json('old_data')->nullable();
            $table->json('new_data')->nullable();
            $table->timestamps();

            $table->foreign('idUser')->references('idUser')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
