import { Injectable } from '@angular/core';
import { Student } from '../../models/student';
import {Observable, from, throwError, switchMap} from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QRCodeService {

  constructor() { }


  generateQRCode(studentId: string): Observable<string> {
    // Utiliser la bibliothèque QRCode pour générer un QR code contenant l'ID de l'étudiant
    return from(
      import('qrcode').then(QRCode => {
        return QRCode.toDataURL(studentId, {
          errorCorrectionLevel: 'H',
          width: 200,
          margin: 1
        });
      })
    ).pipe(
      catchError(err => {
        console.error('Erreur lors de la génération du QR code:', err);
        return throwError(() => new Error('Impossible de générer le QR code'));
      })
    );
  }


  generateStudentPDF(student: Student): Observable<Blob> {
    return this.generateQRCode(student.id).pipe(
      switchMap(qrCodeDataUrl => from(this.createPDF(student, qrCodeDataUrl))),
      catchError(err => {
        console.error('Erreur lors de la génération du PDF:', err);
        return throwError(() => new Error('Impossible de générer le PDF'));
      })
    );
  }


  private async createPDF(student: Student, qrCodeDataUrl: string): Promise<Blob> {
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF();

    // Couleurs
    const primaryColor = '#004080';  // bleu foncé
    const secondaryColor = '#ff6600'; // orange

    // Fond léger sur toute la page
    doc.setFillColor(240, 248, 255); // AliceBlue
    doc.rect(0, 0, 210, 297, 'F'); // A4

    // Encadré principal avec bord arrondi
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(1.5);
    doc.roundedRect(10, 15, 190, 260, 10, 10, 'S');

    // Titre
    doc.setTextColor(primaryColor);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Carte d\'étudiant', 105, 30, { align: 'center' });

    // Ligne séparatrice
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.8);
    doc.line(20, 35, 190, 35);

    // Section infos étudiant
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text('Informations', 20, 50);

    // Contenu infos
    doc.setFontSize(12);
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'normal');

    const lineHeight = 10;
    let currentY = 60;

    doc.text(`Nom: ${student.lastName}`, 20, currentY); currentY += lineHeight;
    doc.text(`Prénom: ${student.firstName}`, 20, currentY); currentY += lineHeight;
    doc.text(`Niveau: ${student.grade}`, 20, currentY); currentY += lineHeight;
    doc.text(`Genre: ${student.gender === 'male' ? 'Masculin' : 'Féminin'}`, 20, currentY); currentY += lineHeight;
    doc.text(`Date de naissance: ${new Date(student.dateOfBirth).toLocaleDateString('fr-FR')}`, 20, currentY); currentY += lineHeight;
    doc.text(`ID: ${student.id}`, 20, currentY);

    // QR Code + légende
    doc.addImage(qrCodeDataUrl, 'PNG', 130, 50, 60, 60);
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor);
    doc.text('QR Code', 160, 115, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor('#555555');
    doc.text('Pour accéder aux tests', 160, 122, { align: 'center' });

    // Pied de page
    doc.setDrawColor('#cccccc');
    doc.setLineWidth(0.5);
    doc.line(10, 275, 200, 275);

    doc.setFontSize(9);
    doc.setTextColor('#999999');

    return doc.output('blob');
  }



  downloadStudentPDF(student: Student): Observable<boolean> {
    return from(this.generateStudentPDF(student)).pipe(
      map(pdfBlob => {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `etudiant_${student.lastName}_${student.firstName}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        return true;
      }),
      catchError(err => {
        console.error('Erreur lors du téléchargement du PDF:', err);
        return throwError(() => new Error('Impossible de télécharger le PDF'));
      })
    );
  }
}
