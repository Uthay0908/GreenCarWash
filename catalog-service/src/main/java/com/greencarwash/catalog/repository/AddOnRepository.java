package com.greencarwash.catalog.repository;

import com.greencarwash.catalog.entity.AddOn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddOnRepository extends JpaRepository<AddOn, String> {
    List<AddOn> findByActiveTrue();
}
