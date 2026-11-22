package com.beyza.dormitory.service;

import com.beyza.dormitory.dto.RoomAssignmentRequestDTO;
import com.beyza.dormitory.entity.Room;
import com.beyza.dormitory.entity.RoomAssignment;
import com.beyza.dormitory.entity.User;
import com.beyza.dormitory.enums.Role;
import com.beyza.dormitory.enums.RoomStatus;
import com.beyza.dormitory.repository.RoomAssignmentRepository;
import com.beyza.dormitory.repository.RoomRepository;
import com.beyza.dormitory.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomAssignmentServiceTest {

    @Mock
    private RoomAssignmentRepository assignmentRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RoomAssignmentService roomAssignmentService;

    private User student;
    private Room room;
    private RoomAssignmentRequestDTO request;

    @BeforeEach
    void setUp() {

        student = new User();
        student.setId(1L);
        student.setFirstName("Beyza");
        student.setRole(Role.STUDENT);
        student.setActive(true);

        room = new Room();
        room.setId(10L);
        room.setRoomNumber("101");
        room.setCapacity(2);
        room.setStatus(RoomStatus.AVAILABLE);

        request = new RoomAssignmentRequestDTO(1L, 10L);
    }

    // TEST 1: Student already has an active room
    @Test
    void assignStudent_ShouldThrowException_WhenStudentAlreadyHasRoom() {

        RoomAssignment existingAssignment = new RoomAssignment();
        existingAssignment.setStudent(student);
        existingAssignment.setRoom(room);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(student));

        when(roomRepository.findByIdForUpdate(10L))
                .thenReturn(Optional.of(room));

        when(assignmentRepository.findActiveByStudentId(1L))
                .thenReturn(Optional.of(existingAssignment));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> roomAssignmentService.assignStudent(request)
        );

        assertEquals(
                "Student already has an active room assignment.",
                exception.getMessage()
        );

        verify(assignmentRepository, never()).saveAndFlush(any());
    }

    // TEST 2: Room is full
    @Test
    void assignStudent_ShouldThrowException_WhenRoomIsFull() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(student));

        when(roomRepository.findByIdForUpdate(10L))
                .thenReturn(Optional.of(room));

        when(assignmentRepository.findActiveByStudentId(1L))
                .thenReturn(Optional.empty());

        when(assignmentRepository.countByRoomIdAndReleasedAtIsNull(10L))
                .thenReturn(2L);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> roomAssignmentService.assignStudent(request)
        );

        assertEquals(
                "Room is full. No available beds.",
                exception.getMessage()
        );

        verify(assignmentRepository, never()).saveAndFlush(any());
    }

    // TEST 3: Successful room assignment
    @Test
    void assignStudent_ShouldAssignStudent_WhenRoomHasAvailableBed() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(student));

        when(roomRepository.findByIdForUpdate(10L))
                .thenReturn(Optional.of(room));

        when(assignmentRepository.findActiveByStudentId(1L))
                .thenReturn(Optional.empty());

        when(assignmentRepository.countByRoomIdAndReleasedAtIsNull(10L))
                .thenReturn(0L, 1L);

        when(assignmentRepository.saveAndFlush(any(RoomAssignment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        roomAssignmentService.assignStudent(request);

        ArgumentCaptor<RoomAssignment> captor =
                ArgumentCaptor.forClass(RoomAssignment.class);

        verify(assignmentRepository).saveAndFlush(captor.capture());

        RoomAssignment savedAssignment = captor.getValue();

        assertSame(student, savedAssignment.getStudent());
        assertSame(room, savedAssignment.getRoom());

        assertNotNull(savedAssignment.getAssignedAt());
        assertNull(savedAssignment.getReleasedAt());
        assertTrue(savedAssignment.isActive());

        assertEquals(RoomStatus.AVAILABLE, room.getStatus());

        verify(roomRepository).save(room);
    }

    // TEST 4: Student has no active assignment to release
    @Test
    void releaseStudent_ShouldThrowException_WhenNoActiveAssignment() {

        when(assignmentRepository.findActiveByStudentId(1L))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> roomAssignmentService.releaseStudent(1L)
        );

        assertEquals(
                "Student has no active room assignment.",
                exception.getMessage()
        );

        verify(assignmentRepository, never()).save(any());
    }

    // TEST 5: Successful room release
    @Test
    void releaseStudent_ShouldReleaseStudent_WhenAssignmentExists() {

        RoomAssignment assignment = new RoomAssignment();
        assignment.setStudent(student);
        assignment.setRoom(room);
        assignment.setAssignedAt(LocalDateTime.now());

        when(assignmentRepository.findActiveByStudentId(1L))
                .thenReturn(Optional.of(assignment));

        when(roomRepository.findByIdForUpdate(10L))
                .thenReturn(Optional.of(room));

        when(assignmentRepository.save(assignment))
                .thenReturn(assignment);

        when(assignmentRepository.countByRoomIdAndReleasedAtIsNull(10L))
                .thenReturn(0L);

        roomAssignmentService.releaseStudent(1L);

        assertNotNull(assignment.getReleasedAt());
        assertFalse(assignment.isActive());

        assertEquals(RoomStatus.AVAILABLE, room.getStatus());

        verify(assignmentRepository).save(assignment);
        verify(roomRepository).save(room);
    }

    // TEST 6: Student cannot transfer to the same room
    @Test
    void transferStudent_ShouldThrowException_WhenSameRoom() {

        RoomAssignment assignment = new RoomAssignment();
        assignment.setStudent(student);
        assignment.setRoom(room);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(student));

        when(assignmentRepository.findActiveByStudentId(1L))
                .thenReturn(Optional.of(assignment));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> roomAssignmentService.transferStudent(request)
        );

        assertEquals(
                "Student is already assigned to this room.",
                exception.getMessage()
        );

        verify(assignmentRepository, never()).save(any());
    }

    // TEST 7: Student has no active assignment to transfer
    @Test
    void transferStudent_ShouldThrowException_WhenNoActiveAssignment() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(student));

        when(assignmentRepository.findActiveByStudentId(1L))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> roomAssignmentService.transferStudent(request)
        );

        assertEquals(
                "Student has no active room assignment.",
                exception.getMessage()
        );

        verify(assignmentRepository, never()).save(any());
    }

    // TEST 8: Destination room is full
    @Test
    void transferStudent_ShouldThrowException_WhenNewRoomIsFull() {

        Room oldRoom = new Room();
        oldRoom.setId(5L);
        oldRoom.setRoomNumber("105");
        oldRoom.setCapacity(2);
        oldRoom.setStatus(RoomStatus.AVAILABLE);

        RoomAssignment currentAssignment = new RoomAssignment();
        currentAssignment.setStudent(student);
        currentAssignment.setRoom(oldRoom);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(student));

        when(assignmentRepository.findActiveByStudentId(1L))
                .thenReturn(Optional.of(currentAssignment));

        when(roomRepository.findByIdForUpdate(5L))
                .thenReturn(Optional.of(oldRoom));

        when(roomRepository.findByIdForUpdate(10L))
                .thenReturn(Optional.of(room));

        when(assignmentRepository.countByRoomIdAndReleasedAtIsNull(10L))
                .thenReturn(2L);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> roomAssignmentService.transferStudent(request)
        );

        assertEquals(
                "Room is full. No available beds.",
                exception.getMessage()
        );

        assertNull(currentAssignment.getReleasedAt());

        verify(assignmentRepository, never()).saveAndFlush(any());
    }

    // TEST 9: Successful room transfer
    @Test
    void transferStudent_ShouldTransferStudent_WhenNewRoomHasSpace() {

        Room oldRoom = new Room();
        oldRoom.setId(5L);
        oldRoom.setRoomNumber("105");
        oldRoom.setCapacity(2);
        oldRoom.setStatus(RoomStatus.AVAILABLE);

        RoomAssignment currentAssignment = new RoomAssignment();
        currentAssignment.setStudent(student);
        currentAssignment.setRoom(oldRoom);
        currentAssignment.setAssignedAt(LocalDateTime.now());

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(student));

        when(assignmentRepository.findActiveByStudentId(1L))
                .thenReturn(Optional.of(currentAssignment));

        when(roomRepository.findByIdForUpdate(5L))
                .thenReturn(Optional.of(oldRoom));

        when(roomRepository.findByIdForUpdate(10L))
                .thenReturn(Optional.of(room));

        when(assignmentRepository.countByRoomIdAndReleasedAtIsNull(10L))
                .thenReturn(0L, 1L);

        when(assignmentRepository.countByRoomIdAndReleasedAtIsNull(5L))
                .thenReturn(0L);

        when(assignmentRepository.saveAndFlush(currentAssignment))
                .thenReturn(currentAssignment);

        when(assignmentRepository.save(any(RoomAssignment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        roomAssignmentService.transferStudent(request);

        assertNotNull(currentAssignment.getReleasedAt());
        assertFalse(currentAssignment.isActive());

        ArgumentCaptor<RoomAssignment> captor =
                ArgumentCaptor.forClass(RoomAssignment.class);

        verify(assignmentRepository).save(captor.capture());

        RoomAssignment newAssignment = captor.getValue();

        assertSame(student, newAssignment.getStudent());
        assertSame(room, newAssignment.getRoom());

        assertNotNull(newAssignment.getAssignedAt());
        assertNull(newAssignment.getReleasedAt());

        assertTrue(newAssignment.isActive());

        verify(assignmentRepository).saveAndFlush(currentAssignment);

        verify(roomRepository).save(oldRoom);
        verify(roomRepository).save(room);
    }
}