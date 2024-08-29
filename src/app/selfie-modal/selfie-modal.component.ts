import { Component, Input } from '@angular/core'; // Import necessary Angular core decorators
import { ModalController } from '@ionic/angular'; // Import ModalController from Ionic to manage modals

@Component({
  selector: 'app-selfie-modal', // Selector for using the component in templates
  templateUrl: './selfie-modal.component.html', // Path to the component's HTML template
  styleUrls: ['./selfie-modal.component.scss'], // Path to the component's styles
})
export class SelfieModalComponent {
  @Input() // Decorator to allow data binding from parent component
  imageSrc!: string; // Property to hold the URL of the selfie image

  constructor(private modalController: ModalController) {} // Inject ModalController for modal management

  closeModal() {
    this.modalController.dismiss(); // Method to close the modal
  }
}
