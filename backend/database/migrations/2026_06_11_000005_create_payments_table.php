<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->char('idPayment', 36)->primary();
            $table->string('invoice', 50)->unique();
            $table->char('idMember', 36)->nullable();
            $table->char('idGuest', 36)->nullable();
            $table->char('idPackage', 36)->nullable();
            $table->enum('payment_type', ['new_membership', 'renew_membership', 'guest']);
            $table->enum('payment_method', ['qris', 'cash']);
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['pending', 'paid', 'cancel']);
            $table->char('verified_by', 36)->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();

            $table->foreign('idMember')->references('idMember')->on('members')->onDelete('set null');
            $table->foreign('idGuest')->references('idGuest')->on('guests')->onDelete('set null');
            $table->foreign('idPackage')->references('idPackage')->on('membership_packages')->onDelete('set null');
            $table->foreign('verified_by')->references('idUser')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
