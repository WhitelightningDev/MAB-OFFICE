import { Component, Input } from '@angular/core'; // Import necessary Angular core components
import { ModalController } from '@ionic/angular'; // Import ModalController for modal management

@Component({
  selector: 'app-visitor-detail-modal', // Selector for the component
  templateUrl: './visitor-detail-modal.component.html', // Template file for the component
  styleUrls: ['./visitor-detail-modal.component.scss'], // Stylesheet for the component
})
export class VisitorDetailModalComponent {
  @Input() visitor: any; // Input property to receive visitor data from the parent component
  enlargedImage: string | null = null; // Variable to hold the URL of the enlarged image; initialized as null

  constructor(private modalController: ModalController) {} // Inject ModalController to manage modals

  // Method to dismiss the modal
  dismiss() {
    this.modalController.dismiss(); // Call dismiss method on the modalController to close the modal
  }

  // Method to enlarge the image
  enlargeImage(imageSrc: string) {
    this.enlargedImage = imageSrc; // Set the enlarged image source to the provided image source
  }

  // Method to close the enlarged image
  closeEnlargedImage() {
    this.enlargedImage = null; // Reset the enlarged image variable to null when closing
  }
}
