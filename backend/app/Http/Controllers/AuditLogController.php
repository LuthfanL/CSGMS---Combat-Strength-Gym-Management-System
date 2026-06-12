<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Get list of audit logs for owner.
     * GET /api/owner/audit-logs
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('module', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
            });
        }

        if ($module = $request->input('module')) {
            $query->where('module', $module);
        }

        if ($startDate = $request->input('start_date')) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate = $request->input('end_date')) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $query->orderBy('created_at', 'desc');

        $logs = $query->paginate(15);

        return response()->json($logs);
    }

    /**
     * Get list of unique modules from audit logs.
     * GET /api/owner/audit-logs/modules
     */
    public function modules()
    {
        $modules = AuditLog::select('module')->distinct()->pluck('module');
        return response()->json($modules);
    }
}
