package com.clubservice.club_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ClubAlreadyExistsException.class)
    public ResponseEntity<?> handleClubAlreadyExists(ClubAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409 Conflict
                .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(ClubNotFoundException.class)
    public ResponseEntity<?> handleClubNotFound(ClubNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)    // 404
                .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(ClubOperationException.class)
    public ResponseEntity<?> handleClubOperationException(ClubOperationException ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(ex.getMessage()));
    }



    // Simple DTO for error body
    record ErrorResponse(String message) {}
}
