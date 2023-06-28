# CloudFront Signed URL Bootleg

This is a simple implementation of asset security using CloudFront signed URLs. It allows you to generate signed URLs for accessing protected assets through CloudFront.

## Installation

1. Install the required dependencies by running the following command:

   ```
   npm install node-forge express
   ```

2. Generate Key Set by running the `generate-key-set.js` script:

   ```
   node generate-key-set.js
   ```

## Usage

1. Start the server by running the following command:

   ```
   node index.js
   ```

2. Make a request using Postman:

   - Set the URL to `http://localhost:3500/signurl`
   - Set the request body to:

     ```
     {"url": "http://localhost:3500/images.jpg"}
     ```

3. Copy the signed URL from the response and paste it into your browser to access the protected asset.

## Notes

- This implementation provides a basic demonstration of CloudFront signed URLs and should not be used in production environments without proper security measures and considerations.
- Ensure that your CloudFront distribution is properly configured with the appropriate origin and behaviors.
- Customize the server and URL signing logic according to your specific requirements.

Feel free to modify and enhance this project based on your needs.

## License

This project is licensed under the [MIT License](LICENSE).