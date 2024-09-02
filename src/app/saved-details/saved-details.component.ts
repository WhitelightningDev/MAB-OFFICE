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

// http://10.0.0.175:3000/api/visitors
// http://192.168.5.30:5000/visitors
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
        // Log the error details and show an alert if the data fetch fails
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

  // Open the modal to display detailed information about a visitor
  async openVisitorDetails(visitor: any) {
    const modal = await this.modalController.create({
      component: VisitorDetailModalComponent, // Component to display in the modal
      componentProps: { visitor }, // Pass the selected visitor's data to the modal
    });
    await modal.present(); // Present the modal to the user
  }

  // Prompt the user to confirm before deleting a visitor
  async deleteVisitor(index: number, event: Event) {
    event.stopPropagation(); // Prevent the event from bubbling up
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this visitor?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary', // Styling class for the cancel button
        },
        {
          text: 'Delete',
          handler: () => {
            const visitorToDelete = this.visitors[index]; // Get the visitor to delete
            this.deleteVisitorFromApi(visitorToDelete._id); // Call the delete function
          },
        },
      ],
    });

    await alert.present(); // Present the alert to the user
  }

  // Delete a visitor from the API and update the list
  private deleteVisitorFromApi(visitorId: string) {
    this.http.delete(`${this.apiUrl}/${visitorId}`).subscribe(
      () => {
        console.log('Visitor deleted successfully');
        // Remove the deleted visitor from the local array
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
