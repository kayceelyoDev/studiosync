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
        Schema::table('projects', function (Blueprint $table) {
            $table->string('vercel_project_id')->nullable()->after('project_url');
            $table->string('vercel_project_name')->nullable()->after('vercel_project_id');
            $table->string('deployment_status')->default('not_deployed')->after('vercel_project_name');
            $table->timestamp('deployed_at')->nullable()->after('deployment_status');
            $table->string('content_hash', 64)->nullable()->after('deployed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'vercel_project_id',
                'vercel_project_name',
                'deployment_status',
                'deployed_at',
                'content_hash',
            ]);
        });
    }
};
