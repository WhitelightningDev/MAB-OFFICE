import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; // Import testing utilities from Angular core
import { IonicModule } from '@ionic/angular'; // Import IonicModule for testing Ionic components

import { SavedDetailsComponent } from './saved-details.component'; // Import the component to be tested

describe('SavedDetailsComponent', () => {
  // Describe the test suite for SavedDetailsComponent
  let component: SavedDetailsComponent; // Declare a variable for the component instance
  let fixture: ComponentFixture<SavedDetailsComponent>; // Declare a fixture to create the component instance

  // Configure the testing module before each test
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SavedDetailsComponent], // Declare the component to be tested
      imports: [IonicModule.forRoot()], // Import IonicModule for proper Ionic component handling
    }).compileComponents(); // Compile the components

    fixture = TestBed.createComponent(SavedDetailsComponent); // Create an instance of the component
    component = fixture.componentInstance; // Get the component instance from the fixture
    fixture.detectChanges(); // Trigger change detection to initialize the component
  }));

  // Test case to check if the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy(); // Expect the component instance to be truthy (exists)
  });
});
