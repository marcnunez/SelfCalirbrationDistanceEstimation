# SelfCalibrationDistanceEstimation

SelfCalibrationDistanceEstimation is a lightweight JavaScript tool for real-time distance estimation directly in the browser.  
It runs efficiently on low-end devices like old laptops and smartphones using basic webcams.

The system uses anthropometric features (standard human body measurements) to automatically calibrate the camera (focal length estimation) and applies MediaPipe via WebAssembly to detect body landmarks. Once calibrated, it infers distances in real-time without requiring any external servers.

## Features

- 📷 **Automatic Camera Calibration**  
  Estimates focal length using human body proportions.

- 🖥️ **Runs on Low-End Devices**  
  Optimized for performance on old laptops, smartphones, and low-resolution webcams.

- 🚀 **Real-Time Inference**  
  Fast landmark detection and distance estimation with low CPU and memory overhead.

- 🛡️ **Fully Client-Side**  
  No data is sent to a server — everything runs inside the browser.

- 🛠️ **Technologies Used**  
  - JavaScript (vanilla)
  - MediaPipe (compiled to WebAssembly)

## How It Works

1. **Self-Calibration**  
   Anthropometric features (e.g., shoulder width, arm length) are used to compute the camera's focal length based on the user's body.

2. **Landmark Detection**  
   MediaPipe detects key body points via WebAssembly for efficient real-time inference.

3. **Distance Estimation**  
   Using the calibrated focal length and landmark positions, distances from the camera to body parts are estimated.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/SelfCalibrationDistanceEstimation.git
   cd SelfCalibrationDistanceEstimation
   ```

2. Serve the files using a local server (for example using `live-server`):
   ```bash
   npm install -g live-server
   live-server
   ```

3. Open the page in your browser and allow webcam access.

## Usage

- Stand in front of the webcam.
- The system will guide you through the self-calibration step.
- Once calibrated, move around and observe real-time distance estimates displayed on the screen.

## Requirements

- A device with a basic webcam
- A modern browser that supports WebAssembly (Chrome, Firefox, Edge)

## Demo

[Insert demo link here if available, e.g., GitHub Pages or Vercel]

## License

This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for more details.

## Credits

- [MediaPipe](https://mediapipe.dev/) for body landmark detection.
- Based on monocular distance estimation methods using anthropometry.

## TODO

- Improve calibration robustness for different body types
- Add multi-landmark smoothing
- Optimize UI for mobile devices
