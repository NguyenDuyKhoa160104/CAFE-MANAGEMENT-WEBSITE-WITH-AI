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
        Schema::table('admins', function (Blueprint $table) {
            $table->string('avatar_public_id')->nullable()->after('avatar');
        });
        Schema::table('staffs', function (Blueprint $table) {
            $table->string('avatar_public_id')->nullable()->after('avatar');
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->string('avatar_public_id')->nullable()->after('avatar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn('avatar_public_id');
        });
        Schema::table('staffs', function (Blueprint $table) {
            $table->dropColumn('avatar_public_id');
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('avatar_public_id');
        });
    }
};
