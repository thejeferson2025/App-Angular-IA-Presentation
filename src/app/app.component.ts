import * as XLSX from 'xlsx'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Factura } from './models/factura.model';
import { FacturaService } from './services/factura';
import { Component, OnInit, signal } from '@angular/core';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = signal('Procesador de Facturas con IA');
  facturas = signal<Factura[]>([]);
  cargando = signal(false);

  constructor(private facturaService: FacturaService) {}

  ngOnInit() {
    this.cargarFacturas();
  }

  cargarFacturas() {
    this.facturaService.obtenerTodas().subscribe(data => {
      this.facturas.set(data.map(f => ({ ...f, editando: false })));
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.cargando.set(true);
      this.facturaService.subirPdf(file).subscribe({
        next: () => {
          this.cargarFacturas(); 
          this.cargando.set(false);
          alert('Factura procesada con éxito');
          location.reload(); 
        },
        error: (err) => {
          console.error(err);
          this.cargando.set(false);
          alert('Error al procesar el PDF');
        }
      });
    }
  }

  eliminarFactura(id: number) {

    if (confirm('¿Seguro que deseas eliminar esta factura?')) {
      this.facturaService.eliminar(id).subscribe(() => {
        this.cargarFacturas();
      });
    }
  }

  guardarCambios(f: Factura) {

    this.facturaService.actualizar(f.id, f).subscribe(() => {
      f.editando = false;
      this.cargarFacturas();
    });
  }

  generarExcel() {
    // Verificamos de datos
    if (this.facturas().length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    // A. Preparamos los datos 
    const datosParaExcel = this.facturas().map(f => ({
      'ID': f.id,
      'Emisor': f.emisor,
      'NIT/RUC': f.nitOId,
      'Fecha': new Date(f.fecha).toLocaleDateString(), 
      'Total': f.totalPagar,
      'Moneda': f.moneda
    }));

    // B. Creamos la hoja de cálculo
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExcel);

    // C. Creamos el libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas');

    // D. Guardamos el archivo
    const nombreArchivo = `Reporte_Facturas_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  }

}

