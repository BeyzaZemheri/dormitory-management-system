package com.beyza.dormitory.dto;

public record RoomAssignmentRequestDTO(
        Long studentId,
        Long roomId
) {
}