import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  // async presentToast(message: string) {
  //   const toast = await this.toastController.create({
  //     message: message,
  //     duration: 5000,
  //     position: 'bottom',
  //     cssClass: 'custom-toast', // Add a custom class if needed
  //   });
  //   await toast.present();
  // }

  async presentSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'middle',
      cssClass: 'success-toast',
      icon: 'checkmark-circle', // Success icon
    });
    await toast.present();
  }

  async presentErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      position: 'middle',
      cssClass: 'error-toast',
      icon: 'alert-circle', // Error icon
    });
    await toast.present();
  }

  async presentInfoToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'middle',
      cssClass: 'info-toast',
      icon: 'information-circle', // Info icon
    });
    await toast.present();
  }
}
