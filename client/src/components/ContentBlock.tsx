import { Card, CardContent } from "@/components/ui/card";
import type { ContentSection } from "@shared/schema";

interface ContentBlockProps {
  section: ContentSection;
}

export function ContentBlock({ section }: ContentBlockProps) {
  const type = section.type || "text";

  switch (type) {
    case "text":
      return (
        <div className="max-w-3xl mx-auto" data-testid="content-block-text">
          {section.title && (
            <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="text-content-title">
              {section.title}
            </h2>
          )}
          <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed" data-testid="text-content-body">
            {section.content}
          </div>
        </div>
      );

    case "image":
      return (
        <div className="max-w-5xl mx-auto" data-testid="content-block-image">
          {section.imageUrl && (
            <img
              src={section.imageUrl}
              alt={section.title || "Content image"}
              className="w-full rounded-md"
              data-testid="img-content"
            />
          )}
          {section.title && (
            <p className="text-center text-sm text-muted-foreground mt-3" data-testid="text-image-caption">
              {section.title}
            </p>
          )}
        </div>
      );

    case "hero":
      return (
        <div className="relative w-full h-96 rounded-md overflow-hidden" data-testid="content-block-hero">
          {section.imageUrl && (
            <img
              src={section.imageUrl}
              alt={section.title || "Hero image"}
              className="absolute inset-0 w-full h-full object-cover"
              data-testid="img-hero"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            {section.title && (
              <h2 className="text-4xl font-bold text-white mb-4" data-testid="text-hero-title">
                {section.title}
              </h2>
            )}
            {section.content && (
              <p className="text-lg text-white/90 max-w-2xl" data-testid="text-hero-content">
                {section.content}
              </p>
            )}
          </div>
        </div>
      );

    case "two-column":
      return (
        <div className="max-w-6xl mx-auto" data-testid="content-block-two-column">
          {section.title && (
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center" data-testid="text-two-column-title">
              {section.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed" data-testid="text-two-column-primary">
              {section.content}
            </div>
            {section.secondaryContent && (
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed" data-testid="text-two-column-secondary">
                {section.secondaryContent}
              </div>
            )}
          </div>
        </div>
      );

    case "cards":
      const cards = section.content.split('\n\n').filter(Boolean);
      return (
        <div className="max-w-6xl mx-auto" data-testid="content-block-cards">
          {section.title && (
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center" data-testid="text-cards-title">
              {section.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((cardContent, idx) => {
              const [cardTitle, ...cardBody] = cardContent.split('\n');
              return (
                <Card key={idx} className="hover-elevate transition-all" data-testid={`card-content-${idx}`}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-3" data-testid={`text-card-title-${idx}`}>
                      {cardTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid={`text-card-body-${idx}`}>
                      {cardBody.join('\n')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      );

    case "image-text":
      return (
        <div className="max-w-5xl mx-auto" data-testid="content-block-image-text">
          {section.title && (
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center" data-testid="text-image-text-title">
              {section.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {section.imageUrl && (
              <img
                src={section.imageUrl}
                alt={section.title || "Content image"}
                className="w-full rounded-md"
                data-testid="img-content-with-text"
              />
            )}
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed" data-testid="text-image-text-content">
              {section.content}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="max-w-3xl mx-auto">
          {section.title && (
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {section.title}
            </h2>
          )}
          <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {section.content}
          </div>
        </div>
      );
  }
}
