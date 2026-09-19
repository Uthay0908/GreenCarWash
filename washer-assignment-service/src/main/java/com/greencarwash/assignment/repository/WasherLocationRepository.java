package com.greencarwash.assignment.repository;

import com.greencarwash.assignment.entity.WasherLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WasherLocationRepository extends JpaRepository<WasherLocation, String> {
    List<WasherLocation> findByIsOnlineTrue();
}
