import { Component, OnInit } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
})
export class SplashScreenComponent implements OnInit {
  showSpinner = true;

  ngOnInit() {
    // Show splash screen for a specified duration
    setTimeout(() => {
      this.showSpinner = false;
      SplashScreen.hide(); // Hide the splash screen after loading
    }, 3000); // Adjust this duration as needed
  }
}
