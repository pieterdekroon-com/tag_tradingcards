import { useRef, useState, useCallback } from 'react';
import type { DragEvent } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImage } from '../utils/cropImage';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  image: string;
  onChange: (dataUrl: string) => void;
}

export function ImageUpload({ image, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const croppedAreaPixelsRef = useRef<Area | null>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawImage(reader.result);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    croppedAreaPixelsRef.current = croppedAreaPixels;
  }, []);

  async function handleConfirmCrop() {
    if (!rawImage || !croppedAreaPixelsRef.current) return;
    const cropped = await getCroppedImage(rawImage, croppedAreaPixelsRef.current);
    onChange(cropped);
    setRawImage(null);
  }

  function handleCancelCrop() {
    setRawImage(null);
  }

  const modal = rawImage
    ? createPortal(
        <div className={styles.overlay} onClick={handleCancelCrop}>
          <div className={styles.cropModal} onClick={(e) => e.stopPropagation()}>
            <span className={styles.modalTitle}>Crop Image</span>
            <div className={styles.cropContainer}>
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className={styles.zoomRow}>
              <span className={styles.zoomLabel}>Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className={styles.zoomSlider}
              />
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.confirmBtn} onClick={handleConfirmCrop}>
                Crop
              </button>
              <button type="button" className={styles.cancelBtn} onClick={handleCancelCrop}>
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div
      className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${image ? styles.hasImage : ''}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
    >
      {image ? (
        <img src={image} alt="Card" className={styles.preview} />
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.icon}>↑</span>
          <span className={styles.text}>Drop image or click to upload</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
        className={styles.fileInput}
      />
      {modal}
    </div>
  );
}
