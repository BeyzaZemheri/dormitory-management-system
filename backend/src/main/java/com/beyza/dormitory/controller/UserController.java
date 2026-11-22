package com.beyza.dormitory.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.beyza.dormitory.dto.StudentCreateRequestDTO;
import com.beyza.dormitory.dto.StudentUpdateRequestDTO;
import com.beyza.dormitory.dto.StudentResponseDTO;
import com.beyza.dormitory.entity.User;
import com.beyza.dormitory.repository.UserRepository;
import com.beyza.dormitory.service.UserService;

@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(
            UserService userService,
            UserRepository userRepository) {

        this.userService = userService;
        this.userRepository = userRepository;
    }

    // Giriş yapan kullanıcının bilgileri
    @GetMapping("/me")
    public StudentResponseDTO getMyProfile(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));

        return StudentResponseDTO.from(user);
    }

    // Öğrencileri listele
    @GetMapping("/students")
    public List<StudentResponseDTO> getAllStudents() {

        return userService.getAllStudents()
                .stream()
                .map(StudentResponseDTO::from)
                .toList();
    }

    // Yeni öğrenci ekle
    @PostMapping("/students")
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponseDTO addStudent(
            @Valid @RequestBody StudentCreateRequestDTO request) {

        User savedStudent = userService.addStudent(request);

        return StudentResponseDTO.from(savedStudent);
    }

    // Öğrenci bilgilerini güncelle
    @PutMapping("/students/{id}")
    public StudentResponseDTO updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentUpdateRequestDTO request) {

        User updatedStudent = userService.updateStudent(id, request);

        return StudentResponseDTO.from(updatedStudent);
    }

    // Öğrenciyi pasife al
    @PatchMapping("/students/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateStudent(@PathVariable Long id) {

        userService.deactivateStudent(id);
    }
}