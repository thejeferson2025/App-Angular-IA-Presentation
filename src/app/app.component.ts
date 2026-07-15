import * as XLSX from 'xlsx';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Factura } from './models/factura.model';
import { FacturaService } from './services/factura';
import { Component, OnInit, signal } from '@angular/core';
import Swal from 'sweetalert2';

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

          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Factura procesada con éxito',
            showConfirmButton: false,
            timer: 2500,
            toast: true
          });


        },
        error: (err) => {
          console.error(err);
          this.cargando.set(false);

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Error al procesar el PDF',
            confirmButtonColor: '#0d6efd'
          });
        }
      });
    }
  }

  eliminarFactura(id: number) {

    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará la factura permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.facturaService.eliminar(id).subscribe(() => {
          this.cargarFacturas();


          Swal.fire(
            '¡Eliminada!',
            'La factura ha sido borrada.',
            'success'
          );
        });
      }
    });
  }

  guardarCambios(f: Factura) {
    this.facturaService.actualizar(f.id, f).subscribe(() => {
      f.editando = false;
      this.cargarFacturas();
    });
  }

  generarExcel() {

    if (this.facturas().length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin datos',
        text: 'No hay facturas para exportar a Excel.',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }


    const datosParaExcel = this.facturas().map(f => ({
      'ID': f.id,
      'Emisor': f.emisor,
      'RUC': f.nitOId,
      'Fecha': new Date(f.fecha).toLocaleDateString(),
      'Total': f.totalPagar,
      'Moneda': f.moneda
    }));


    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExcel);


    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas');


    const nombreArchivo = `Reporte_Facturas_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  }
}
