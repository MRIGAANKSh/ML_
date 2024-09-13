import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";

const FaceLivenessDetection = () => {
  const webcamRef = useRef(null);
  const [model, setModel] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true); // Initially set loading to true

  // Load the model when the component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Loading model...");
        const loadedModel = await tf.loadGraphModel("/model/model.json");
        setModel(loadedModel);
        console.log("Model loaded successfully");
        setLoading(false); // Set loading to false once model is loaded
      } catch (error) {
        console.error("Error loading model:", error);
        setLoading(false); // Stop loading if there's an error
      }
    };

    loadModel();
  }, []);

  const captureImage = async () => {
    if (!model) {
      alert("Model is not loaded yet!");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    const imgElement = document.createElement("img");
    imgElement.src = imageSrc;

    imgElement.onload = async () => {
      const imgTensor = tf.browser
        .fromPixels(imgElement)
        .resizeNearestNeighbor([128, 128]) // Input size specified by the model
        .toFloat()
        .div(255.0) // Normalize the image
        .expandDims(0); // Add batch dimension

      const prediction = await model.predict(imgTensor);
      const result = prediction.dataSync()[0]; // Since the model outputs a probability

      setResult(result > 0.5 ? "Real Face" : "Fake Face"); // Adjust the threshold as needed
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Face Liveness Detection</h1>
      {loading ? (
        <p>Loading model, please wait...</p>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-lg shadow-lg"
          />
          <button
            className="mt-5 bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={captureImage}
          >
            Scan Face
          </button>
          {result && <p className="mt-5 text-xl font-semibold">{result}</p>}
        </>
      )}
    </div>
  );
};

export default FaceLivenessDetection;
