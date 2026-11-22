package com.beyza.dormitory.dto;

import java.time.LocalDateTime;

import com.beyza.dormitory.entity.RoomAssignment;

public record RoomAssignmentResponseDTO(
        Long id,
        Long studentId,
        String studentName,
        String studentEmail,
        Long roomId,
        String roomNumber,
        LocalDateTime assignedAt,
        LocalDateTime releasedAt,
        boolean active
) {

    public static RoomAssignmentResponseDTO from(RoomAssignment assignment) {

        return new RoomAssignmentResponseDTO(
                assignment.getId(),
                assignment.getStudent().getId(),
                assignment.getStudent().getFirstName() + " "
                        + assignment.getStudent().getLastName(),
                assignment.getStudent().getEmail(),
                assignment.getRoom().getId(),
                assignment.getRoom().getRoomNumber(),
                assignment.getAssignedAt(),
                assignment.getReleasedAt(),
                assignment.isActive()
        );
    }
}