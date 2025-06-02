import { VariantType, VariantValue, ProductVariant, VariantProperty } from "@/types/product";
import { v4 as uuidv4 } from "uuid";

export const cleanVariantTypes = (variantTypes: VariantType[]): VariantType[] => {
  return variantTypes.map((t) => ({
    ...t,
    values: t.values.filter((v) => v.value.trim() !== ""),
  }));
};

export const generateVariants = (variantTypes: VariantType[]): ProductVariant[] => {
  const cleaned = cleanVariantTypes(variantTypes);
  if (cleaned.some((t) => t.values.length === 0)) return [];

  const combine = (
    acc: VariantProperty[][],
    current: VariantType
  ): VariantProperty[][] => {
    return acc.flatMap((arr) =>
      current.values.map((v) => [
        ...arr,
        {
          type: current.type,
          value: v.value,
          image: v.image,
        },
      ])
    );
  };

  const combinations = cleaned.reduce(
    (acc, cur) => combine(acc, cur),
    [[]] as VariantProperty[][]
  );

  return combinations.map((props) => ({
    properties: props,
    price: 0,
    stockCount: 0,
  }));
};

export const createEmptyVariantType = (typeName: string, isFirst: boolean = false): VariantType => ({
  type: typeName,
  values: [
    {
      id: uuidv4(),
      value: "",
      image: isFirst ? "" : undefined,
    },
  ],
});

export const updateVariantValue = (
  variantTypes: VariantType[],
  type: string,
  id: string,
  newValue: string
): VariantType[] => {
  return variantTypes.map((t) =>
    t.type === type
      ? {
          ...t,
          values: t.values.map((v) =>
            v.id === id ? { ...v, value: newValue } : v
          ),
        }
      : t
  );
};

export const deleteVariantValue = (
  variantTypes: VariantType[],
  type: string,
  id: string
): VariantType[] => {
  return variantTypes.map((t) =>
    t.type === type
      ? {
          ...t,
          values: t.values.filter((v) => v.id !== id),
        }
      : t
  );
};