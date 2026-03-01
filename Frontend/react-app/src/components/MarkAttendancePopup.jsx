import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, AlertCircle, Camera, CheckCircle } from "lucide-react";
import axios from "axios";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

const BASE_URL = "http://localhost:8080";

const MarkAttendancePopup = ({ isOpen, onClose, event, token, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  // Initialize QR code reader
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    return () => {
      stopCamera();
    };
  }, []);

  // Auto-start camera when popup opens
  useEffect(() => {
    if (isOpen && event) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, event]);

  const startCamera = async () => {
    try {
      setScanning(true);
      setError(null);
      setSuccess(false);
      
      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length > 0) {
        // Prefer back camera on mobile
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        
        const cameraId = backCamera ? backCamera.deviceId : videoDevices[0].deviceId;
        
        // Start decoding from camera
        await codeReader.current.decodeFromVideoDevice(
          cameraId,
          videoRef.current,
          (result, error) => {
            if (result) {
              handleScan(result.getText());
            }
            if (error && !(error instanceof NotFoundException)) {
              console.error("Scan error:", error);
            }
          }
        );
        
        setCameraActive(true);
      } else {
        setError("No camera found on this device");
        setScanning(false);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Failed to access camera. Please ensure camera permissions are granted.");
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (codeReader.current) {
      try {
        codeReader.current.reset();
      } catch (err) {
        console.error("Error stopping camera:", err);
      }
    }
    setCameraActive(false);
    setScanning(false);
  };

  const handleScan = async (scannedText) => {
    try {
      // Stop scanning once we have a result
      stopCamera();
      
      // Validate the scanned QR code
      await validateQRCode(scannedText);
    } catch (err) {
      console.error("Scan handling error:", err);
    }
  };

  const validateQRCode = async (scannedData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Parse the scanned data (assuming it contains the QR token)
      const scannedToken = scannedData.trim();
      
      // Validate with the server
      const response = await axios.post(
        `${BASE_URL}/api/attendance/mark/${event.eventId}`,
        { qrToken: scannedToken },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      
      if (response.data.success) {
        setSuccess(true);
        
        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        // Auto close after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.data.message || "Invalid QR code");
        // Restart camera after error
        setTimeout(() => {
          startCamera();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error validating QR code");
      // Restart camera after error
      setTimeout(() => {
        startCamera();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const retryCamera = () => {
    setError(null);
    startCamera();
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4CA1AF] to-[#2C3E50] text-white px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Scan QR Code</h2>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-white/80 mt-1 truncate">{event.title}</p>
          </div>

          <div className="p-6">
            {/* Success Message */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-600">Attendance marked successfully!</p>
              </div>
            )}

            {/* Error Message */}
            {error && !success && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                      onClick={retryCamera}
                      className="mt-2 text-sm text-red-700 font-medium hover:text-red-800"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Camera View */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              {!cameraActive && !error && !success && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                style={{ display: cameraActive ? 'block' : 'none' }}
              />
              
              {scanning && cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-[#4CA1AF] rounded-lg animate-pulse"></div>
                </div>
              )}
              
              {loading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                    <p className="text-white text-sm">Validating...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Position the QR code within the frame to scan</p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="mt-4 w-full py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendancePopup;