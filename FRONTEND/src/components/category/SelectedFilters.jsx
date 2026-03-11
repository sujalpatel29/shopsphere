import { Chip } from "primereact/chip";

function SelectedFilters({
  isLoading = false,
  categoryTags = [],
  searchText = "",
  priceTag = "",
  onRemoveCategory,
  onClearSearch,
  onClearPrice,
}) {
  if (isLoading) return null;

  const hasAny =
    categoryTags.length > 0 || Boolean(searchText) || Boolean(priceTag);
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categoryTags.map((tag) => (
        <Chip
          key={tag.id}
          label={tag.label}
          removable
          onRemove={() => onRemoveCategory?.(tag.id)}
        />
      ))}

      {searchText ? (
        <Chip
          label={`Search: ${searchText}`}
          removable
          onRemove={() => onClearSearch?.()}
        />
      ) : null}

      {priceTag ? (
        <Chip
          label={priceTag}
          removable
          onRemove={() => onClearPrice?.()}
        />
      ) : null}
    </div>
  );
}

export default SelectedFilters;
