// utils.ts - Versión simplificada sin dependencias externas
// Esto arregla el error de instalación sin necesitar npm install

export function cn(...inputs: (string | undefined | null | false)[]) {
  // Simplemente une las clases válidas con un espacio
  return inputs.filter(Boolean).join(" ");
}