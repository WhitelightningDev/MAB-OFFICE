import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; // Import testing utilities from Angular core
import { IonicModule } from '@ionic/angular'; // Import IonicModule to handle Ionic components in tests

import { SelfieModalComponent } from './selfie-modal.component'; // Import the component to be tested

describe('SelfieModalComponent', () => {
  // Describe the test suite for SelfieModalComponent
  let component: SelfieModalComponent; // Declare a variable for the component instance
  let fixture: ComponentFixture<SelfieModalComponent>; // Declare a fixture to create the component instance

  // Configure the testing module before each test
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SelfieModalComponent], // Declare the component to be tested
      imports: [IonicModule.forRoot()], // Import IonicModule for proper handling of Ionic components
    }).compileComponents(); // Compile the components in the test module

    fixture = TestBed.createComponent(SelfieModalComponent); // Create an instance of the SelfieModalComponent
    component = fixture.componentInstance; // Get the component instance from the fixture
    fixture.detectChanges(); // Trigger change detection to initialize the component
  }));

  // Test case to check if the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy(); // Expect the component instance to be truthy (exists)
  });
});
