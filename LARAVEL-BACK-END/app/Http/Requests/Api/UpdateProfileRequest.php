<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'string', 'max:100', 'regex:/^[\pL\s\-]+$/u'],
            'last_name'  => ['sometimes', 'string', 'max:100', 'regex:/^[\pL\s\-]+$/u'],
            'email'      => ['sometimes', 'email:rfc', 'max:255', 'unique:users,email,' . $this->user()->id],
            'phone'      => ['nullable', 'string', 'max:30', 'regex:/^[0-9\+\-\s\(\)]+$/'],
            'address'    => ['nullable', 'string', 'max:255'],
            'bio'        => ['nullable', 'string', 'max:500'],
            // Accept base64 data URI or HTTPS URL — validated by starts-with check
            'avatar'     => ['nullable', 'string', 'max:2097152'],
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.regex'     => 'Avatar must be a valid base64 image or HTTPS URL.',
            'phone.regex'      => 'Phone number may only contain digits, spaces, +, -, (, ).',
            'first_name.regex' => 'First name may only contain letters, spaces, and hyphens.',
            'last_name.regex'  => 'Last name may only contain letters, spaces, and hyphens.',
        ];
    }
}
