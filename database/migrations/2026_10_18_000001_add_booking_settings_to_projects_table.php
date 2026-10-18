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
            $table->boolean('booking_enabled')->default(false)->after('content_hash');
            $table->string('booking_public_token')->nullable()->unique()->after('booking_enabled');
            $table->string('booking_notification_email')->nullable()->after('booking_public_token');
            $table->json('booking_settings')->nullable()->after('booking_notification_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'booking_enabled',
                'booking_public_token',
                'booking_notification_email',
                'booking_settings',
            ]);
        });
    }
};
