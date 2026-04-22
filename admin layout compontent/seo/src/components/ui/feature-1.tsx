import { Button } from "@/components/ui/button";

interface Feature1Props {
    title: string;
    description?: string;
    imageSrc: string;
    imageAlt: string;
    buttonPrimary: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    buttonSecondary?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

export const Feature1 = ({
    title = "Blocks built with Shadcn & Tailwind",
    description = "Hundreds of finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
    imageSrc = "https://shadcnblocks.com/images/block/placeholder-1.svg",
    imageAlt = "placeholder hero",
    buttonPrimary = {
        label: "Get Started",
        href: "#",
    },
    buttonSecondary,
}: Feature1Props) => {
    return (
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                        <h2 className="my-6 mt-0 text-3xl font-semibold text-balance lg:text-4xl xl:text-5xl">
                            {title}
                        </h2>
                        <p className="mb-8 max-w-xl text-muted-foreground lg:text-lg">
                            {description}
                        </p>
                        <div className="flex w-full flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                            {buttonPrimary.onClick ? (
                                <Button size="lg" onClick={buttonPrimary.onClick}>
                                    {buttonPrimary.label}
                                </Button>
                            ) : (
                                <Button size="lg" asChild>
                                    <a href={buttonPrimary.href}>
                                        {buttonPrimary.label}
                                    </a>
                                </Button>
                            )}
                            {buttonSecondary && (
                                buttonSecondary.onClick ? (
                                    <Button variant="outline" size="lg" onClick={buttonSecondary.onClick}>
                                        {buttonSecondary.label}
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="lg" asChild>
                                        <a href={buttonSecondary.href}>
                                            {buttonSecondary.label}
                                        </a>
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        className="max-h-96 w-full rounded-xl object-cover shadow-xl"
                    />
                </div>
            </div>
        </section>
    );
};

export default Feature1;
