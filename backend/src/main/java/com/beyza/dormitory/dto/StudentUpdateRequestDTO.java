package com.beyza.dormitory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record StudentUpdateRequestDTO(

        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @NotBlank(message = "Phone number is required")
        @Pattern(
                regexp = "^[0-9+() -]{10,20}$",
                message = "Please enter a valid phone number"
        )
        String phoneNumber

) {
}