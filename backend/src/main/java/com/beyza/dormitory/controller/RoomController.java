package com.beyza.dormitory.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.beyza.dormitory.dto.RoomRequestDTO;
import com.beyza.dormitory.entity.Room;
import com.beyza.dormitory.service.RoomService;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // Get all rooms
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    // Add a new room
    @PostMapping
    public ResponseEntity<Room> addRoom(
            @Valid @RequestBody RoomRequestDTO request) {

        Room createdRoom = roomService.addRoom(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdRoom);
    }

    // Update an existing room
    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequestDTO request) {

        return ResponseEntity.ok(
                roomService.updateRoom(id, request)
        );
    }

    // Delete a room
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {

        roomService.deleteRoom(id);

        return ResponseEntity.noContent().build();
    }
}