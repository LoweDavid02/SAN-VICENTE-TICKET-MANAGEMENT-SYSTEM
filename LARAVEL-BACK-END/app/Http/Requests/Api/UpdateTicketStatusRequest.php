<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketStatusRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status'     => ['required', 'in:Pending,Under Review,In Progress,Completed,Rejected'],
            'field_note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
