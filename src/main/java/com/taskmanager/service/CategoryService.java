package com.taskmanager.service;

import com.taskmanager.dto.CategoryDto;
import com.taskmanager.dto.CategoryRequest;
import java.util.List;

public interface CategoryService {

    List<CategoryDto> getAllCategories();

    CategoryDto getCategoryById(Long id);

    CategoryDto createCategory(CategoryRequest request);

    void deleteCategory(Long id);
}
