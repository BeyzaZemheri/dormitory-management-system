package com.beyza.dormitory.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beyza.dormitory.dto.LoginRequest;
import com.beyza.dormitory.dto.RegisterRequest;
import com.beyza.dormitory.service.AuthService;
import jakarta.validation.Valid;
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
     @PostMapping("/register")
public void register(@Valid @RequestBody RegisterRequest request) {
    authService.register(request);
}
   
  @PostMapping("/login")
public String login(@RequestBody LoginRequest request) {
    System.out.println("LOGIN ENDPOINT CALISTI");
    return authService.login(request);
}
}