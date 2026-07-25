package com.zahirimetal.cad.service;

import com.zahirimetal.cad.dto.TubeProjectDto;

import java.util.List;
import java.util.UUID;

public interface ProjectService {
    TubeProjectDto saveProject(TubeProjectDto projectDto);
    TubeProjectDto getProjectById(UUID id);
    List<TubeProjectDto> getAllProjects();
    void deleteProject(UUID id);
}
