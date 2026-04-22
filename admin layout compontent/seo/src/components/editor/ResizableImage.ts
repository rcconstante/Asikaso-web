import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableImageComponent from './ResizableImageComponent.tsx';

export interface ResizableImageOptions {
    inline: boolean;
    allowBase64: boolean;
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        resizableImage: {
            /**
             * Add an image
             */
            setImage: (options: { src: string; alt?: string; title?: string; width?: string | number; height?: string | number }) => ReturnType;
        };
    }
}

export const ResizableImage = Node.create<ResizableImageOptions>({
    name: 'resizableImage',

    addOptions() {
        return {
            inline: false,
            allowBase64: false,
            HTMLAttributes: {},
        };
    },

    inline() {
        return this.options.inline;
    },

    group() {
        return this.options.inline ? 'inline' : 'block';
    },

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            title: {
                default: null,
            },
            width: {
                default: null,
                parseHTML: (element) => element.getAttribute('width'),
                renderHTML: (attributes) => {
                    if (!attributes.width) {
                        return {};
                    }
                    return {
                        width: attributes.width,
                    };
                },
            },
            height: {
                default: null,
                parseHTML: (element) => element.getAttribute('height'),
                renderHTML: (attributes) => {
                    if (!attributes.height) {
                        return {};
                    }
                    return {
                        height: attributes.height,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: this.options.allowBase64
                    ? 'img[src]'
                    : 'img[src]:not([src^="data:"])',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },

    addCommands() {
        return {
            setImage:
                (options) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: options,
                    });
                },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageComponent);
    },
});

export default ResizableImage;
