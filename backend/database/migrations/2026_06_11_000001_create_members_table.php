<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->char('idMember', 36)->primary();
            $table->char('idUser', 36)->unique();
            $table->string('member_code', 20)->unique()->nullable();
            $table->string('photo', 255);
            $table->timestamps();

            $table->foreign('idUser')->references('idUser')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
