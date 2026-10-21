package com.moneywise.transactions.domain;

import java.util.List;
import java.util.Objects;

/** Categoria fixa ou personalizada de uma transação. */
public record Category(String name) {

    private static final List<String> DEFAULT_NAMES = List.of(
            "Comida", "Transporte", "Compras", "Casa", "Saúde", "Outros");

    public Category {
        Objects.requireNonNull(name, "A categoria é obrigatória.");
        name = name.strip();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("A categoria não pode ficar vazia.");
        }
    }

    public static Category of(String name) {
        return new Category(name);
    }

    public static List<Category> defaults() {
        return DEFAULT_NAMES.stream().map(Category::new).toList();
    }
}
