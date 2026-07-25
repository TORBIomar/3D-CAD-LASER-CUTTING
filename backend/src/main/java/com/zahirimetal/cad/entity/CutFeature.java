package com.zahirimetal.cad.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "cut_features")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CutFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "feature_name")
    private String name;

    @Column(name = "type", nullable = false)
    private String type; // 'hole', 'slot', 'mitre_start', 'mitre_end'

    @Column(name = "z_offset", nullable = false)
    private Double zOffset; // positionZ along tube length

    @Column(name = "polar_angle", nullable = false)
    private Double polarAngle; // degrees 0-360

    @Column(name = "cut_diameter")
    private Double cutDiameter; // for hole

    @Column(name = "cut_width")
    private Double cutWidth; // for slot

    @Column(name = "cut_length")
    private Double cutLength; // for slot

    @Column(name = "mitre_angle")
    private Double mitreAngle; // degrees for mitre bevel

    @Column(name = "enabled")
    private Boolean enabled = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tube_project_id", nullable = false)
    @JsonIgnore
    private TubeProject tubeProject;
}
