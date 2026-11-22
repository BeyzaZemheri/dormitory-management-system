package com.beyza.dormitory.service;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.beyza.dormitory.dto.RoomAssignmentRequestDTO;
import com.beyza.dormitory.dto.RoomAssignmentResponseDTO;
import com.beyza.dormitory.entity.Room;
import com.beyza.dormitory.entity.RoomAssignment;
import com.beyza.dormitory.entity.User;
import com.beyza.dormitory.enums.Role;
import com.beyza.dormitory.enums.RoomStatus;
import com.beyza.dormitory.repository.RoomAssignmentRepository;
import com.beyza.dormitory.repository.RoomRepository;
import com.beyza.dormitory.repository.UserRepository;

@Service
public class RoomAssignmentService {

    private final RoomAssignmentRepository assignmentRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public RoomAssignmentService(
            RoomAssignmentRepository assignmentRepository,
            RoomRepository roomRepository,
            UserRepository userRepository) {

        this.assignmentRepository = assignmentRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    // --------------------------------------------------
    // 1. ASSIGN STUDENT TO ROOM
    // --------------------------------------------------

    @Transactional
    public RoomAssignmentResponseDTO assignStudent(
            RoomAssignmentRequestDTO request) {

        validateRequest(request);

        User student = findEligibleStudent(request.studentId());

        Room room = findAndLockRoom(request.roomId());

        validateRoomAvailability(room);

        if (assignmentRepository.findActiveByStudentId(student.getId()).isPresent()) {
            throw new IllegalArgumentException(
                    "Student already has an active room assignment.");
        }

        validateRoomCapacity(room);

        RoomAssignment assignment = new RoomAssignment();

        assignment.setStudent(student);
        assignment.setRoom(room);
        assignment.setAssignedAt(LocalDateTime.now());

       RoomAssignment savedAssignment = assignmentRepository.saveAndFlush(assignment);

        updateRoomStatus(room);

        return RoomAssignmentResponseDTO.from(savedAssignment);
    }

    // --------------------------------------------------
    // 2. RELEASE STUDENT FROM ROOM
    // --------------------------------------------------

    @Transactional
    public RoomAssignmentResponseDTO releaseStudent(Long studentId) {

        if (studentId == null) {
            throw new IllegalArgumentException("Student ID is required.");
        }

        // Read the current assignment to identify its room.
        RoomAssignment currentAssignment = assignmentRepository
                .findActiveByStudentId(studentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student has no active room assignment."));

        // Lock the room before changing its occupancy.
        Room room = findAndLockRoom(currentAssignment.getRoom().getId());

        // Recheck after obtaining the room lock.
        RoomAssignment assignment = assignmentRepository
                .findActiveByStudentId(studentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student has no active room assignment."));

        if (!assignment.getRoom().getId().equals(room.getId())) {
            throw new IllegalStateException(
                    "Room assignment changed during the operation. Please retry.");
        }

        assignment.setReleasedAt(LocalDateTime.now());

        RoomAssignment savedAssignment = assignmentRepository.save(assignment);

        updateRoomStatus(room);

        return RoomAssignmentResponseDTO.from(savedAssignment);
    }

    // --------------------------------------------------
    // 3. TRANSFER STUDENT TO ANOTHER ROOM
    // --------------------------------------------------

    @Transactional
    public RoomAssignmentResponseDTO transferStudent(
            RoomAssignmentRequestDTO request) {

        validateRequest(request);

        User student = findEligibleStudent(request.studentId());

        RoomAssignment currentAssignment = assignmentRepository
                .findActiveByStudentId(student.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student has no active room assignment."));

        Long oldRoomId = currentAssignment.getRoom().getId();
        Long newRoomId = request.roomId();

        if (oldRoomId.equals(newRoomId)) {
            throw new IllegalArgumentException(
                    "Student is already assigned to this room.");
        }

        // Lock both rooms in a consistent order to reduce deadlock risk.
        Long firstRoomId = Math.min(oldRoomId, newRoomId);
        Long secondRoomId = Math.max(oldRoomId, newRoomId);

        Room firstRoom = findAndLockRoom(firstRoomId);
        Room secondRoom = findAndLockRoom(secondRoomId);

        Room oldRoom = oldRoomId.equals(firstRoomId)
                ? firstRoom : secondRoom;

        Room newRoom = newRoomId.equals(firstRoomId)
                ? firstRoom : secondRoom;

        // Recheck the active assignment after acquiring the locks.
        RoomAssignment activeAssignment = assignmentRepository
                .findActiveByStudentId(student.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student has no active room assignment."));

        if (!activeAssignment.getRoom().getId().equals(oldRoomId)) {
            throw new IllegalStateException(
                    "Student's room changed during the operation. Please retry.");
        }

        validateRoomAvailability(newRoom);
        validateRoomCapacity(newRoom);

        LocalDateTime transferTime = LocalDateTime.now();

        // Close the old assignment without deleting its history.
        activeAssignment.setReleasedAt(transferTime);
        assignmentRepository.saveAndFlush(activeAssignment);

        // Create the new active assignment.
        RoomAssignment newAssignment = new RoomAssignment();
        newAssignment.setStudent(student);
        newAssignment.setRoom(newRoom);
        newAssignment.setAssignedAt(transferTime);

        RoomAssignment savedAssignment = assignmentRepository.save(newAssignment);

        updateRoomStatus(oldRoom);
        updateRoomStatus(newRoom);

        return RoomAssignmentResponseDTO.from(savedAssignment);
    }

    // --------------------------------------------------
    // 4. GET ALL ACTIVE ASSIGNMENTS
    // --------------------------------------------------

    @Transactional(readOnly = true)
    public List<RoomAssignmentResponseDTO> getAllActiveAssignments() {

        return assignmentRepository.findAllActiveAssignments()
                .stream()
                .map(RoomAssignmentResponseDTO::from)
                .toList();
    }

    // --------------------------------------------------
    // 5. GET STUDENT'S ROOM HISTORY
    // --------------------------------------------------

    @Transactional(readOnly = true)
    public List<RoomAssignmentResponseDTO> getStudentHistory(Long studentId) {

        if (studentId == null) {
            throw new IllegalArgumentException("Student ID is required.");
        }

        if (!userRepository.existsById(studentId)) {
            throw new IllegalArgumentException("Student not found.");
        }

        return assignmentRepository.findHistoryByStudentId(studentId)
                .stream()
                .map(RoomAssignmentResponseDTO::from)
                .toList();
    }
    // Get the logged-in student's active room assignment
@Transactional(readOnly = true)
public Optional<RoomAssignmentResponseDTO> getMyRoom(String email) {

    User student = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new IllegalArgumentException("User not found."));

    if (student.getRole() != Role.STUDENT) {
        throw new IllegalArgumentException(
                "Only students can access this endpoint.");
    }

    return assignmentRepository
            .findActiveByStudentId(student.getId())
            .map(RoomAssignmentResponseDTO::from);
}

    // --------------------------------------------------
    // HELPER METHODS
    // --------------------------------------------------

    private void validateRequest(RoomAssignmentRequestDTO request) {

        if (request == null
                || request.studentId() == null
                || request.roomId() == null) {

            throw new IllegalArgumentException(
                    "Student ID and Room ID are required.");
        }
    }

    private User findEligibleStudent(Long studentId) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student not found."));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException(
                    "Only students can be assigned to rooms.");
        }

        if (!student.isActive()) {
            throw new IllegalArgumentException(
                    "Inactive students cannot be assigned to rooms.");
        }

        return student;
    }

    private Room findAndLockRoom(Long roomId) {

        return roomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Room not found."));
    }

    private void validateRoomAvailability(Room room) {

        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            throw new IllegalArgumentException(
                    "Students cannot be assigned to rooms under maintenance.");
        }
    }

    private void validateRoomCapacity(Room room) {

        long occupiedBeds = assignmentRepository
                .countByRoomIdAndReleasedAtIsNull(room.getId());

        if (occupiedBeds >= room.getCapacity()) {
            throw new IllegalArgumentException(
                    "Room is full. No available beds.");
        }
    }

    private void updateRoomStatus(Room room) {

        // Maintenance status is managed manually by administrators.
        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            return;
        }

        long occupiedBeds = assignmentRepository
                .countByRoomIdAndReleasedAtIsNull(room.getId());

        if (occupiedBeds >= room.getCapacity()) {
            room.setStatus(RoomStatus.FULL);
        } else {
            room.setStatus(RoomStatus.AVAILABLE);
        }

        roomRepository.save(room);
    }
}