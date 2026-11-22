package com.beyza.dormitory.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import com.beyza.dormitory.dto.RoomAssignmentRequestDTO;
import com.beyza.dormitory.dto.RoomAssignmentResponseDTO;
import com.beyza.dormitory.service.RoomAssignmentService;

@RestController
@RequestMapping("/api/assignments")
public class RoomAssignmentController {

    private final RoomAssignmentService assignmentService;

    public RoomAssignmentController(
            RoomAssignmentService assignmentService) {

        this.assignmentService = assignmentService;
    }

    // Assign a student to a room
    @PostMapping
    public ResponseEntity<RoomAssignmentResponseDTO> assignStudent(
            @RequestBody RoomAssignmentRequestDTO request) {

        RoomAssignmentResponseDTO response =
                assignmentService.assignStudent(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Release a student from their current room
    @PutMapping("/release/{studentId}")
    public ResponseEntity<RoomAssignmentResponseDTO> releaseStudent(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                assignmentService.releaseStudent(studentId)
        );
    }
    // Get the logged-in student's room
@GetMapping("/me")
public ResponseEntity<RoomAssignmentResponseDTO> getMyRoom(
        Authentication authentication) {

    return assignmentService.getMyRoom(authentication.getName())
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.noContent().build());
}

    // Transfer a student to another room
    @PutMapping("/transfer")
    public ResponseEntity<RoomAssignmentResponseDTO> transferStudent(
            @RequestBody RoomAssignmentRequestDTO request) {

        return ResponseEntity.ok(
                assignmentService.transferStudent(request)
        );
    }

    // Get all active room assignments
    @GetMapping
    public ResponseEntity<List<RoomAssignmentResponseDTO>>
            getAllActiveAssignments() {

        return ResponseEntity.ok(
                assignmentService.getAllActiveAssignments()
        );
    }

    // Get a student's room assignment history
    @GetMapping("/history/{studentId}")
    public ResponseEntity<List<RoomAssignmentResponseDTO>>
            getStudentHistory(@PathVariable Long studentId) {

        return ResponseEntity.ok(
                assignmentService.getStudentHistory(studentId)
        );
    }
}