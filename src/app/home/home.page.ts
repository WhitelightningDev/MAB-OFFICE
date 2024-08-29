import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../Toast.Service'; // Service for displaying toast messages
import { AlertController } from '@ionic/angular';
import { PrivacyPolicy } from './privacy-policy'; // Import the privacy policy module
import { termsAndConditions } from './TsnCs'; // Import the terms and conditions module

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(
    private toastService: ToastService, // Inject the ToastService
    private router: Router, // Inject the Router for navigation
    private alertController: AlertController // Inject the AlertController for displaying alerts
  ) {}

  ngOnInit() {
    // Check if there is any navigation state passed to this page
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const message = navigation.extras.state['message']; // Retrieve the message from the navigation state
      if (message) {
        this.showToast(message); // Display the message using a toast
      }
    }
  }

  // Method to show a toast notification with a given message
  showToast(message: string) {
    this.toastService.presentToast(message);
  }

  // Method to display the privacy policy in an alert dialog
  async showPrivacyPolicy() {
    const alert = await this.alertController.create({
      header: PrivacyPolicy.title, // Set the alert header to the title from PrivacyPolicy
      message: PrivacyPolicy.content, // Set the alert message to the content from PrivacyPolicy
      buttons: ['OK'], // Provide an 'OK' button to dismiss the alert
    });

    await alert.present(); // Present the alert dialog
  }

  // Method to display the terms and conditions in an alert dialog
  async showTermsAndConditions() {
    const alert = await this.alertController.create({
      header: termsAndConditions.title, // Set the alert header to the title from termsAndConditions
      message: termsAndConditions.content, // Set the alert message to the content from termsAndConditions
      buttons: ['OK'], // Provide an 'OK' button to dismiss the alert
    });

    await alert.present(); // Present the alert dialog
  }

  // Method to authenticate the user before showing the Visitor List
  async authenticateUser() {
    const alert = await this.alertController.create({
      header: 'Authentication',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          handler: (data) => {
            const hardcodedPassword = '2360';

            if (data.password === hardcodedPassword) {
              this.router.navigate(['/saved-details']);
            } else {
              this.showToast('Invalid username or password');
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
