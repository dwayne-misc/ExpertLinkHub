import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Mail, ChevronLeft, ChevronRight, Copy, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { ContentBlock } from "@/components/ContentBlock";
import { useToast } from "@/hooks/use-toast";
import type { Expert, ContentSection } from "@shared/schema";
import logoUrl from "@assets/vc_experts_logo.png";

const EXPERTS_PER_PAGE = 6;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { toast } = useToast();

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
      const searchLower = debouncedSearchQuery.toLowerCase();
      const matchesSearch =
        debouncedSearchQuery === "" ||
        expert.firstName.toLowerCase().includes(searchLower) ||
        expert.lastName.toLowerCase().includes(searchLower) ||
        expert.email.toLowerCase().includes(searchLower) ||
        expert.category.toLowerCase().includes(searchLower) ||
        (expert.credentials && expert.credentials.toLowerCase().includes(searchLower)) ||
        (expert.city && expert.city.toLowerCase().includes(searchLower)) ||
        (expert.state && expert.state.toLowerCase().includes(searchLower)) ||
        (expert.specialty && expert.specialty.toLowerCase().includes(searchLower));

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(expert.category);

      return matchesSearch && matchesCategory;
    });
  }, [experts, debouncedSearchQuery, selectedCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategories]);

  const totalPages = Math.ceil(filteredExperts.length / EXPERTS_PER_PAGE);
  
  const paginatedExperts = useMemo(() => {
    const startIndex = (currentPage - 1) * EXPERTS_PER_PAGE;
    const endIndex = startIndex + EXPERTS_PER_PAGE;
    return filteredExperts.slice(startIndex, endIndex);
  }, [filteredExperts, currentPage]);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];
    
    if (currentPage <= 3) {
      pages.push(2, 3, 4, 'ellipsis', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
    }
    
    return pages;
  };

  const copyEmailToClipboard = async (email: string, expertName: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast({
        title: "Email copied!",
        description: `${expertName}'s email has been copied to your clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the email manually.",
        variant: "destructive",
      });
    }
  };

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
          <h2 className="text-2xl font-semibold text-foreground mb-4 max-w-3xl mx-auto">
            Unlock the right expertise, right when you need it.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ValuCompass Experts connects advisors to vetted specialists across tax, legal, finance, and transition planning so engagements stay moving.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search experts by name, location, credentials, or category..."
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
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-3" data-testid="text-expert-count">
            <span>
              {filteredExperts.length > 0 
                ? `Showing ${(currentPage - 1) * EXPERTS_PER_PAGE + 1}-${Math.min(currentPage * EXPERTS_PER_PAGE, filteredExperts.length)} of ${filteredExperts.length} expert${filteredExperts.length !== 1 ? 's' : ''}`
                : `0 of ${experts.length} experts`
              }
            </span>
            <span className="text-xs flex items-center gap-1">
              <Globe className="w-3 h-3" /> = Website available
            </span>
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {paginatedExperts.map((expert, index) => (
                <Card
                  key={index}
                  className="hover-elevate transition-all duration-200 relative overflow-hidden"
                  data-testid={`card-expert-${index}`}
                >
                  {expert.url && (
                    <a
                      href={expert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background hover:bg-accent transition-colors"
                      data-testid={`link-website-${index}`}
                      aria-label="Visit website"
                    >
                      <Globe className="w-4 h-4 text-primary" />
                    </a>
                  )}
                  {expert.group && (
                    <div 
                      className={`absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none`}
                      data-testid={`label-group-container-${index}`}
                    >
                      <div 
                        className={`absolute top-6 w-40 text-center py-1 text-[9px] font-bold tracking-widest transform rotate-45 shadow-md ${
                          expert.group === 'Growth' 
                            ? 'bg-emerald-500 text-white -right-8' 
                            : 'bg-blue-500 text-white -right-10'
                        }`}
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                        data-testid={`label-group-${index}`}
                      >
                        {expert.group.toUpperCase()}
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground" data-testid={`text-name-${index}`}>
                          {expert.firstName} {expert.lastName}
                          {expert.credentials && (
                            <span className="text-sm text-muted-foreground font-medium" data-testid={`text-credentials-${index}`}>
                              , {expert.credentials}
                            </span>
                          )}
                        </h3>

                        {(expert.city || expert.state) && (
                          <p className="text-sm text-muted-foreground" data-testid={`text-location-${index}`}>
                            {[expert.city, expert.state].filter(Boolean).join(', ')}
                          </p>
                        )}

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

                      <div className="min-h-[3rem] flex items-center justify-center">
                        {expert.specialty && (
                          <p className="text-sm text-muted-foreground text-center whitespace-pre-wrap" data-testid={`text-specialty-${index}`}>
                            {expert.specialty}
                          </p>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => copyEmailToClipboard(expert.email, `${expert.firstName} ${expert.lastName}`)}
                        data-testid={`button-copy-email-${index}`}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-16" data-testid="pagination-controls">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {getPageNumbers().map((pageNum, idx) => 
                  pageNum === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(pageNum)}
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {contentSections.length > 0 && (
          <div className="mt-16 border-t pt-16 space-y-16 pb-16">
            {contentSections.map((section, index) => (
              <ContentBlock key={index} section={section} />
            ))}
          </div>
        )}
      </main>

      <footer className="w-full border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © ValuCompass {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
