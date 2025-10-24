import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import type { Expert, ContentSection } from "@shared/schema";
import logoUrl from "@assets/vc_experts_logo.png";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: experts = [], isLoading } = useQuery<Expert[]>({
    queryKey: ["/api/experts"],
  });

  const { data: contentSections = [] } = useQuery<ContentSection[]>({
    queryKey: ["/api/content"],
  });

  const categoriesByGroup = useMemo(() => {
    const groups: Record<string, string[]> = {
      Growth: [],
      Protection: []
    };
    
    experts.forEach(expert => {
      if (expert.category) {
        const group = expert.group || 'Other';
        if (!groups[group]) {
          groups[group] = [];
        }
        if (!groups[group].includes(expert.category)) {
          groups[group].push(expert.category);
        }
      }
    });
    
    Object.keys(groups).forEach(group => {
      groups[group].sort();
    });
    
    return groups;
  }, [experts]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
  };

  const filteredExperts = useMemo(() => {
    return experts.filter((expert) => {
      const matchesSearch =
        debouncedSearchQuery === "" ||
        expert.firstName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        expert.lastName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        expert.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        expert.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(expert.category);

      return matchesSearch && matchesCategory;
    });
  }, [experts, debouncedSearchQuery, selectedCategories]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-start">
            <img 
              src={logoUrl} 
              alt="ValuCompass Experts" 
              className="h-12"
              data-testid="img-logo"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="py-12 md:py-16 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Expert Directory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with our network of industry experts and professionals
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search experts by name, email, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
              data-testid="input-search"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-center text-lg font-semibold text-foreground">
                Filter by Category
              </h2>
              {(selectedCategories.length > 0 || searchQuery !== "") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  Clear filters
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {Object.entries(categoriesByGroup).map(([group, categories]) => 
                categories.length > 0 && (
                  <div key={group} className="space-y-3">
                    <h3 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {group}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategories.includes(category) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCategory(category)}
                          className="rounded-full"
                          data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-")}`}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground" data-testid="text-expert-count">
            Showing {filteredExperts.length} of {experts.length} experts
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-muted" />
                    <div className="w-32 h-6 bg-muted rounded" />
                    <div className="w-48 h-4 bg-muted rounded" />
                    <div className="w-24 h-6 bg-muted rounded-full" />
                    <div className="w-full h-9 bg-muted rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="py-16 text-center">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No experts found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {filteredExperts.map((expert, index) => (
              <Card
                key={index}
                className="hover-elevate transition-all duration-200"
                data-testid={`card-expert-${index}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
                      <User className="w-10 h-10 text-accent-foreground" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground" data-testid={`text-name-${index}`}>
                        {expert.firstName} {expert.lastName}
                      </h3>

                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${expert.email}`}
                          className="hover:text-primary transition-colors"
                          data-testid={`link-email-${index}`}
                        >
                          {expert.email}
                        </a>
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1"
                      data-testid={`badge-category-${index}`}
                    >
                      {expert.category}
                    </Badge>

                    <Button
                      className="w-full"
                      asChild
                      data-testid={`button-contact-${index}`}
                    >
                      <a href={`mailto:${expert.email}`}>Contact Expert</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {contentSections.length > 0 && (
          <div className="mt-16 border-t pt-16 space-y-12">
            {contentSections.map((section, index) => (
              <div key={index} className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {section.title}
                </h2>
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
