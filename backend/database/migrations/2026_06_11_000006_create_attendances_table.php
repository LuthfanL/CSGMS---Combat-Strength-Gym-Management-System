<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->char('idAttendance', 36)->primary();
            $table->enum('attendance_type', ['member', 'guest']);
            $table->char('idMember', 36)->nullable();
            $table->char('idGuest', 36)->nullable();
            $table->dateTime('checkin_time');
            $table->timestamps();

            $table->foreign('idMember')->references('idMember')->on('members')->onDelete('set null');
            $table->foreign('idGuest')->references('idGuest')->on('guests')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
