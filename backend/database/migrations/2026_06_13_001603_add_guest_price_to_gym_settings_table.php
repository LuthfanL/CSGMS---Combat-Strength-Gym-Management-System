<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('gym_settings', function (Blueprint $table) {
            $table->integer('guest_price')->default(15000)->after('tiktok');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gym_settings', function (Blueprint $table) {
            $table->dropColumn('guest_price');
        });
    }
};
