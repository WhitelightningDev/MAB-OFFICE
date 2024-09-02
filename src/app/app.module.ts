import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppRoutingModule, routes } from './app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IonicModule } from '@ionic/angular';
import { AppComponent } from './app.component';
import { HomePage } from './home/home.page';
import { VisitorPageComponent } from './visitor-page/visitor-page.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { SavedDetailsComponent } from './saved-details/saved-details.component';
import { SelfieModalComponent } from './selfie-modal/selfie-modal.component';
import { VisitorDetailModalComponent } from './visitor-detail-modal/visitor-detail-modal.component';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
@NgModule({
  declarations: [
    AppComponent,
    HomePage,
    VisitorPageComponent,
    SavedDetailsComponent,
    SelfieModalComponent,
    VisitorDetailModalComponent,
    SplashScreenComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    IonicModule.forRoot(),
    CommonModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    FontAwesomeModule,
    HttpClientModule, // Add HttpClientModule here
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
