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
  private apiUrl = 'http://192.168.5.30:5000/visitors';
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
        console.log('Visitor data received:', data);
        this.visitors = data.map((visitor) => ({
          ...visitor,
          date: this.datePipe.transform(visitor.date_of_entry, 'short'),
        }));
        console.log('Processed visitors:', this.visitors);
      },
      (error) => {
        console.error('Error fetching visitor data:', error);
        // Log the error details
        if (error.status) {
          console.error(`Error Status: ${error.status}`);
        }
        if (error.message) {
          console.error(`Error Message: ${error.message}`);
        }
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
