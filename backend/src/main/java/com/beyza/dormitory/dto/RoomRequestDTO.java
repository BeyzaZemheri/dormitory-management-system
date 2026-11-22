package com.beyza.dormitory.dto;

import com.beyza.dormitory.enums.RoomStatus;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RoomRequestDTO(

        @NotBlank(message = "Room number is required")
        @Size(max = 30, message = "Room number cannot exceed 30 characters")
        String roomNumber,

        @NotNull(message = "Capacity is required")
        @Min(value = 1, message = "Capacity must be at least 1")
        Integer capacity,

        RoomStatus status

) {
}