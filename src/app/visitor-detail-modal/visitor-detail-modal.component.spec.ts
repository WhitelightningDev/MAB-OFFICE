import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; // Import necessary testing utilities from Angular
import { IonicModule } from '@ionic/angular'; // Import IonicModule to handle Ionic components in tests

import { VisitorDetailModalComponent } from './visitor-detail-modal.component'; // Import the component to be tested

describe('VisitorDetailModalComponent', () => {
  // Define the test suite for VisitorDetailModalComponent
  let component: VisitorDetailModalComponent; // Variable to hold the instance of the component
  let fixture: ComponentFixture<VisitorDetailModalComponent>; // Variable for the fixture that creates the component instance

  // Set up the testing module before each test case
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VisitorDetailModalComponent], // Declare the component to be tested
      imports: [IonicModule.forRoot()], // Import IonicModule for proper handling of Ionic components
    }).compileComponents(); // Compile the components in the test module

    fixture = TestBed.createComponent(VisitorDetailModalComponent); // Create an instance of the component
    component = fixture.componentInstance; // Get the component instance from the fixture
    fixture.detectChanges(); // Trigger change detection to initialize the component
  }));

  // Test case to check if the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy(); // Expect the component instance to be truthy (exists)
  });
});
