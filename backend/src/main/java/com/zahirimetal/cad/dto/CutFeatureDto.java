package com.zahirimetal.cad.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CutFeatureDto {
    private UUID id;
    private String name;
    private String type;
    private Double positionZ;
    private Double polarAngle;
    private Double radius;
    private Double slotLength;
    private Double slotWidth;
    private Double mitreAngle;
    private Boolean enabled;
}
