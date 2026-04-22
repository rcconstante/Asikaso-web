import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
    Upload,
    Loader2,
    Crop,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    X,
    Image as ImageIcon,
    Check,
} from "lucide-react";
import ReactCrop, { Crop as CropType, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageUploaderProps {
    onUpload: (url: string) => void;
    aspectRatio?: number; // e.g., 16/9 for cover images
    className?: string;
    buttonText?: string;
    showPreview?: boolean;
    currentImage?: string;
}

export function ImageUploader({
    onUpload,
    aspectRatio = 16 / 9,
    className,
    buttonText = "Upload Image",
    showPreview = true,
    currentImage,
}: ImageUploaderProps) {
    const { sessionToken } = useAdmin();
    const [isUploading, setIsUploading] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<CropType>();
    const [completedCrop, setCompletedCrop] = useState<CropType>();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);

    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveFileMetadata = useMutation(api.files.saveFileMetadata);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);
    };

    // Initialize crop when image loads
    const onImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            const { width, height } = e.currentTarget;
            const newCrop = centerCrop(
                makeAspectCrop(
                    {
                        unit: "%",
                        width: 90,
                    },
                    aspectRatio,
                    width,
                    height
                ),
                width,
                height
            );
            setCrop(newCrop);
            setCompletedCrop(newCrop);
        },
        [aspectRatio]
    );

    // Generate cropped image blob
    const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
        if (!imgRef.current || !completedCrop) return null;

        const image = imgRef.current;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Calculate pixel crop values
        const pixelCrop = {
            x: (completedCrop.x / 100) * image.width * scaleX,
            y: (completedCrop.y / 100) * image.height * scaleY,
            width: (completedCrop.width / 100) * image.width * scaleX,
            height: (completedCrop.height / 100) * image.height * scaleY,
        };

        // Set canvas size to match the crop (maintaining aspect ratio)
        const outputWidth = 1200; // High quality output
        const outputHeight = outputWidth / aspectRatio;
        canvas.width = outputWidth;
        canvas.height = outputHeight;

        // Fill with white background for JPEG
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Draw the cropped portion
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.restore();

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                "image/jpeg",
                0.9
            );
        });
    }, [completedCrop, scale, rotate, aspectRatio]);

    // Handle crop confirmation and upload
    const handleCropConfirm = async () => {
        if (!sessionToken || !selectedFile) return;

        setIsUploading(true);
        try {
            // Get cropped image
            const croppedBlob = await getCroppedImage();
            if (!croppedBlob) {
                throw new Error("Failed to crop image");
            }

            // Get upload URL from Convex
            const uploadUrl = await generateUploadUrl({ sessionToken });

            // Upload the file
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": croppedBlob.type },
                body: croppedBlob,
            });

            if (!response.ok) {
                throw new Error("Failed to upload file");
            }

            const { storageId } = await response.json();

            // Save metadata and get URL
            const result = await saveFileMetadata({
                sessionToken,
                storageId,
                fileName: selectedFile.name,
                fileType: "image/jpeg",
                fileSize: croppedBlob.size,
            });

            if (result.url) {
                setPreviewUrl(result.url);
                onUpload(result.url);
            }

            setShowCropModal(false);
            setSelectedFile(null);
            setImageSrc(null);
            setScale(1);
            setRotate(0);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Cancel cropping
    const handleCancel = () => {
        setShowCropModal(false);
        setSelectedFile(null);
        setImageSrc(null);
        setScale(1);
        setRotate(0);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <>
            <div className={cn("flex flex-col gap-4", className)}>
                {/* Preview */}
                {showPreview && previewUrl && (
                    <div className="relative group rounded-xl overflow-hidden border border-border">
                        <img
                            src={previewUrl}
                            alt="Cover preview"
                            className="w-full aspect-video object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => inputRef.current?.click()}
                            >
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Change
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setPreviewUrl(null);
                                    onUpload("");
                                }}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                            </Button>
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                {(!showPreview || !previewUrl) && (
                    <div
                        onClick={() => inputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                    >
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="font-medium">{buttonText}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Click to browse or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Recommended: 1200×675px (16:9 ratio)
                        </p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Crop Modal */}
            <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Crop className="h-5 w-5 text-primary" />
                            Crop Image
                        </DialogTitle>
                        <DialogDescription>
                            Adjust the crop area to fit the cover image dimensions (16:9)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Crop Area */}
                        <div className="max-h-[400px] overflow-auto bg-muted/30 rounded-xl p-4 flex items-center justify-center">
                            {imageSrc && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(_, percentCrop) => setCompletedCrop(percentCrop)}
                                    aspect={aspectRatio}
                                    className="max-w-full"
                                >
                                    <img
                                        ref={imgRef}
                                        src={imageSrc}
                                        alt="Crop preview"
                                        onLoad={onImageLoad}
                                        style={{
                                            transform: `scale(${scale}) rotate(${rotate}deg)`,
                                            maxHeight: "350px",
                                        }}
                                        className="max-w-full"
                                    />
                                </ReactCrop>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Zoom */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium flex items-center gap-2">
                                        <ZoomIn className="h-4 w-4" /> Zoom
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round(scale * 100)}%
                                    </span>
                                </div>
                                <Slider
                                    value={[scale]}
                                    onValueChange={([val]) => setScale(val)}
                                    min={0.5}
                                    max={2}
                                    step={0.1}
                                />
                            </div>

                            {/* Rotate */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium flex items-center gap-2">
                                        <RotateCcw className="h-4 w-4" /> Rotate
                                    </span>
                                    <span className="text-sm text-muted-foreground">{rotate}°</span>
                                </div>
                                <Slider
                                    value={[rotate]}
                                    onValueChange={([val]) => setRotate(val)}
                                    min={-180}
                                    max={180}
                                    step={1}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleCropConfirm} disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Apply & Upload
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ImageUploader;
