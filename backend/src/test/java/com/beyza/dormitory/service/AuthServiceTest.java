package com.beyza.dormitory.service;

import com.beyza.dormitory.dto.LoginRequest;
import com.beyza.dormitory.dto.RegisterRequest;
import com.beyza.dormitory.entity.User;
import com.beyza.dormitory.enums.Role;
import com.beyza.dormitory.repository.UserRepository;
import com.beyza.dormitory.security.JwtService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    // TEST 1: Duplicate email should be rejected
    @Test
    void register_ShouldThrowException_WhenEmailAlreadyExists() {

        RegisterRequest request = new RegisterRequest();
        request.setEmail("student@example.com");

        when(userRepository.existsByEmail("student@example.com"))
                .thenReturn(true);

        assertThrows(RuntimeException.class, () -> {
            authService.register(request);
        });

        verify(userRepository, never()).save(any());
    }

    // TEST 2: New student should be registered successfully
    @Test
    void register_ShouldSaveUser_WhenEmailDoesNotExist() {

        RegisterRequest request = new RegisterRequest();

        request.setFirstName("Beyza");
        request.setLastName("Test");
        request.setEmail("beyza@example.com");
        request.setPassword("123456");

        when(userRepository.existsByEmail("beyza@example.com"))
                .thenReturn(false);

        when(passwordEncoder.encode("123456"))
                .thenReturn("encodedPassword");

        authService.register(request);

        ArgumentCaptor<User> userCaptor =
                ArgumentCaptor.forClass(User.class);

        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();

        assertEquals("Beyza", savedUser.getFirstName());
        assertEquals("Test", savedUser.getLastName());
        assertEquals("beyza@example.com", savedUser.getEmail());
        assertEquals("encodedPassword", savedUser.getPassword());
        assertEquals(Role.STUDENT, savedUser.getRole());
        assertTrue(savedUser.isActive());

        verify(passwordEncoder).encode("123456");
    }

    // TEST 3: Login should fail when email does not exist
    @Test
    void login_ShouldThrowException_WhenEmailDoesNotExist() {

        LoginRequest request = new LoginRequest();
        request.setEmail("unknown@example.com");
        request.setPassword("123456");

        when(userRepository.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            authService.login(request);
        });

        verify(jwtService, never()).generateToken(any());
    }

    // TEST 4: Login should fail when password is incorrect
    @Test
    void login_ShouldThrowException_WhenPasswordIsIncorrect() {

        LoginRequest request = new LoginRequest();
        request.setEmail("beyza@example.com");
        request.setPassword("wrongPassword");

        User user = new User();
        user.setEmail("beyza@example.com");
        user.setPassword("encodedPassword");
        user.setActive(true);

        when(userRepository.findByEmail("beyza@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("wrongPassword", "encodedPassword"))
                .thenReturn(false);

        assertThrows(RuntimeException.class, () -> {
            authService.login(request);
        });

        verify(jwtService, never()).generateToken(any());
    }

    // TEST 5: Valid credentials should generate JWT
    @Test
    void login_ShouldReturnToken_WhenCredentialsAreCorrect() {

        LoginRequest request = new LoginRequest();
        request.setEmail("beyza@example.com");
        request.setPassword("123456");

        User user = new User();
        user.setEmail("beyza@example.com");
        user.setPassword("encodedPassword");
        user.setRole(Role.STUDENT);
        user.setActive(true);

        when(userRepository.findByEmail("beyza@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("123456", "encodedPassword"))
                .thenReturn(true);

        when(jwtService.generateToken(user))
                .thenReturn("fake-jwt-token");

        String token = authService.login(request);

        assertEquals("fake-jwt-token", token);

        verify(jwtService).generateToken(user);
    }

    // TEST 6: Inactive user should not be able to log in
    @Test
    void login_ShouldThrowException_WhenUserIsInactive() {

        LoginRequest request = new LoginRequest();
        request.setEmail("inactive@example.com");
        request.setPassword("123456");

        User user = new User();
        user.setEmail("inactive@example.com");
        user.setPassword("encodedPassword");
        user.setActive(false);

        when(userRepository.findByEmail("inactive@example.com"))
                .thenReturn(Optional.of(user));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.login(request)
        );

        assertEquals(
                "Incorrect email or password.",
                exception.getMessage()
        );

        verify(jwtService, never()).generateToken(any());
        verifyNoInteractions(passwordEncoder);
    }
}