import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Mic, Send, MicOff, X, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface AIAgentInputProps {
    onSend: (message: string, actionId?: string, imageData?: string) => void;
    onImageUpload?: (imageData: string) => void;
    disabled?: boolean;
}

export function AIAgentInput({ onSend, disabled }: AIAgentInputProps) {
    const [message, setMessage] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const [attachedImageName, setAttachedImageName] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Initialize speech recognition
    useEffect(() => {
        const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionClass) {
            const recognition = new SpeechRecognitionClass();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    setMessage(prev => prev + finalTranscript);
                }
            };

            recognition.onerror = () => {
                toast.error("Voice recognition failed. Please try again.");
                setIsRecording(false);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const handleSend = () => {
        if (message.trim() || attachedImage) {
            onSend(message.trim() || "Please analyze this image:", undefined, attachedImage || undefined);
            setMessage("");
            setAttachedImage(null);
            setAttachedImageName("");
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        // Auto-resize textarea
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    };

    const handleAttachment = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file (PNG, JPG, GIF)");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setAttachedImage(base64);
            setAttachedImageName(file.name);
            toast.success(`Image attached: ${file.name}`);
        };
        reader.onerror = () => {
            toast.error("Failed to read image file");
        };
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = '';
    };

    const handleRemoveImage = () => {
        setAttachedImage(null);
        setAttachedImageName("");
    };

    const handleMicrophone = () => {
        if (!recognitionRef.current) {
            toast.error("Voice recognition is not supported in your browser");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsRecording(true);
                toast.info("Listening... Speak now");
            } catch {
                toast.error("Could not start voice recognition");
                setIsRecording(false);
            }
        }
    };

    return (
        <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
            {/* Attached image preview */}
            {attachedImage && (
                <div className="mb-3 p-2 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground flex-1 truncate">
                            {attachedImageName}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={handleRemoveImage}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    <img
                        src={attachedImage}
                        alt="Attached preview"
                        className="mt-2 max-h-24 rounded-md object-contain"
                    />
                </div>
            )}

            <div className="flex items-end gap-2 bg-muted/50 rounded-2xl p-2 border border-border/50 focus-within:border-primary/50 transition-colors">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={handleAttachment}
                        disabled={disabled}
                        title="Attach image"
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-full hover:bg-muted transition-all",
                            isRecording
                                ? "bg-red-500/20 text-red-500 animate-pulse"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={handleMicrophone}
                        disabled={disabled}
                        title={isRecording ? "Stop recording" : "Voice input"}
                    >
                        {isRecording ? (
                            <MicOff className="h-4 w-4" />
                        ) : (
                            <Mic className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Text input */}
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isRecording ? "Listening..." : "Ask about TagBase..."}
                    disabled={disabled || isRecording}
                    className="flex-1 bg-transparent border-none resize-none text-sm placeholder:text-muted-foreground focus:outline-none min-h-[36px] max-h-[120px] py-2 px-2"
                    rows={1}
                />

                {/* Send button */}
                <Button
                    type="button"
                    size="icon"
                    className={cn(
                        "h-8 w-8 rounded-full transition-all duration-200",
                        (message.trim() || attachedImage)
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                            : "bg-muted text-muted-foreground"
                    )}
                    onClick={handleSend}
                    disabled={disabled || (!message.trim() && !attachedImage)}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>

            {/* Powered by footer */}
            <p className="text-[10px] text-center text-muted-foreground mt-2 opacity-60">
                Powered by TagBase AI
            </p>
        </div>
    );
}
