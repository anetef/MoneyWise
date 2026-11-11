package com.moneywise.transactions.application.usecase.categories;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.moneywise.transactions.application.port.CategoryCatalog;
import com.moneywise.transactions.domain.Category;

public final class ListCategories {

    public record CategoryItem(String name, boolean fixed) {}

    private record Custom(String name, long count) {}

    private static final Set<String> FIXED_KEYS =
            Category.defaults().stream()
                    .map(category -> key(category.name()))
                    .collect(Collectors.toUnmodifiableSet());

    private final CategoryCatalog catalog;

    public ListCategories(CategoryCatalog catalog) {
        this.catalog = catalog;
    }

    public List<CategoryItem> execute(UUID userId) {
        List<CategoryItem> result = new ArrayList<>();

        // Categorias fixas na ordem definida pela L-11.
        for (Category category : Category.defaults()) {
            result.add(new CategoryItem(category.name(), true));
        }

        Map<String, Custom> customs = new HashMap<>();

        // Inclui categorias criadas mesmo sem transacoes.
        for (String name : catalog.findSavedNames(userId)) {
            String normalized = key(name);

            if (!FIXED_KEYS.contains(normalized)) {
                customs.putIfAbsent(
                        normalized,
                        new Custom(name.strip(), 0L)
                );
            }
        }

        // Inclui categorias historicas e contabiliza o uso.
        for (CategoryCatalog.Usage usage :
                catalog.findTransactionUsage(userId)) {

            String normalized = key(usage.name());

            if (FIXED_KEYS.contains(normalized)) {
                continue;
            }

            customs.merge(
                    normalized,
                    new Custom(usage.name().strip(), usage.count()),
                    (oldValue, newValue) -> new Custom(
                            oldValue.name(),
                            oldValue.count() + newValue.count()
                    )
            );
        }

        List<Custom> sorted = customs.values().stream()
                .sorted(
                    Comparator.comparingLong(Custom::count)
                            .reversed()
                            .thenComparing(
                                item -> item.name()
                                        .toLowerCase(Locale.ROOT)
                            )
                            .thenComparing(Custom::name)
                )
                .toList();

        for (Custom category : sorted) {
            result.add(new CategoryItem(category.name(), false));
        }

        return List.copyOf(result);
    }

    private static String key(String name) {
        return name.strip().toLowerCase(Locale.ROOT);
    }
}
