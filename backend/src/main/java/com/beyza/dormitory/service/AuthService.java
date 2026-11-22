package com.beyza.dormitory.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.beyza.dormitory.dto.LoginRequest;
import com.beyza.dormitory.dto.RegisterRequest;
import com.beyza.dormitory.entity.User;
import com.beyza.dormitory.enums.Role;
import com.beyza.dormitory.repository.UserRepository;
import com.beyza.dormitory.security.JwtService;

@Service
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public void register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setBirthDate(request.getBirthDate());
        user.setIdentityNumber(request.getIdentityNumber());
        user.setRole(Role.STUDENT);
        user.setActive(true);

        userRepository.save(user);
    }

    public String login(LoginRequest request) {

        Optional<User> user = userRepository.findByEmail(request.getEmail());

        if (user.isEmpty()) {
            throw new RuntimeException("Incorrect email or password.");
        }

        User foundUser = user.get();

        // Check whether the account is active
        if (!foundUser.isActive()) {
            throw new RuntimeException("Incorrect email or password.");
        }

        // Verify password
        if (!passwordEncoder.matches(
                request.getPassword(),
                foundUser.getPassword())) {

            throw new RuntimeException("Incorrect email or password.");
        }

        // Generate JWT token
        return jwtService.generateToken(foundUser);
    }
}