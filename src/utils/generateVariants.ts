import { VariantType, ProductVariant, VariantProperty } from "@/types/product";

export function generateVariants(variantTypes: VariantType[]): ProductVariant[] {
  if (!variantTypes || variantTypes.length === 0) return [];

  const cleaned = variantTypes.map((type) => ({
    ...type,
    values: type.values.filter((v) => v.value.trim() !== ""),
  }));

  if (cleaned.some((t) => t.values.length === 0)) return [];

  const combine = (
    acc: VariantProperty[][],
    current: VariantType
  ): VariantProperty[][] =>
    acc.flatMap((arr) =>
      current.values.map((v) => [
        ...arr,
        {
          type: current.type,
          value: v.value,
          image: v.image,
        },
      ])
    );

  const combinations = cleaned.reduce(
    (acc, cur) => combine(acc, cur),
    [[]] as VariantProperty[][]
  );

  return combinations.map((props) => ({
    properties: props,
    price: 0,
    discountPrice: 0,
    stockCount: 0,
  }));
}