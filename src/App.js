import React, { useState, useEffect } from "react";
import Webcam from "react-webcam";
import "./App.css";
import { Amplify, API } from 'aws-amplify';
import awsmobile from './aws-exports';

Amplify.configure(awsmobile);

const App = () => {
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [labels, setLabels] = useState([]);
  const [image, setImage] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [data, setPostData] = useState({ body: {}, headers: {} });
  const [facingMode, setFacingMode] = useState("user"); // "user" for front camera, "environment" for back camera

  const [resp, setResp] = React.useState("");

  const captureNew = async () => {
    setIsCapturing(true);

    const screenshot = webcamRef.current.getScreenshot();

    if (screenshot) {
      setImage(screenshot);

      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    } else {
      console.log("Invalid image format. Please capture a PNG or JPEG image.");
    }

    setIsCapturing(false);
  };

  const handleUploadNew = () => {
    setIsUploading(true);

    const data = JSON.stringify({ base64Data: image, coordinates: JSON.stringify(location) });

    fetch('https://00ngobjr57.execute-api.us-east-1.amazonaws.com/dev/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          console.log(data);
          setLabels(data.labels);
        } else {
          console.error('Upload failed: ' + data.message);
        }
      })
      .catch((error) => {
        console.error('An error occurred:', error);
      });

    setIsUploading(false);
  };

  const webcamRef = React.useRef(null);

  // Function to toggle between the front and back camera
  const toggleCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  return (
    <div className="app-container">
      <h3>Image </h3>
      <h3>Classification </h3>
      <div className="container">
        <div className="webcam-container">
          <Webcam
            audio={false}
            screenshotFormat="image/jpeg"
            height={200}
            width={200}
            ref={webcamRef}
            videoConstraints={{
              facingMode,
            }}
          />

          <button onClick={captureNew} disabled={isCapturing || isUploading}>
            Capture
          </button>
          <button onClick={handleUploadNew} disabled={isCapturing || isUploading}>
            Upload
          </button>
          <button onClick={toggleCamera} disabled={isCapturing || isUploading}>
            Toggle Camera
          </button>
        </div>
      </div>
      {/* Rest of your code remains the same */}
    </div>
  );
};

export default App;
