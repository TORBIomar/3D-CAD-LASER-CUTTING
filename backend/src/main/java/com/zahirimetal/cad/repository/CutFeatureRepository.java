package com.zahirimetal.cad.repository;

import com.zahirimetal.cad.entity.CutFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CutFeatureRepository extends JpaRepository<CutFeature, UUID> {
}
