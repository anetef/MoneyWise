package com.moneywise.transactions.application.usecase.categories;

import java.util.Locale;
import java.util.UUID;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ConflictException;
import com.moneywise.transactions.application.port.CategoryCatalog;
import com.moneywise.transactions.domain.Category;

public final class CreateCustomCategory {

    private final CategoryCatalog catalog;

    public CreateCustomCategory(CategoryCatalog catalog) {
        this.catalog = catalog;
    }

    public String execute(UUID userId, String rawName) {
        if (rawName == null || rawName.isBlank()) {
            throw new BusinessRuleException(
                    "INVALID_CATEGORY_NAME",
                    "Informe um nome para a categoria."
            );
        }

        String name = Category.of(rawName).name();

        if (name.length() > 50) {
            throw new BusinessRuleException(
                    "INVALID_CATEGORY_NAME",
                    "A categoria deve ter no maximo 50 caracteres."
            );
        }

        String normalized = key(name);

        boolean fixed = Category.defaults().stream()
                .anyMatch(item -> key(item.name())
                        .equals(normalized));

        boolean saved = catalog.findSavedNames(userId).stream()
                .anyMatch(item -> key(item).equals(normalized));

        boolean historical =
                catalog.findTransactionUsage(userId).stream()
                        .anyMatch(item -> key(item.name())
                                .equals(normalized));

        if (fixed || saved || historical ||
                !catalog.insert(userId, name)) {
            throw new ConflictException(
                    "CATEGORY_ALREADY_EXISTS",
                    "Esta categoria ja existe."
            );
        }

        return name;
    }

    private static String key(String value) {
        return value.strip().toLowerCase(Locale.ROOT);
    }
}
