package mab.office;

import com.getcapacitor.BridgeActivity;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.net.ssl.HttpsURLConnection;

import java.net.URL;
import java.security.cert.X509Certificate;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

  public MainActivity() {
    super();
    trustAllCertificates();
  }

  private void trustAllCertificates() {
    TrustManager[] trustAllCerts = new TrustManager[]{
      new X509TrustManager() {
        public X509Certificate[] getAcceptedIssuers() {
          return new X509Certificate[]{};
        }

        public void checkClientTrusted(X509Certificate[] certs, String authType) {}

        public void checkServerTrusted(X509Certificate[] certs, String authType) {}
      }
    };

    try {
      SSLContext sc = SSLContext.getInstance("SSL");
      sc.init(null, trustAllCerts, new java.security.SecureRandom());
      HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  // Method to perform an HTTP/HTTPS request
  public String performHttpRequest(String requestUrl, String requestMethod, String requestBody) {
    StringBuilder response = new StringBuilder();
    HttpsURLConnection connection = null;

    try {
      URL url = new URL(requestUrl);
      connection = (HttpsURLConnection) url.openConnection();
      connection.setRequestMethod(requestMethod);
      connection.setDoOutput(true);
      connection.setRequestProperty("Content-Type", "application/json");

      // Send request body if provided
      if (requestBody != null && !requestBody.isEmpty()) {
        try (OutputStream os = connection.getOutputStream()) {
          byte[] input = requestBody.getBytes("utf-8");
          os.write(input, 0, input.length);
        }
      }

      // Read response
      int statusCode = connection.getResponseCode();
      BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
      String inputLine;
      while ((inputLine = in.readLine()) != null) {
        response.append(inputLine);
      }
      in.close();

      // Log the response code and message
      System.out.println("Response Code: " + statusCode);
      System.out.println("Response: " + response.toString());

      // Return response
      return response.toString();
    } catch (IOException e) {
      // Log error details
      System.err.println("Error during HTTP request:");
      System.err.println("Request URL: " + requestUrl);
      System.err.println("Request Method: " + requestMethod);
      System.err.println("Request Body: " + requestBody);
      System.err.println("Exception Message: " + e.getMessage());
      e.printStackTrace();
      return null;
    } finally {
      if (connection != null) {
        connection.disconnect();
      }
    }
  }
}
