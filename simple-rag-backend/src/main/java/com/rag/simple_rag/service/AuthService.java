package com.rag.simple_rag.service;

import com.rag.simple_rag.dto.LoginRequest;
import com.rag.simple_rag.dto.SignupRequest;
import com.rag.simple_rag.dto.UserDto;
import com.rag.simple_rag.entity.Role;
import com.rag.simple_rag.entity.User;
import com.rag.simple_rag.repository.UserRepository;
import com.rag.simple_rag.security.JwtService;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public void registerUser(SignupRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        userRepository.save(user);
    }

    public String loginUser(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        return jwtService.generateToken(request.getEmail());
    }

    public UserDto getCurrentUser(User user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
