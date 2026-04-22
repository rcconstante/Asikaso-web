import { NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function ResizableImageComponent({ node, updateAttributes, selected }: any) {
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState<'se' | 'sw' | 'ne' | 'nw' | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [dimensions, setDimensions] = useState({
        width: node.attrs.width || 'auto',
        height: node.attrs.height || 'auto',
    });

    const startResize = (e: React.MouseEvent, direction: 'se' | 'sw' | 'ne' | 'nw') => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizeDirection(direction);

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = imageRef.current?.offsetWidth || 0;
        const startHeight = imageRef.current?.offsetHeight || 0;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!imageRef.current) return;

            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;

            // Calculate new dimensions based on resize direction
            if (direction === 'se') {
                newWidth = startWidth + deltaX;
                newHeight = startHeight + deltaY;
            } else if (direction === 'sw') {
                newWidth = startWidth - deltaX;
                newHeight = startHeight + deltaY;
            } else if (direction === 'ne') {
                newWidth = startWidth + deltaX;
                newHeight = startHeight - deltaY;
            } else if (direction === 'nw') {
                newWidth = startWidth - deltaX;
                newHeight = startHeight - deltaY;
            }

            // Maintain aspect ratio by using the larger change
            const aspectRatio = startWidth / startHeight;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                newHeight = newWidth / aspectRatio;
            } else {
                newWidth = newHeight * aspectRatio;
            }

            // Set minimum size
            newWidth = Math.max(50, newWidth);
            newHeight = Math.max(50, newHeight);

            setDimensions({
                width: Math.round(newWidth),
                height: Math.round(newHeight),
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            setResizeDirection(null);
            updateAttributes({
                width: dimensions.width,
                height: dimensions.height,
            });
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        if (!isResizing && imageRef.current) {
            updateAttributes({
                width: dimensions.width,
                height: dimensions.height,
            });
        }
    }, [isResizing]);

    const handleImageLoad = () => {
        if (imageRef.current && !node.attrs.width && !node.attrs.height) {
            setDimensions({
                width: imageRef.current.naturalWidth,
                height: imageRef.current.naturalHeight,
            });
        }
    };

    useEffect(() => {
        if (node.attrs.width || node.attrs.height) {
            setDimensions({
                width: node.attrs.width || 'auto',
                height: node.attrs.height || 'auto',
            });
        }
    }, [node.attrs.width, node.attrs.height]);

    return (
        <NodeViewWrapper className="relative inline-block my-4 group">
            <div
                className={cn(
                    'relative inline-block',
                    selected && 'ring-2 ring-primary ring-offset-2 rounded-lg'
                )}
                style={{
                    width: dimensions.width !== 'auto' ? `${dimensions.width}px` : 'auto',
                    height: dimensions.height !== 'auto' ? `${dimensions.height}px` : 'auto',
                }}
            >
                <img
                    ref={imageRef}
                    src={node.attrs.src}
                    alt={node.attrs.alt || ''}
                    title={node.attrs.title || ''}
                    onLoad={handleImageLoad}
                    className="max-w-full h-auto rounded-lg"
                    style={{
                        width: dimensions.width !== 'auto' ? '100%' : 'auto',
                        height: dimensions.height !== 'auto' ? '100%' : 'auto',
                        objectFit: 'contain',
                    }}
                />

                {/* Resize Handles - Only show when selected */}
                {selected && (
                    <>
                        {/* Corner Handles */}
                        <div
                            className="absolute top-0 left-0 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-nw-resize -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => startResize(e, 'nw')}
                        />
                        <div
                            className="absolute top-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-ne-resize translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => startResize(e, 'ne')}
                        />
                        <div
                            className="absolute bottom-0 left-0 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-sw-resize -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => startResize(e, 'sw')}
                        />
                        <div
                            className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-se-resize translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => startResize(e, 'se')}
                        />

                        {/* Dimension Display */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {dimensions.width !== 'auto' ? dimensions.width : '?'} × {dimensions.height !== 'auto' ? dimensions.height : '?'} px
                        </div>
                    </>
                )}
            </div>
        </NodeViewWrapper>
    );
}
