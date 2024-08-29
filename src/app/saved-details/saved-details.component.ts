import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { VisitorDetailModalComponent } from '../visitor-detail-modal/visitor-detail-modal.component';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common'; // Import DatePipe
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-saved-details',
  templateUrl: './saved-details.component.html',
  styleUrls: ['./saved-details.component.scss'],
  providers: [DatePipe], // Add DatePipe to the providers
})
export class SavedDetailsComponent implements OnInit {
  visitors: any[] = [];
  private apiUrl = 'http://10.0.0.175:3000/api/visitors';
  successToast: any;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private http: HttpClient,
    private datePipe: DatePipe, // Inject DatePipe
    private router: Router
  ) {}

  ngOnInit() {
    this.loadVisitorData();
  }

  private loadVisitorData() {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (data) => {
        console.log('Visitor data received:', data); // Log the entire response

        // Format the date for each visitor
        this.visitors = data.map((visitor) => ({
          ...visitor,
          date: this.datePipe.transform(visitor.dateOfEntry, 'short'), // Use dateOfEntry
          selfieImage: visitor.selfie, // Retrieve the selfie image URL
          signatureImage: visitor.signature, // Retrieve the signature image URL
        }));

        console.log('Processed visitors:', this.visitors); // Log the processed visitors
      },
      (error) => {
        console.error('Error fetching visitor data:', error);
        this.showAlert(
          'Error',
          'Could not load visitor data. Please try again later.'
        );
      }
    );
  }

  async openVisitorDetails(visitor: any) {
    const modal = await this.modalController.create({
      component: VisitorDetailModalComponent,
      componentProps: { visitor },
    });
    await modal.present();
  }

  async deleteVisitor(index: number, event: Event) {
    event.stopPropagation();
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this visitor?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Delete',
          handler: () => {
            const visitorToDelete = this.visitors[index];
            this.deleteVisitorFromApi(visitorToDelete._id);
          },
        },
      ],
    });

    await alert.present();
  }

  private deleteVisitorFromApi(visitorId: string) {
    this.http.delete(`${this.apiUrl}/${visitorId}`).subscribe(
      () => {
        console.log('Visitor deleted successfully');
        this.visitors = this.visitors.filter(
          (visitor) => visitor._id !== visitorId
        );
        this.showAlert('Success', 'Visitor deleted successfully.');
      },
      (error) => {
        console.error('Error deleting visitor:', error);
        this.showAlert(
          'Error',
          'Could not delete visitor. Please try again later.'
        );
      }
    );
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  handleBackNavigation() {
    this.router.navigate(['/home'], { replaceUrl: true }).then(() => {
      window.location.reload(); // Force refresh the page
    });
  }
}
