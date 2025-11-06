import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { expertSubmissionSchema, type ExpertSubmission, type ExpertCategory } from "@shared/schema";
import logoUrl from "@assets/ValuCompass-Experts-Logo-2_1762333845372.png";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", 
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", 
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", 
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", 
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", 
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", 
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories = [], isLoading } = useQuery<ExpertCategory[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ExpertSubmission>({
    resolver: zodResolver(expertSubmissionSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      url: "",
      credentials: "",
      city: "",
      state: "",
      category: "",
      specialties: [],
      agreeToTerms: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ExpertSubmission) => {
      const selectedCat = categories.find(c => c.category === data.category);
      const response = await fetch("/api/submit-expert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          topLine: selectedCat?.topLine || "",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setSelectedCategory("");
      form.reset();
    },
  });

  const onSubmit = (data: ExpertSubmission) => {
    submitMutation.mutate(data);
  };

  const selectedCategoryData = categories.find(c => c.category === selectedCategory);
  const availableSpecialties = selectedCategoryData?.specialties || [];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8 text-center">
            <div className="mb-6 flex justify-center">
              <img src={logoUrl} alt="ValuCompass" className="h-12" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Thank You!</h1>
            <p className="text-lg text-muted-foreground">
              Your application has been received. We will be in contact about being included in the ValuCompass Expert Directory.
            </p>
          </Card>
        </div>

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto py-12 px-4 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <img src={logoUrl} alt="ValuCompass" className="h-12 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-2 text-foreground">Expert Registration</h1>
            <p className="text-lg text-muted-foreground">
              Join the ValuCompass Expert Directory
            </p>
          </div>

          <Card className="p-8">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="John"
                              required
                              data-testid="input-firstName"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Smith"
                              required
                              data-testid="input-lastName"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="credentials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credentials</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="CPA, CFP, JD, etc."
                            data-testid="input-credentials"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="john.smith@example.com"
                            required
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="text"
                            placeholder="www.example.com or https://www.example.com"
                            data-testid="input-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="New York"
                              data-testid="input-city"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-state">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem 
                                  key={state} 
                                  value={state}
                                  data-testid={`option-state-${state}`}
                                >
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCategory(value);
                            form.setValue("specialties", []);
                          }}
                          value={field.value}
                          required
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem 
                                key={cat.category} 
                                value={cat.category}
                                data-testid={`option-category-${cat.category}`}
                              >
                                {cat.category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedCategory && availableSpecialties.length > 0 && (
                    <FormField
                      control={form.control}
                      name="specialties"
                      render={() => (
                        <FormItem>
                          <FormLabel>Specialties * (Select 1-3)</FormLabel>
                          <div className="space-y-3 mt-2">
                            {availableSpecialties.map((specialty) => (
                              <FormField
                                key={specialty}
                                control={form.control}
                                name="specialties"
                                render={({ field }) => {
                                  const isChecked = field.value?.includes(specialty);
                                  const isDisabled = !isChecked && field.value?.length >= 3;
                                  
                                  return (
                                    <FormItem
                                      key={specialty}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          data-testid={`checkbox-specialty-${specialty}`}
                                          checked={isChecked}
                                          disabled={isDisabled}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, specialty])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== specialty
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className={`font-normal ${isDisabled ? 'text-muted-foreground' : ''}`}>
                                        {specialty}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6 pb-2">
                        <FormControl>
                          <Checkbox
                            data-testid="checkbox-agree-terms"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal leading-relaxed">
                            I agree to the{" "}
                            <span className="text-destructive">*</span>{" "}
                            <a
                              href="https://22381529.fs1.hubspotusercontent-na1.net/hubfs/22381529/ValuCompass%20Terms%20and%20Conditions%202024.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline hover:no-underline"
                              data-testid="link-terms"
                            >
                              ValuCompass Terms and Conditions
                            </a>{" "}
                            and{" "}
                            <a
                              href="https://22381529.fs1.hubspotusercontent-na1.net/hubfs/22381529/ValuCompass%20Privacy%20Policy%202024.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline hover:no-underline"
                              data-testid="link-privacy"
                            >
                              ValuCompass Privacy Policy
                            </a>
                            .
                            <br />
                            <br />
                            We maintain Terms and Conditions and a Privacy Policy to protect both our users and our business by clearly outlining how our service works, what users can expect, and how we handle personal information in compliance with relevant laws. Data gathered in this assessment is protected by our Privacy Policy and will be available to your advisor(s) or ValuCompass for review. *
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitMutation.isPending}
                      data-testid="button-submit"
                    >
                      {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>

                  {submitMutation.isError && (
                    <p className="text-sm text-destructive text-center" data-testid="text-error">
                      Failed to submit application. Please try again.
                    </p>
                  )}
                </form>
              </Form>
            )}
          </Card>
        </div>
      </div>

      <footer className="w-full border-t bg-muted/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <a
                href="https://22381529.fs1.hubspotusercontent-na1.net/hubfs/22381529/ValuCompass%20Terms%20and%20Conditions%202024.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
                data-testid="footer-link-terms"
              >
                Terms and Conditions
              </a>
              <span className="text-muted-foreground">|</span>
              <a
                href="https://22381529.fs1.hubspotusercontent-na1.net/hubfs/22381529/ValuCompass%20Privacy%20Policy%202024.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
                data-testid="footer-link-privacy"
              >
                Privacy Policy
              </a>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              © ValuCompass {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
