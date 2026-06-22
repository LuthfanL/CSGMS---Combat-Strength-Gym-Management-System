<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$key = env('GEMINI_API_KEY');
$models = ['gemini-2.5-computer-use-preview-10-2025', 'deep-research-preview-04-2026', 'gemini-robotics-er-1.6-preview', 'antigravity-preview-05-2026'];
foreach($models as $m) {
    $res = Illuminate\Support\Facades\Http::post('https://generativelanguage.googleapis.com/v1beta/models/' . $m . ':generateContent?key=' . $key, [
        'contents'=>[['parts'=>[['text'=>'hi']]]]
    ]);
    echo $m . ': ' . $res->status() . "\n";
}
