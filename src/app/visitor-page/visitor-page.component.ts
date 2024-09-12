import { PopupService } from './../services/popup.service';
import {
  Component,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { debounceTime, Observable, Subject, Subscription } from 'rxjs';
import { popiaQuestions } from '../services/popia.questions';
import { ToastService } from '../services/Toast.Service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as bootstrap from 'bootstrap';

import {
  Category,
  DrawingUtils,
  FaceLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';

@Component({
  selector: 'app-visitor-page',
  templateUrl: './visitor-page.component.html',
  styleUrls: ['./visitor-page.component.scss'],
})
export class VisitorPageComponent implements AfterViewInit, OnDestroy, OnInit {
  private navigationSubscription: Subscription | undefined;
  questions = popiaQuestions;
  private isDrawing = false;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  // Visitor data
  name: string = '';
  surname: string = '';
  contact: string = '';
  email: string = '';
  idn: string = '';
  purpose: string = '';
  date: string = '';
  organization: string = '';
  signature: string | null = null;
  selfie: string | null = null;
  accepted_popia: boolean = false;
  fileUploaded = false;
  // New properties for custom reason
  otherReason: string = ''; // Holds custom reason input
  isOtherReasonVisible: boolean = false; // Tracks visibility of other reason input
  previousVisitorData: any | null = null; // New property to store previous visitor data
  // ML Model and properties (WASM & Model provided by Google, you can place your own).
  faceLandmarker!: FaceLandmarker;
  wasmUrl: string =
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
  modelAssetPath: string =
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
  video!: HTMLVideoElement;
  canvasElement!: HTMLCanvasElement;
  canvasCtx!: CanvasRenderingContext2D;
  showingPreview: boolean = false;
  userDidBlink: boolean = false;
  tracking: any;
  lastVideoTime: number = -1;
  // Subjects for debouncing
  private nameChanged: Subject<string> = new Subject();
  private surnameChanged: Subject<string> = new Subject();

  constructor(
    private popup: PopupService,
    private renderer: Renderer2,
    private router: Router,
    private ToastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient
  ) {
    // Set up debouncing for name input
    this.nameChanged.pipe(debounceTime(500)).subscribe((value) => {
      this.checkPreviousSignIn();
    });
    // Set up debouncing for surname input
    this.surnameChanged.pipe(debounceTime(500)).subscribe((value) => {
      this.checkPreviousSignIn();
    });
  }
  // Method called when POPIA acceptance changes
  onPOPIAAccepted(accepted: boolean) {
    // this.accepted_popia = accepted;
    this.accepted_popia = accepted;
    if (accepted) {
      this.enableFormFields();
      this.hideModal();
    }
  }

  async ngOnInit(): Promise<void> {
    try {
      this.faceLandmarker = await FaceLandmarker.createFromOptions(
        await FilesetResolver.forVisionTasks(this.wasmUrl),
        {
          baseOptions: { modelAssetPath: this.modelAssetPath, delegate: 'GPU' },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
        }
      );
    } catch (error) {
      console.error('Failed to initialize FaceLandmarker:', error);
    }
  }

  // Display a popup to prompt the user
  showReadyPopup(): Promise<boolean> {
    return new Promise((resolve) => {
      // Create and display a custom popup dialog
      const confirmation = confirm(
        'Please be ready for face capture. Hold your device upright and click OK when you are ready.'
      );
      resolve(confirmation); // Resolve promise based on user action
    });
  }

  async startTracking() {
    const userReady = await this.showReadyPopup(); // Wait for user confirmation
    if (!userReady) return; // If the user didn't confirm, exit the function

    this.tracking = true; // Set tracking to true

    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      console.warn('User media or ML model is not available');
      this.ToastService.presentErrorToast(
        'Media devices are not supported on this browser.'
      );
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'user', // Use the front camera
        },
      })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.addEventListener('loadeddata', () => {
          this.predictWebcam(); // Start predicting once video is loaded
        });
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
        this.ToastService.presentErrorToast(
          'Could not access camera. Please check permissions.'
        );
      });
  }

  // Predict the webcam feed and capture the image
  async predictWebcam() {
    if (!this.tracking) return;

    this.canvasElement.width = this.video.videoWidth;
    this.canvasElement.height = this.video.videoHeight;

    try {
      const results = await this.faceLandmarker.detectForVideo(
        this.video,
        Date.now()
      );

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const drawingUtils = new DrawingUtils(this.canvasCtx!);
        results.faceLandmarks.forEach((landmarks) => {
          [
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          ].forEach((type, i) =>
            drawingUtils.drawConnectors(landmarks, type, {
              color: '#C0C0C070',
              lineWidth: i === 0 ? 1 : 4,
            })
          );
        });

        // Automatically capture image when face is detected
        this.captureImageFromCamera();
      }
    } catch (error) {
      console.error('Error processing video frame:', error);
    }

    if (this.tracking) {
      window.requestAnimationFrame(() => this.predictWebcam());
    }
  }

  // Capture image from the camera
  captureImageFromCamera() {
    this.canvasCtx?.drawImage(
      this.video,
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
    this.selfie = this.canvasElement.toDataURL('image/jpeg'); // Store the captured image

    console.log('Picture captured successfully');
    this.ToastService.presentSuccessToast(
      'Face Detection successful. You can now use this image.'
    );
    this.stopTracking(); // Stop tracking after capturing the image
  }

  // Handle name input change to trigger debounce
  handleNameInputChange() {
    this.nameChanged.next(this.name);
  }

  // Handle surname input change to trigger debounce
  handleSurnameInputChange() {
    this.surnameChanged.next(this.surname);
  }

  async checkPreviousSignIn() {
    // Check if both name and surname are provided
    if (this.name.trim() && this.surname.trim()) {
      try {
        const response = await this.http
          .get<{ hasSignedIn?: boolean }>(
            `https://hades.mabbureau.com/recur?name=${this.name}&surname=${this.surname}`
          )
          .toPromise();

        console.log('Response from server:', response);

        const result = await response;

        if (response) {
          // Use the popup service to show the confirm dialog
          const userConfirmed = await this.popup.presentConfirmDialog(
            'Previous Sign-In Detected',
            'You have previously signed in with these details. Would you like to use the previous information?'
          );

          if (userConfirmed) {
            // User clicked OK, populate the form with the retrieved details
            this.populateFormWithPreviousDetails(response);
          } else {
            // User clicked Cancel, let them continue filling in the form manually
            console.log('User chose to continue filling in manually');
          }
        }
      } catch (error) {
        console.error('Error checking previous sign-in:', error);
        this.ToastService.presentErrorToast(
          'An error occurred while checking previous sign-in. Please try again.'
        );
      }
    }
  }

  populateFormWithPreviousDetails(details: any) {
    if (details) {
      this.email = details.email || '';
      this.contact = details.contact || '';
      this.organization = details.organization || '';
      this.idn = details.idn || '';
      console.log('Form populated with previous details:', details);
    }
  }

  // Stop camera and clear video & canvas
  stopTracking() {
    this.tracking = false;

    if (this.video.srcObject) {
      (this.video.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }

    this.video.srcObject = null;
    this.canvasCtx?.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
    console.log('Tracking stopped.');
  }

  // This method gets called when the purpose of the visit changes
  onPurposeChange() {
    this.isOtherReasonVisible = this.purpose === 'Other';
  }

  isEmailValid(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Validate form fields
  isFormValid(): boolean {
    return (
      this.name.trim() !== '' &&
      this.surname.trim() !== '' &&
      this.contact.trim().length === 10 && // Adjust length check as needed
      this.idn.trim().length === 13 &&
      this.email.trim() !== '' &&
      this.purpose.trim() !== '' &&
      (this.purpose !== 'Other' || this.otherReason.trim() !== '') &&
      this.organization.trim() !== '' && // Ensure organization is not empty
      // this.acceptedPOPIA
      this.accepted_popia // Ensure POPIA is accepted
    );
  }

  // Handle form submission
  async onSubmit() {
    // Check if the user accepted the POPIA terms
    if (!this.accepted_popia) {
      this.ToastService.presentErrorToast(
        'You must accept the POPIA terms to proceed.'
      );
      return;
    }

    // Trim contact number to 10 digits and validate length
    if (this.contact.length > 10) {
      this.contact = this.contact.substring(0, 10);
    } else if (this.contact.length < 10) {
      this.ToastService.presentErrorToast(
        'Invalid Contact: Must contain exactly 10 digits'
      );
      return;
    }

    // Validate form fields, including selfie and signature
    if (!this.validateForm()) {
      return; // Stop submission if validation fails
    }

    // Determine the reason for the visit
    const reasonForVisit =
      this.purpose === 'Other' ? this.otherReason : this.purpose;

    const date_of_entry = new Date().toISOString(); // Use ISO format for date

    // Prepare the visitor data object
    const visitorData = {
      name: this.name,
      surname: this.surname,
      contact: this.contact,
      email: this.email,
      idn: this.idn,
      purpose: reasonForVisit,
      organization: this.organization,
      signature: this.signature, // Ensure signature is captured
      selfie: this.selfie, // Ensure selfie is captured
      accepted_popia: this.accepted_popia,
      date_of_entry, // Include date_of_entry in visitor data
    };

    // Log selfie and signature images for debugging
    console.log('Selfie Image:', this.selfie);
    console.log('Signature Image:', this.signature);

    try {
      // Make the HTTP POST request to the backend
      const response = await this.http
        .post('https://hades.mabbureau.com/checkin', visitorData)
        .toPromise();
      console.log('Visitor data submitted successfully:', response);

      // Show success modal
      this.showSuccessModal();

      // Show success toast
      this.ToastService.presentSuccessToast(
        'Visitor data submitted successfully!'
      );

      // Navigate to home after a delay
      setTimeout(() => {
        this.router.navigate(['/home']); // Adjust the delay as needed
      }, 2000); // 2 seconds delay before navigating
    } catch (err) {
      console.error('Error submitting visitor data:', err);
      this.ToastService.presentErrorToast(
        'An error occurred while submitting data. Please try again.'
      );
    }
  }

  // Validation for the form fields including selfie and signature
  private validateForm(): boolean {
    let isValid = true;

    // List of required fields with their respective error messages
    const validations = [
      { condition: !this.name.trim(), message: 'Name is required.' },
      { condition: !this.surname.trim(), message: 'Surname is required.' },
      {
        condition: !this.contact.trim() || this.contact.length !== 10,
        message: 'Contact number must be exactly 10 digits.',
      },
      { condition: !this.email.trim(), message: 'Email Address is required.' },
      { condition: !this.idn.trim(), message: 'ID number is required.' },
      {
        condition: !this.purpose.trim(),
        message: 'Purpose of Visit is required.',
      },
      {
        condition: this.purpose === 'Other' && !this.otherReason.trim(),
        message: 'Please specify the Other Reason.',
      },
      {
        condition: !this.organization.trim(),
        message: 'Organization is required.',
      },
      {
        condition: !this.selfie,
        message: 'Selfie is required. Please upload or capture a selfie.',
      },
      {
        condition: !this.signature,
        message: 'Signature is required. Please provide your signature.',
      },
    ];

    // Loop through validations and show error messages
    validations.forEach((validation) => {
      if (validation.condition) {
        this.ToastService.presentErrorToast(validation.message);
        isValid = false;
      }
    });

    return isValid;
  }

  // Check for empty fields if submit button is clicked when disabled
  checkForEmptyFields() {
    const emptyFields = [];

    if (!this.name.trim()) emptyFields.push('Name');
    if (!this.surname.trim()) emptyFields.push('Surname');
    if (!this.contact.trim() || this.contact.length !== 10)
      emptyFields.push('Contact number');
    if (!this.email.trim()) emptyFields.push('Email Address');
    if (!this.idn.trim()) emptyFields.push('ID number');
    if (!this.purpose.trim()) emptyFields.push('Purpose of Visit');
    if (this.purpose === 'Other' && !this.otherReason.trim())
      emptyFields.push('Other Reason');
    if (!this.organization.trim()) emptyFields.push('Organization');
    if (!this.selfie) emptyFields.push('Selfie');
    if (!this.signature) emptyFields.push('Signature');

    if (emptyFields.length > 0) {
      this.ToastService.presentErrorToast(
        `Please fill in the following fields: ${emptyFields.join(', ')}.`
      );
    }
  }

  ngAfterViewInit() {
    this.showModal();
    this.setupCanvas();
    this.video = document.getElementById('user-video') as HTMLVideoElement;
    this.canvasElement = document.getElementById(
      'user-canvas'
    ) as HTMLCanvasElement;
    this.canvasCtx = this.canvasElement.getContext(
      '2d'
    ) as CanvasRenderingContext2D;

    const acceptButton = document.getElementById('acceptPOPIA');
    const cancelButton = document.querySelector('.btn-secondary');
    const closeButton = document.querySelector('.btn-close');

    if (acceptButton) {
      acceptButton.addEventListener('click', () => this.onPOPIAAccepted(true));
    }
    if (cancelButton) {
      cancelButton.addEventListener('click', () => this.handleCancelOrClose());
    }
    if (closeButton) {
      closeButton.addEventListener('click', () => this.handleCancelOrClose());
    }

    this.cdRef.detectChanges();
  }

  // Show popups
  showModal() {
    const modal = document.getElementById('popiaModal');
    if (modal) {
      this.renderer.addClass(modal, 'show');
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      this.cdRef.detectChanges();
    }
  }

  // Hide the pop up from the screen
  hideModal() {
    const modal = document.getElementById('popiaModal');
    if (modal) {
      this.renderer.removeClass(modal, 'show');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Enable form fields
  enableFormFields() {
    const formFields = document.querySelectorAll('.form-control');
    formFields.forEach((field) => {
      (field as HTMLInputElement).disabled = false;
    });
  }

  // Handling the close and cancel clicks
  async handleCancelOrClose() {
    await this.router.navigateByUrl('/home', {
      state: { message: 'POPIA terms must be accepted to continue.' },
    });
  }

  ngOnDestroy() {
    this.cleanupEventListeners();
    this.navigationSubscription?.unsubscribe();
  }

  // Cleanup event listeners
  private cleanupEventListeners() {
    const acceptButton = document.getElementById('acceptPOPIA');
    const cancelButton = document.querySelector('.btn-secondary');
    const closeButton = document.querySelector('.btn-close');

    if (acceptButton) {
      acceptButton.removeEventListener('click', () =>
        this.onPOPIAAccepted(true)
      );
    }
    if (cancelButton) {
      cancelButton.removeEventListener('click', () =>
        this.handleCancelOrClose()
      );
    }
    if (closeButton) {
      closeButton.removeEventListener('click', () =>
        this.handleCancelOrClose()
      );
    }
  }

  // Setup for the canvas
  private setupCanvas() {
    this.canvas = document.getElementById(
      'signatureCanvas'
    ) as HTMLCanvasElement;
    if (!this.canvas) return; // Ensure canvas element exists
    this.ctx = this.canvas.getContext('2d')!;

    this.canvas.width = 340; // Set your desired width
    this.canvas.height = 150; // Set your desired height
    this.ctx.lineWidth = 2; // Set line width
    this.ctx.lineCap = 'round'; // Round line caps
    this.ctx.strokeStyle = 'black'; // Line color

    // Setup pointer event listeners for drawing
    this.canvas.addEventListener('pointerdown', (event) =>
      this.startDrawing(event)
    );
    this.canvas.addEventListener('pointermove', (event) => this.draw(event));
    this.canvas.addEventListener('pointerup', () => this.stopDrawing());
    this.canvas.addEventListener('pointerout', () => this.stopDrawing());

    // Optional: Prevent scrolling when drawing on mobile devices
    this.canvas.addEventListener(
      'touchstart',
      (event) => event.preventDefault(),
      { passive: false }
    );
    this.canvas.addEventListener(
      'touchmove',
      (event) => event.preventDefault(),
      { passive: false }
    );
  }

  // Start drawing on the canvas
  private startDrawing(event: PointerEvent) {
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(
      event.clientX - this.canvas.getBoundingClientRect().left,
      event.clientY - this.canvas.getBoundingClientRect().top
    );
  }

  // Draw on the canvas
  private draw(event: PointerEvent) {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left; // Calculate x position
    const y = event.clientY - rect.top; // Calculate y position

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  // Example for capturing signature
  stopDrawing() {
    this.isDrawing = false;
    this.ctx.closePath();
    // Capture signature image when drawing stops
    this.signature = this.canvas.toDataURL(); // Ensure this captures the signature
    console.log('Signature image data:', this.signature); // Debugging line
  }

  // Show success modal
  async showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
      this.renderer.addClass(modal, 'show');
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      this.cdRef.detectChanges();
    }
  }
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  presentSuccessToast() {
    // Automatically redirect to the saved details page after 3 seconds
    setTimeout(() => {
      this.redirectToSavedDetails();
    }, 3000);
  }

  redirectToSavedDetails() {
    // Redirect to the saved details page
    this.router.navigate(['/home']);
  }

  handleBackNavigation() {
    // Navigate to the visitor registration page with a forced refresh
    this.router
      .navigate(['/visitor-registration'], { replaceUrl: true })
      .then(() => {
        window.location.reload();
      });
  }
}
