import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  constructor(private alertController: AlertController) {}

  async presentConfirmDialog(
    header: string,
    message: string
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              resolve(false); // User selected Cancel
            },
          },
          {
            text: 'OK',
            handler: () => {
              resolve(true); // User selected OK
            },
          },
        ],
      });

      await alert.present();
    });
  }

  async presentErrorDialog(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
