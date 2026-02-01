import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacturaService } from './services/factura';
import { Factura } from './models/factura.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  title = signal('Procesador de Facturas IA');
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

}