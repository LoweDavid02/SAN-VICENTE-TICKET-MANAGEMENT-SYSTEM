<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SubmitTicketRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:10'],
            'category'    => ['required', 'string', 'max:100'],
            'location'    => ['required', 'string', 'max:255'],
            'severity'    => ['required', 'in:Low,Medium,High'],
            'images'      => ['nullable', 'array', 'max:5'],
            'images.*'    => ['nullable', 'string'],
        ];
    }
}
