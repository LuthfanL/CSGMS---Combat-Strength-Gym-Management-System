<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->char('idNotif', 36)->primary();
            $table->char('idMember', 36);
            $table->string('recipient_email', 255);
            $table->string('subject', 255);
            $table->text('message');
            $table->enum('status', ['sent', 'failed']);
            $table->dateTime('sent_at')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->foreign('idMember')->references('idMember')->on('members')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
