package com.beyza.dormitory.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beyza.dormitory.entity.RoomAssignment;

import jakarta.persistence.LockModeType;

public interface RoomAssignmentRepository
        extends JpaRepository<RoomAssignment, Long> {

    // Find the student's current room assignment
    @Query("""
        SELECT a FROM RoomAssignment a
        JOIN FETCH a.student
        JOIN FETCH a.room
        WHERE a.student.id = :studentId
        AND a.releasedAt IS NULL
    """)
    Optional<RoomAssignment> findActiveByStudentId(
            @Param("studentId") Long studentId
    );

    // Count occupied beds in a room
    long countByRoomIdAndReleasedAtIsNull(Long roomId);

    // Check whether a room has active assignments
    boolean existsByRoomIdAndReleasedAtIsNull(Long roomId);
    boolean existsByRoomId(Long roomId);

    // Get the student's complete room history
    @Query("""
        SELECT a FROM RoomAssignment a
        JOIN FETCH a.room
        WHERE a.student.id = :studentId
        ORDER BY a.assignedAt DESC
    """)
    List<RoomAssignment> findHistoryByStudentId(
            @Param("studentId") Long studentId
    );

    // Get all active assignments with student and room details
    @Query("""
        SELECT a FROM RoomAssignment a
        JOIN FETCH a.student
        JOIN FETCH a.room
        WHERE a.releasedAt IS NULL
        ORDER BY a.assignedAt DESC
    """)
    List<RoomAssignment> findAllActiveAssignments();
}