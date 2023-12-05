import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reporte-peliculas',
  templateUrl: './reporte-peliculas.component.html',
  styleUrls: ['./reporte-peliculas.component.css']
})
export class ReportePeliculasComponent implements OnInit {
  peliculas: any[] = [];
  peliculasFiltradas: any[] = [];
  filtroGenero: string = '';
  filtroAnio: number | null = null;

  constructor(private http: HttpClient) {
    (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.http.get<any[]>('./assets/peliculas.json').subscribe(data => {
      this.peliculas = data;
      this.peliculasFiltradas = data;
    });
  }

  generarPDF() {
    const contenido = [
      { text: 'Informe de Películas', style: 'header' },
      { text: '\n\n' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            ['Título', 'Género', 'Año de lanzamiento'],
            ...this.peliculasFiltradas.map(pelicula => [pelicula.titulo, pelicula.genero, pelicula.lanzamiento.toString()])
          ]
        }
      }
    ];
  
    const estilos = {
      header: {
        fontSize: 18,
        bold: true,
        italic: true,
        color: '#00FF00'
      }
    };

    const documentDefinition = {
      content: contenido,
      styles: estilos
    };
  
    pdfMake.createPdf(documentDefinition).open();
  }
  
  exportarExcel() {
    const jsonData = this.peliculasFiltradas;
    const ws = XLSX.utils.json_to_sheet(jsonData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Peliculas');
    XLSX.writeFile(wb, 'informe_peliculas.xlsx');
  }

  aplicarFiltros() {
    this.peliculasFiltradas = this.peliculas.filter(pelicula =>
      (this.filtroGenero ? pelicula.genero.toLowerCase().includes(this.filtroGenero.toLowerCase()) : true) &&
      (this.filtroAnio ? pelicula.lanzamiento === this.filtroAnio : true)
    );
  }

  limpiarFiltros() {
    this.filtroGenero = '';
    this.filtroAnio = null;
    this.peliculasFiltradas = this.peliculas;
  }
}
