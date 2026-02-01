export interface Factura {
  id: number;
  emisor: string;
  nitOId: string;
  fecha: string; 
  totalPagar: number;
  moneda: string;
  editando?: boolean;
}