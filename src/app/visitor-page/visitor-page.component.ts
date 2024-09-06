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
import { Observable, Subscription } from 'rxjs';
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
  // Facial recognition declarations
  video!: HTMLVideoElement;
  canvasElement!: HTMLCanvasElement;
  canvasCtx!: CanvasRenderingContext2D;
  // A state to toggle functionality.
  showingPreview: boolean = false;
  // A challenge state for the user.
  userDidBlink: boolean = false;
  tracking: any;
  lastVideoTime: number = -1; // Added here to track the last video tim

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private ToastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient // Inject HttpClient
  ) {}

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
    this.faceLandmarker = await FaceLandmarker.createFromOptions(
      await FilesetResolver.forVisionTasks(this.wasmUrl),
      {
        baseOptions: { modelAssetPath: this.modelAssetPath, delegate: 'GPU' },
        outputFaceBlendshapes: true, // We will draw the face mesh in canvas.
        runningMode: 'VIDEO',
      }
    ); // When FaceLandmarker is ready, you'll see in the console: Graph successfully started running.
  }

  // Handles selfie input change
  handleSelfieChange(event: Event) {
    // Start camera tracking
    this.startTracking();

    const input = event.target as HTMLInputElement;

    // Check if file was uploaded
    if (input.files && input.files.length > 0) {
      this.fileUploaded = true; // Set flag to true when a file is uploaded
      const file = input.files[0];

      // Validate if the file is an image
      if (!file.type.startsWith('image/')) {
        this.ToastService.presentErrorToast(
          'Invalid file type. Please upload a valid image file.'
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = (loadEvent) => {
        const img = new Image();
        img.src = loadEvent.target?.result as string;
        img.onload = () => {
          this.processSelfie(img); // Process the selfie image
        };
      };
      reader.readAsDataURL(file);
    } else {
      this.ToastService.presentInfoToast(
        'No file selected. Please choose an image.'
      );
    }
  }

  // Handle the case where user clicks the selfie button but doesn't upload a file
  handleSelfieButtonClick() {
    this.fileUploaded = false; // Reset fileUploaded flag when button is clicked

    setTimeout(() => {
      if (!this.fileUploaded) {
        this.ToastService.presentErrorToast(
          'No file uploaded. Please try again.'
        );
      }
    }, 5000); // 5 second delay to check if file was uploaded
  }

  // Process the selfie with the faceLandmarker
  async processSelfie(img: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Check for face landmarks in the selfie
      try {
        const results = await this.faceLandmarker.detectForVideo(
          canvas,
          Date.now()
        );

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const drawingUtils = new DrawingUtils(ctx);
          for (const landmarks of results.faceLandmarks) {
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
          }

          // Convert canvas to base64
          this.selfie = canvas.toDataURL('image/jpeg'); // Save selfie image
          console.log('Selfie captured and processed successfully');
          this.ToastService.presentSuccessToast(
            'Selfie captured and processed successfully.'
          );
        } else {
          console.warn('No face detected in the selfie.');
          this.ToastService.presentErrorToast(
            'No face detected in the selfie. Please try again.'
          );
        }
      } catch (error) {
        console.error('Error processing selfie:', error);
        this.ToastService.presentErrorToast(
          'Error processing selfie. Please try again.'
        );
      }
    } else {
      console.error('Failed to get canvas context');
      this.ToastService.presentErrorToast(
        'Unable to process the image. Please try again.'
      );
    }
  }

  // Start camera and automatically track for face detection
  async startTracking() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
    });

    this.video.srcObject = stream;
    this.video.play(); // Start playing the video

    this.video.addEventListener('loadeddata', () => {
      this.detectFaceAndCaptureImage(); // Start detecting face
    });

    this.tracking = true; // Set tracking to true
    console.log('Camera access granted.');
    this.ToastService.presentSuccessToast(
      'Camera access granted. Please position your face within the frame.'
    );
  }

  // Detect face and automatically capture image
  detectFaceAndCaptureImage = async () => {
    if (!this.tracking) return;

    this.canvasElement.width = this.video.videoWidth;
    this.canvasElement.height = this.video.videoHeight;

    try {
      const results = await this.faceLandmarker.detectForVideo(
        this.video,
        Date.now()
      );

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        console.log('Face detected. Capturing image...');
        this.captureImageFromCamera();
      } else {
        console.warn('No face detected.');
        this.ToastService.presentErrorToast(
          'No face detected. Please ensure your face is clearly visible.'
        );
      }
    } catch (error) {
      console.error('Face detection error:', error);
      this.ToastService.presentErrorToast(
        'Face detection failed. Please try again.'
      );
    }

    if (this.tracking) {
      window.requestAnimationFrame(this.detectFaceAndCaptureImage);
    }
  };

  // Capture image from the camera
  captureImageFromCamera() {
    // Draw the current video frame onto the canvas
    this.canvasCtx.drawImage(
      this.video,
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    // Convert canvas to base64 (captured image)
    const capturedImage = this.canvasElement.toDataURL('image/jpeg');
    this.selfie = capturedImage; // Store the captured image

    console.log('Picture captured successfully');
    this.ToastService.presentSuccessToast(
      'Picture captured successfully. You can now use this image.'
    );

    this.stopTracking(); // Stop tracking after capturing the image
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
    this.canvasCtx.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
    console.log('Tracking stopped.');
    this.ToastService.presentErrorToast(
      'Tracking stopped. You can take another selfie if needed.'
    );
  }

  // This method gets called when the purpose of the visit changes
  onPurposeChange() {
    this.isOtherReasonVisible = this.purpose === 'Other';
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
  onSubmit() {
    // Check if the user accepted the POPIA terms
    if (!this.accepted_popia) {
      this.ToastService.presentErrorToast(
        'You must accept the POPIA terms to proceed.'
      );
      return;
    }

    // Trim contact number to 10 digits
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
    };

    // Log selfie and signature images for debugging
    console.log('Selfie Image:', this.selfie);
    console.log('Signature Image:', this.signature);

    // Make the HTTP POST request to the backend
    this.http
      .post('https://hades.mabbureau.com/checkin', visitorData)
      .subscribe({
        next: (response) => {
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
        },
        error: (err) => {
          console.error('Error submitting visitor data:', err);
          this.ToastService.presentErrorToast(
            'An error occurred while submitting data. Please try again.'
          );
        },
      });
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
