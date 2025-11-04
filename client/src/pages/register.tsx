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
import logoUrl from "@assets/vc_experts_logo.png";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
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
      credentials: "",
      city: "",
      state: "",
      category: "",
      specialties: [],
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="mb-6 flex justify-center">
            <img src={logoUrl} alt="ValuCompass" className="h-12" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-foreground">Thank You!</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Your application has been received. We will be in contact about being included in the ValuCompass Expert Directory.
          </p>
          <Button 
            onClick={() => setSubmitted(false)}
            data-testid="button-submit-another"
          >
            Submit Another Application
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
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
                          <FormLabel>State</FormLabel>
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
                          <FormLabel>Specialties * (Select at least one)</FormLabel>
                          <div className="space-y-3 mt-2">
                            {availableSpecialties.map((specialty) => (
                              <FormField
                                key={specialty}
                                control={form.control}
                                name="specialties"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={specialty}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          data-testid={`checkbox-specialty-${specialty}`}
                                          checked={field.value?.includes(specialty)}
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
                                      <FormLabel className="font-normal">
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
    </div>
  );
}
