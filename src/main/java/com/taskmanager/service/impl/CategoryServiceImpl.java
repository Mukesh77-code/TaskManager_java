package com.taskmanager.service.impl;

import com.taskmanager.dto.CategoryDto;
import com.taskmanager.dto.CategoryRequest;
import com.taskmanager.entity.Category;
import com.taskmanager.exception.DuplicateResourceException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.mapper.TaskMapper;
import com.taskmanager.repository.CategoryRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public CategoryServiceImpl(CategoryRepository categoryRepository,
                               TaskRepository taskRepository,
                               TaskMapper taskMapper) {
        this.categoryRepository = categoryRepository;
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> {
                    long count = taskRepository.countByCategoryId(cat.getId());
                    return taskMapper.toCategoryDto(cat, count);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        long count = taskRepository.countByCategoryId(category.getId());
        return taskMapper.toCategoryDto(category, count);
    }

    @Override
    public CategoryDto createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DuplicateResourceException("Category already exists with name: " + request.getName());
        }

        Category category = taskMapper.toCategoryEntity(request);
        Category saved = categoryRepository.save(category);
        return taskMapper.toCategoryDto(saved, 0);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }
}
