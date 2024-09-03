import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { VisitorDetailModalComponent } from '../visitor-detail-modal/visitor-detail-modal.component';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common'; // Import DatePipe for date formatting
import { Router } from '@angular/router'; // Import Router for navigation

@Component({
  selector: 'app-saved-details',
  templateUrl: './saved-details.component.html',
  styleUrls: ['./saved-details.component.scss'],
  providers: [DatePipe], // Add DatePipe to the providers for dependency injection
})
export class SavedDetailsComponent implements OnInit {
  visitors: any[] = []; // Array to hold visitor details fetched from the API
  private apiUrl = 'https://hades.mabbureau.com/visitors'; // API endpoint URL
  successToast: any; // Placeholder for a success toast message

  constructor(
    private modalController: ModalController, // ModalController to manage modal popups
    private alertController: AlertController, // AlertController to show alerts
    private http: HttpClient, // HttpClient to make HTTP requests
    private datePipe: DatePipe, // Inject DatePipe for formatting dates
    private router: Router // Inject Router for navigation
  ) {}

  ngOnInit() {
    this.loadVisitorData(); // Load visitor data when the component initializes
  }

  // Fetch visitor data from the API
  private loadVisitorData() {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (data) => {
        console.log('Visitor data received:', data);
        // Map the visitor data and format the date using DatePipe
        this.visitors = data.map((visitor) => ({
          ...visitor,
          date: this.datePipe.transform(visitor.date_of_entry, 'short'),
        }));
        console.log('Processed visitors:', this.visitors);
      },
      (error) => {
        console.error('Error fetching visitor data:', error);
        this.logApiError('Fetch Visitor Data', error); // Log API error details
        this.handleFetchError(error); // Handle errors from the fetch
      }
    );
  }

  // Handle different types of fetch errors
  private handleFetchError(error: any) {
    let message = 'Could not load visitor data. Please try again later.';
    if (error.status) {
      switch (error.status) {
        case 404:
          message = 'Visitor data not found. Please check the API URL.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        case 0:
          message = 'Network error. Please check your internet connection.';
          break;
        default:
          message = `Unexpected error occurred: ${
            error.message || error.statusText
          }`;
          break;
      }
      console.error(`Error Status: ${error.status}, Message: ${message}`);
    }
    this.showAlert('Error', message); // Show an alert with the error message
  }

  // Open the modal to display detailed information about a visitor
  async openVisitorDetails(visitor: any) {
    const modal = await this.modalController.create({
      component: VisitorDetailModalComponent, // Component to display in the modal
      componentProps: { visitor }, // Pass the selected visitor's data to the modal
    });
    await modal.present(); // Present the modal to the user
  }

  // Log API error details to the console for debugging
  private logApiError(action: string, error: any) {
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] API Error during ${action}:`,
      `Status: ${error.status || 'N/A'},`,
      `Message: ${error.message || 'N/A'},`,
      `Response: ${JSON.stringify(error.error || {})}`
    );
  }

  // Show an alert with a given header and message
  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'], // Single button to dismiss the alert
    });
    await alert.present(); // Present the alert to the user
  }

  // Handle navigation back to the home page
  handleBackNavigation() {
    this.router.navigate(['/home'], { replaceUrl: true }).then(() => {
      window.location.reload(); // Force refresh the page after navigation
    });
  }
}
