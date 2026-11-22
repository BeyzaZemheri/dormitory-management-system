package com.beyza.dormitory.dto;

import com.beyza.dormitory.entity.User;
import com.beyza.dormitory.enums.Role;

public record StudentResponseDTO(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        Role role,
        boolean active
) {
    public static StudentResponseDTO from(User user) {
        return new StudentResponseDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole(),
                user.isActive()
        );
    }
}