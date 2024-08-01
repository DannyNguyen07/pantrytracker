import React, { useRef, useState } from "react";
import { Camera } from "react-camera-pro";
import IconButton from "@mui/material/IconButton";
import CameraAltIcon from '@mui/icons-material/CameraAlt';

function CameraComponent({ onCapture }) {
  const camera = useRef(null);
  const [image, setImage] = useState(null);

  const handleTakePhoto = () => {
    const photo = camera.current.takePhoto();
    setImage(photo);
    onCapture(photo);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Camera
        ref={camera}
        aspectRatio={16 / 9}
        width="100%"
        height="100%"
      />
      <IconButton
        onClick={handleTakePhoto}
        style={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "white",
        }}
      >
        <CameraAltIcon style={{ fontSize: 15, color: "black" }} />
      </IconButton>
      {image && <img src={image} alt="Captured" style={{ marginTop: 20 }} />}
    </div>
  );
}

export default CameraComponent;




