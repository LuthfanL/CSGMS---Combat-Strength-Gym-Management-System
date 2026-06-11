<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memberships', function (Blueprint $table) {
            $table->char('idMembership', 36)->primary();
            $table->char('idMember', 36);
            $table->char('idPackage', 36);
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();

            $table->foreign('idMember')->references('idMember')->on('members')->onDelete('cascade');
            $table->foreign('idPackage')->references('idPackage')->on('membership_packages')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memberships');
    }
};
