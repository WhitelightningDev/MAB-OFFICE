import { Title } from '@angular/platform-browser'; // Import Title service for setting the document title

// Define the PrivacyPolicy object
export const PrivacyPolicy = {
  title: 'Privacy Policy', // The title of the privacy policy
  content: `
    Our platform collects personal information when you sign in at a location, such as your name, email, and location data. We use this information to provide and enhance our services, communicate with you, and ensure a better user experience.

    We may share your data with trusted third parties for service purposes or if required by law. We implement robust security measures to protect your data and comply with privacy laws. You have the right to access, correct, or delete your information and can manage your preferences for cookies and tracking technologies.

    For any questions about our privacy practices, you can contact us directly.
  `, // The content of the privacy policy as a multi-line string
};
