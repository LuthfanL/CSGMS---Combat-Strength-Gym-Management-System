<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\GuestController;

// Public routes
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/packages/active', [PackageController::class, 'active']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);

    Route::prefix('member/payments')->group(function () {
        Route::get('/', [PaymentController::class, 'indexMember']);
        Route::post('/', [PaymentController::class, 'store']);
        Route::get('/{invoice}', [PaymentController::class, 'show']);
    });

    Route::get('/member/attendances', [\App\Http\Controllers\AttendanceController::class, 'indexMember']);
});

// Owner routes
Route::middleware(['auth:sanctum', 'role:owner'])->prefix('owner')->group(function () {
    Route::get('/admins', [AdminController::class, 'index']);
    Route::post('/admins', [AdminController::class, 'store']);
    Route::post('/admins/{id}', [AdminController::class, 'update']);
    Route::patch('/admins/{id}/toggle-active', [AdminController::class, 'toggleActive']);
    
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'getOwnerDashboard']);
    
    Route::get('/audit-logs/modules', [AuditLogController::class, 'modules']);
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);
    Route::get('/members', [MemberController::class, 'index']);
    Route::get('/members/{id}', [MemberController::class, 'show']);
    Route::get('/payments', [PaymentController::class, 'indexOwner']);
    Route::get('/attendances', [AttendanceController::class, 'indexOwner']);
    
    // Export Laporan Excel
    Route::get('/export/members', [\App\Http\Controllers\ExportController::class, 'exportMembers']);
    Route::get('/export/transactions', [\App\Http\Controllers\ExportController::class, 'exportTransactions']);
    Route::get('/export/attendances', [\App\Http\Controllers\ExportController::class, 'exportAttendances']);
});

// Admin & Owner Shared Routes
Route::middleware(['auth:sanctum', 'role:admin,owner'])->prefix('admin')->group(function () {
    Route::get('/members', [MemberController::class, 'index']);
    Route::get('/members/{id}', [MemberController::class, 'show']);
    Route::post('/members/{id}', [MemberController::class, 'update']);
    Route::patch('/members/{id}/toggle-active', [MemberController::class, 'toggleActive']);

    Route::get('/packages', [PackageController::class, 'index']);
    Route::post('/packages', [PackageController::class, 'store']);
    Route::put('/packages/{id}', [PackageController::class, 'update']);
    Route::patch('/packages/{id}/toggle-active', [PackageController::class, 'toggleActive']);

    Route::post('/settings/guest-price', [SettingController::class, 'updateGuestPrice']);
});

// Admin-only routes
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'getAdminDashboard']);

    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'indexAdmin']);
        Route::post('/{id}/confirm', [PaymentController::class, 'confirm']);
        Route::post('/{id}/cancel', [PaymentController::class, 'cancel']);
    });

    Route::get('/attendances', [AttendanceController::class, 'indexAdmin']);
    Route::get('/checkin/search', [AttendanceController::class, 'searchMemberCheckin']);
    Route::post('/checkin/confirm', [AttendanceController::class, 'storeMemberCheckin']);
    
    Route::post('/guests/checkin', [GuestController::class, 'checkin']);
});
