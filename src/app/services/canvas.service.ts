import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  private isDrawing = false;
  private ctx!: CanvasRenderingContext2D;
  private canvas!: HTMLCanvasElement;

  // Setup for the canvas
  setupCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    onSignatureCaptured: (signature: string | null) => void
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.canvas = canvas;

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
    this.canvas.addEventListener('pointerup', () =>
      this.stopDrawing(onSignatureCaptured)
    );
    this.canvas.addEventListener('pointerout', () =>
      this.stopDrawing(onSignatureCaptured)
    );

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
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  // Stop drawing and capture the signature image
  stopDrawing(onSignatureCaptured: (signature: string | null) => void) {
    this.isDrawing = false;
    this.ctx.closePath();
    // Capture the signature
    const signatureImage = this.canvas.toDataURL('image/png');
    onSignatureCaptured(signatureImage);
  }

  // Handle selfie input change
  handleSelfie(file: File, callback: (selfie: string | null) => void) {
    if (!file.type.startsWith('image/')) {
      console.error('Not a valid image file');
      callback(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = (loadEvent) => {
      callback(loadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  // Cleanup listeners
  cleanupEventListeners() {
    // Implement cleanup if necessary
  }
}
