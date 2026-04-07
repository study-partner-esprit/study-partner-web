import React, { useRef, useEffect, useState } from "react";
import "./WebcamCapture.css";

const WebcamCapture = ({
  onFrameCapture,
  captureInterval = 2000,
  enabled = true,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (enabled) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [enabled]);

  useEffect(() => {
    if (isStreaming && enabled) {
      startFrameCapture();
    } else {
      stopFrameCapture();
    }

    return () => {
      stopFrameCapture();
    };
  }, [isStreaming, enabled, captureInterval]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      // Provide clearer guidance depending on the failure reason
      if (typeof window !== "undefined" && !window.isSecureContext) {
        setError(
          "Camera access requires a secure context (HTTPS). If you're connecting over a LAN address (http://...), open the app over HTTPS or use a secure tunnel (e.g., ngrok).",
        );
      } else if (
        err &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
      ) {
        // If user denied, check Permissions API to give more actionable guidance
        try {
          if (navigator.permissions) {
            const p = await navigator.permissions.query({ name: "camera" });
            if (p.state === "denied") {
              setError(
                "Camera permission is blocked. Open your browser's site settings (click the padlock in the address bar) and allow Camera for this site, then retry.",
              );
            } else {
              setError(
                "Camera permissions denied. Please allow camera access in your browser settings.",
              );
            }
          } else {
            setError(
              "Camera permissions denied. Please allow camera access in your browser settings.",
            );
          }
        } catch (pe) {
          setError(
            "Camera permissions denied. Please allow camera access in your browser settings.",
          );
        }
      } else if (err && err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Unable to access webcam. Please grant camera permissions.");
      }
      setIsStreaming(false);
    }
  };

  const copyEnableCameraInstructions = async () => {
    const text =
      "Enable Camera: click the padlock (site controls) → Site settings → Camera → Allow. In Chrome you can also go to chrome://settings/content/camera.";
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // ignore clipboard failures
    }
    // show a brief hint via the error area
    setError(
      "Permission instructions copied to clipboard. Follow them to enable the camera.",
    );
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const startFrameCapture = () => {
    stopFrameCapture(); // Clear any existing interval

    intervalRef.current = setInterval(() => {
      captureFrame();
    }, captureInterval);
  };

  const stopFrameCapture = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob && onFrameCapture) {
          onFrameCapture(blob);
        }
      },
      "image/jpeg",
      0.8,
    );
  };

  return (
    <div className="webcam-capture">
      {error && (
        <div className="webcam-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <div className="webcam-error-actions">
            <button
              className="retry-button"
              onClick={() => {
                // Retry requesting camera permission
                startWebcam();
              }}
            >
              Retry
            </button>
            <button
              className="instructions-button"
              onClick={() => copyEnableCameraInstructions()}
            >
              How to enable
            </button>
          </div>
        </div>
      )}

      <div className={`webcam-container ${isStreaming ? "streaming" : ""}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          data-testid="webcam-video"
          className="webcam-video"
        />
        <canvas
          ref={canvasRef}
          data-testid="webcam-canvas"
          style={{ display: "none" }}
        />

        {isStreaming && (
          <div className="webcam-indicator">
            <div className="recording-dot"></div>
            <span>Monitoring</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
