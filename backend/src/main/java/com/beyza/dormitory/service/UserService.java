package com.beyza.dormitory.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.beyza.dormitory.dto.StudentCreateRequestDTO;
import com.beyza.dormitory.dto.StudentUpdateRequestDTO;
import com.beyza.dormitory.entity.User;
import com.beyza.dormitory.enums.Role;
import com.beyza.dormitory.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Öğrencileri listele
    public List<User> getAllStudents() {
        return userRepository.findByRole(Role.STUDENT);
    }

    // Yeni öğrenci ekle
    public User addStudent(StudentCreateRequestDTO request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists!");
        }

        User student = new User();

        student.setFirstName(request.firstName());
        student.setLastName(request.lastName());
        student.setEmail(request.email());
        student.setPhoneNumber(request.phoneNumber());
        student.setBirthDate(request.birthDate());
        student.setIdentityNumber(request.identityNumber());

        student.setPassword(
                passwordEncoder.encode(request.password())
        );

        student.setRole(Role.STUDENT);
        student.setActive(true);

        return userRepository.save(student);
    }

    // Öğrenci bilgilerini güncelle
    public User updateStudent(
            Long id,
            StudentUpdateRequestDTO request) {

        User student = userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student not found!"));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("User is not a student!");
        }

        student.setFirstName(request.firstName());
        student.setLastName(request.lastName());
        student.setPhoneNumber(request.phoneNumber());

        return userRepository.save(student);
    }

    // Öğrenciyi pasife al
    public void deactivateStudent(Long id) {

        User student = userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student not found!"));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("User is not a student!");
        }

        student.setActive(false);

        userRepository.save(student);
    }
}