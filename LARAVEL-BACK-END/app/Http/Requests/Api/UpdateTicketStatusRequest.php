<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketStatusRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            // Personnel can only move tasks to these two states.
            // Pending / Under Review / Rejected are admin-only transitions.
            'status'     => ['required', 'in:In Progress,Completed'],
            'field_note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
