package com.independent.independent_services.repository;

import com.independent.independent_services.model.EventEnrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EventEnrollmentRepository extends MongoRepository<EventEnrollment, String> {
}
