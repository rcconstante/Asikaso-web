import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { ResizableImage } from './ResizableImage';
import './editor.css';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Minus,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter,
    RemoveFormatting,
    CheckCircle2,
} from 'lucide-react';
import { useCallback, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WysiwygEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

// Toolbar Button Component
function ToolbarButton({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
}) {
    return (
        <Toggle
            pressed={isActive}
            onPressedChange={onClick}
            disabled={disabled}
            size="sm"
            title={title}
            className="h-8 w-8 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
            {children}
        </Toggle>
    );
}

// Editor Toolbar Component
function EditorToolbar({ editor }: { editor: Editor | null }) {
    const { sessionToken } = useAdmin();
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateUploadUrlMutation = useMutation(api.files.generateUploadUrl);
    const saveFileMetadataMutation = useMutation(api.files.saveFileMetadata);

    if (!editor) return null;

    const setLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
        } else {
            editor.chain().focus().unsetLink().run();
        }
        setLinkUrl('');
        setLinkDialogOpen(false);
    };

    const addImage = () => {
        const finalUrl = uploadedImageUrl || imageUrl;
        if (finalUrl) {
            editor.chain().focus().setImage({ src: finalUrl }).run();
        }
        setImageUrl('');
        setUploadedImageUrl('');
        setImageDialogOpen(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !sessionToken) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be smaller than 5MB');
            return;
        }

        setIsUploading(true);

        try {
            // Get upload URL
            const uploadUrl = await generateUploadUrlMutation({ sessionToken });

            // Upload the file
            const result = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            const { storageId } = await result.json();

            // Save file metadata
            const savedFile = await saveFileMetadataMutation({
                sessionToken,
                storageId,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            });

            // Get the URL
            setUploadedImageUrl(savedFile.url);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30 rounded-t-lg">
                {/* History */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Text Formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive('highlight')}
                    title="Highlight"
                >
                    <Highlighter className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    title="Inline Code"
                >
                    <Code className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Headings Dropdown */}
                <Select
                    value={
                        editor.isActive('heading', { level: 1 }) ? 'h1' :
                            editor.isActive('heading', { level: 2 }) ? 'h2' :
                                editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
                    }
                    onValueChange={(value) => {
                        if (value === 'p') {
                            editor.chain().focus().setParagraph().run();
                        } else if (value === 'h1') {
                            editor.chain().focus().setHeading({ level: 1 }).run();
                        } else if (value === 'h2') {
                            editor.chain().focus().setHeading({ level: 2 }).run();
                        } else if (value === 'h3') {
                            editor.chain().focus().setHeading({ level: 3 }).run();
                        }
                    }}
                >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Text Style" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="p">Normal Text</SelectItem>
                        <SelectItem value="h1">
                            <span className="text-lg font-bold">Heading 1</span>
                        </SelectItem>
                        <SelectItem value="h2">
                            <span className="text-base font-bold">Heading 2</span>
                        </SelectItem>
                        <SelectItem value="h3">
                            <span className="text-sm font-semibold">Heading 3</span>
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Block Elements */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Rule"
                >
                    <Minus className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Alignment */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Media */}
                <ToolbarButton
                    onClick={() => {
                        const previousUrl = editor.getAttributes('link').href || '';
                        setLinkUrl(previousUrl);
                        setLinkDialogOpen(true);
                    }}
                    isActive={editor.isActive('link')}
                    title="Add Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => setImageDialogOpen(true)}
                    title="Add Image"
                >
                    <ImageIcon className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Clear Formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    title="Clear Formatting"
                >
                    <RemoveFormatting className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Link Dialog */}
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Link</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="link-url">URL</Label>
                            <Input
                                id="link-url"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && setLink()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={setLink}>
                            {linkUrl ? 'Add Link' : 'Remove Link'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Dialog */}
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Image</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">Upload</TabsTrigger>
                            <TabsTrigger value="url">URL</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="image-file">Choose Image File</Label>
                                <div className="flex flex-col gap-3">
                                    <Input
                                        ref={fileInputRef}
                                        id="image-file"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                        className="cursor-pointer"
                                    />
                                    {isUploading && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading image...
                                        </div>
                                    )}
                                    {uploadedImageUrl && (
                                        <div className="space-y-2">
                                            <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Image uploaded successfully!
                                            </p>
                                            <div className="border rounded-lg p-2 bg-muted/50">
                                                <img
                                                    src={uploadedImageUrl}
                                                    alt="Preview"
                                                    className="max-w-full h-auto max-h-48 mx-auto rounded"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="url" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="image-url">Image URL</Label>
                                <Input
                                    id="image-url"
                                    placeholder="https://example.com/image.jpg"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addImage()}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setImageDialogOpen(false);
                            setImageUrl('');
                            setUploadedImageUrl('');
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={addImage} disabled={!imageUrl && !uploadedImageUrl}>
                            Add Image
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function WysiwygEditor({ content, onChange, placeholder = "Start writing your blog post..." }: WysiwygEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Disable StarterKit's heading to use our custom one
                heading: false,
            }),
            // Use explicit Heading extension with all levels
            Heading.configure({
                levels: [1, 2, 3],
            }),
            ResizableImage.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight.configure({
                HTMLAttributes: {
                    class: 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded',
                },
            }),
            Typography,
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'tiptap-editor prose prose-lg dark:prose-invert max-w-none focus:outline-none',
            },
        },
    });

    // Update content when prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-background">
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}

export default WysiwygEditor;
