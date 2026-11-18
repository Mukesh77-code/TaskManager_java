package com.taskmanager.dto;

import java.time.LocalDateTime;

public class CategoryDto {

    private Long id;
    private String name;
    private String color;
    private String description;
    private LocalDateTime createdAt;
    private long taskCount;

    public CategoryDto() {
    }

    public CategoryDto(Long id, String name, String color, String description, LocalDateTime createdAt, long taskCount) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.description = description;
        this.createdAt = createdAt;
        this.taskCount = taskCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public long getTaskCount() {
        return taskCount;
    }

    public void setTaskCount(long taskCount) {
        this.taskCount = taskCount;
    }
}
