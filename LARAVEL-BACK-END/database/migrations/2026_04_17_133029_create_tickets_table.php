<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_id')->unique(); // e.g. SVR-001
            $table->string('title');
            $table->text('description');
            $table->string('category');
            $table->string('location');
            $table->enum('severity', ['Low', 'Medium', 'High'])->default('Medium');
            $table->enum('status', ['Pending', 'Under Review', 'In Progress', 'Completed', 'Rejected'])->default('Pending');
            $table->integer('progress')->default(10);
            $table->foreignId('resident_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->text('field_note')->nullable();
            $table->json('images')->nullable(); // array of file paths
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('ticket_timeline', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->string('status');
            $table->string('note')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_timeline');
        Schema::dropIfExists('tickets');
    }
};
