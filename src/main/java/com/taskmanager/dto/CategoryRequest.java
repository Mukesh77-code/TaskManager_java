package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 60, message = "Category name must be between 2 and 60 characters")
    private String name;

    @Size(max = 20, message = "Color code cannot exceed 20 characters")
    private String color;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    public CategoryRequest() {
    }

    public CategoryRequest(String name, String color, String description) {
        this.name = name;
        this.color = color;
        this.description = description;
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
}
