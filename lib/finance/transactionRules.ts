const travelIncomeNames = new Set([
  "Clases Alan",
  "Clases Liam",
  "Clases Xavi",
  "Webs",
  "Ingreso extra viajes",
]);

const normalIncomeNames = new Set([
  "Profesor FP",
  "PFI",
  "Ingreso extra normal",
]);

const investmentNames = new Set(["Aportacion mensual", "Aportación mensual"]);

export function isTravelIncomeSubcategory(name: string) {
  return travelIncomeNames.has(name);
}

export function isNormalIncomeSubcategory(name: string) {
  return normalIncomeNames.has(name);
}

export function isInvestmentCategoryOrSubcategory(
  categoryName: string,
  subcategoryName?: string | null,
) {
  return (
    categoryName === "Inversion" ||
    categoryName === "Inversión" ||
    investmentNames.has(subcategoryName ?? "")
  );
}
