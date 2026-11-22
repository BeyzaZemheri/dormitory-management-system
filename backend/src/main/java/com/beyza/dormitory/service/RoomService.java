package com.beyza.dormitory.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.beyza.dormitory.dto.RoomRequestDTO;
import com.beyza.dormitory.entity.Room;
import com.beyza.dormitory.enums.RoomStatus;
import com.beyza.dormitory.repository.RoomAssignmentRepository;
import com.beyza.dormitory.repository.RoomRepository;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomAssignmentRepository assignmentRepository;

    public RoomService(
            RoomRepository roomRepository,
            RoomAssignmentRepository assignmentRepository) {

        this.roomRepository = roomRepository;
        this.assignmentRepository = assignmentRepository;
    }

    // GET ALL ROOMS
    @Transactional(readOnly = true)
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    // ADD ROOM
    @Transactional
    public Room addRoom(RoomRequestDTO request) {

        String roomNumber = request.roomNumber().trim();

        if (roomRepository.existsByRoomNumber(roomNumber)) {
            throw new IllegalArgumentException(
                    "Room number already exists.");
        }

        Room newRoom = new Room();

        newRoom.setRoomNumber(roomNumber);
        newRoom.setCapacity(request.capacity());
        newRoom.setStatus(RoomStatus.AVAILABLE);

        return roomRepository.save(newRoom);
    }

    // UPDATE ROOM
    @Transactional
    public Room updateRoom(Long id, RoomRequestDTO request) {

        Room room = roomRepository.findByIdForUpdate(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Room not found."));

        String roomNumber = request.roomNumber().trim();

        if (!room.getRoomNumber().equals(roomNumber)
                && roomRepository.existsByRoomNumber(roomNumber)) {

            throw new IllegalArgumentException(
                    "Room number already exists.");
        }

        long occupiedBeds = assignmentRepository
                .countByRoomIdAndReleasedAtIsNull(id);

        if (request.capacity() < occupiedBeds) {
            throw new IllegalArgumentException(
                    "Room capacity cannot be lower than current occupancy.");
        }

        room.setRoomNumber(roomNumber);
        room.setCapacity(request.capacity());

        // FULL status is calculated automatically.
        // Administrators can only choose MAINTENANCE or AVAILABLE.
        if (request.status() == RoomStatus.MAINTENANCE) {
            room.setStatus(RoomStatus.MAINTENANCE);
        } else if (occupiedBeds >= room.getCapacity()) {
            room.setStatus(RoomStatus.FULL);
        } else {
            room.setStatus(RoomStatus.AVAILABLE);
        }

        return roomRepository.save(room);
    }

    // DELETE ROOM
    @Transactional
    public void deleteRoom(Long id) {

        Room room = roomRepository.findByIdForUpdate(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Room not found."));

        if (assignmentRepository.existsByRoomIdAndReleasedAtIsNull(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete a room with active assignments.");
        }

        if (assignmentRepository.existsByRoomId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete a room with assignment history.");
        }

        roomRepository.delete(room);
    }
}