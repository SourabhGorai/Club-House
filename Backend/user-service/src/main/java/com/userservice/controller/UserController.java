package com.userservice.controller;


import com.userservice.dto.UserDto;
import com.userservice.dto.UserUpdateDto;
import com.userservice.service.UserService;
import jakarta.ws.rs.NotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users/    -> list all users
    @GetMapping("/")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /api/users/{id}
    @GetMapping("/{prn}")
    public ResponseEntity<UserDto> getUser(@PathVariable String prn) {
        UserDto dto = userService.getUserByPrn(prn);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    // PUT /api/users/{id} -> update (password/email/role optional)
    @PutMapping("/{prn}")
    public ResponseEntity<UserDto> updateUser(@PathVariable String prn, @RequestBody UserUpdateDto dto) {
        try {
            UserDto updated = userService.updateUser(prn, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/users/{id}
    @Transactional
    @DeleteMapping("/{prn}")
    public ResponseEntity<?> deleteUser(@PathVariable String prn) {
        try {
            userService.deleteUser(prn);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/validate/{prn}")
    public Boolean validateUser(@PathVariable String prn){
        try{
            return userService.validate(prn);
        }catch(NotFoundException e){
            log.info("User with PRN {} does not exist", prn);
            return false;
        }
    }
}
