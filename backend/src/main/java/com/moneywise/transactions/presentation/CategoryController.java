package com.moneywise.transactions.presentation;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.shared.web.CurrentUserId;
import com.moneywise.transactions.application.usecase.categories.CreateCustomCategory;
import com.moneywise.transactions.application.usecase.categories.ListCategories;
import com.moneywise.transactions.application.usecase.categories.ListCategories.CategoryItem;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/categories")
@Tag(name = "Categorias")
@SecurityRequirement(name = "BearerAuth")
public class CategoryController {

    public record CreateCategoryRequest(
            @NotBlank
            @Size(max = 50)
            String name
    ) {}

    private final ListCategories listCategories;
    private final CreateCustomCategory createCategory;

    public CategoryController(
            ListCategories listCategories,
            CreateCustomCategory createCategory) {
        this.listCategories = listCategories;
        this.createCategory = createCategory;
    }

    @GetMapping
    @Operation(
        operationId = "listCategories",
        summary = "Listar categorias do usuario"
    )
    public List<CategoryItem> list(
            @CurrentUserId UUID userId) {
        return listCategories.execute(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
        operationId = "createCustomCategory",
        summary = "Criar categoria personalizada"
    )
    public CategoryItem create(
            @CurrentUserId UUID userId,
            @Valid @RequestBody CreateCategoryRequest request) {

        String name = createCategory.execute(
                userId, request.name()
        );

        return new CategoryItem(name, false);
    }
}
