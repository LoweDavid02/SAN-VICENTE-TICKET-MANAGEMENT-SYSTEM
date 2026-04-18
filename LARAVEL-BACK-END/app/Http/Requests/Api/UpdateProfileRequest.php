<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name'  => ['sometimes', 'string', 'max:100'],
            'email'      => ['sometimes', 'email', 'unique:users,email,' . $this->user()->id],
            'phone'      => ['nullable', 'string', 'max:30'],
            'address'    => ['nullable', 'string', 'max:255'],
            'bio'        => ['nullable', 'string', 'max:500'],
            'avatar'     => ['nullable', 'string'], // base64 or URL
        ];
    }
}
