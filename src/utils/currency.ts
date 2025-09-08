/**
 * Formata um valor numérico para moeda brasileira
 * @param value - Valor numérico ou string
 * @returns String formatada como moeda brasileira (ex: "R$ 1.234,56")
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue === 0) {
    return 'R$ 0,00';
  }
  
  // Converte para string e separa parte inteira e decimal
  const [integerPart, decimalPart = '00'] = numValue.toFixed(2).split('.');
  
  // Adiciona pontos para milhares
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `R$ ${formattedInteger},${decimalPart}`;
};

/**
 * Remove formatação de moeda e retorna valor numérico
 * @param formattedValue - String formatada (ex: "R$ 1.234,56")
 * @returns Valor numérico
 */
export const parseCurrency = (formattedValue: string): number => {
  if (!formattedValue) return 0;
  
  // Remove "R$" e espaços
  const cleaned = formattedValue.replace(/R\$\s*/g, '');
  
  // Substitui ponto por vazio (separador de milhares) e vírgula por ponto (decimal)
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formata valor para exibição simples (sem R$)
 * @param value - Valor numérico ou string
 * @returns String formatada (ex: "1.234,56")
 */
export const formatNumber = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue === 0) {
    return '0,00';
  }
  
  const [integerPart, decimalPart = '00'] = numValue.toFixed(2).split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedInteger},${decimalPart}`;
};
