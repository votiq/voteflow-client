"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { POLL_CATEGORIES } from "@/lib/constants";
import { useCreatePoll } from "@/lib/hooks/usePolls";
import { authApi } from "@/lib/api/auth";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { CustomSelect } from "@/components/ui/custom-select";

export default function CreatePollPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organization, setOrganization] = useState("");
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  const user = currentUserQuery.data;
  const organizerRequestQuery = useQuery({
    queryKey: ["organizer-request-status", user?.id],
    queryFn: authApi.organizerRequestStatus,
    enabled: user?.role === "user",
  });
  const requestMutation = useMutation({
    mutationFn: () => authApi.requestOrganizerAccess({ business_name: organization.trim() }),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["organizer-request-status"] }),
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
      ]);
      toast.success(result.status === "approved" ? "Organizer access is active." : "Your organizer request was sent for review.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to submit your request."),
  });

  const [pollData, setPollData] = useState<{
    title: string;
    description: string;
    category: string;
    type: string;
    price: string;
    image: File | null;
    endsAt: string;
  }>({
    title: "",
    description: "",
    category: "",
    type: "free",
    price: "",
    image: null,
    endsAt: "",
  });

  const [contestants, setContestants] = useState<{
    id: number;
    name: string;
    description: string;
    image: File | null;
  }[]>([{ id: 1, name: "", description: "", image: null }]);
  const selectedEndTime = Date.parse(pollData.endsAt);
  const paidPrice = Number(pollData.price);

  const minimumEndDate = (() => {
    const date = new Date(Date.now() + 60_000);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return localDate.toISOString().slice(0, 16);
  })();

  const handleImageChange = (file: File | null, update: (file: File | null) => void) => {
    if (!file) {
      update(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Images must be 5 MB or smaller.");
      return;
    }
    update(file);
  };

  const handleAddContestant = () => {
    setContestants([...contestants, { id: Date.now(), name: "", description: "", image: null }]);
  };

  const handleRemoveContestant = (id: number) => {
    setContestants(contestants.filter(c => c.id !== id));
  };

  const handleContestantChange = (id: number, field: string, value: any) => {
    setContestants(contestants.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const createPoll = useCreatePoll();

  const handlePublish = async () => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("title", pollData.title);
      formData.append("description", pollData.description);
      formData.append("category", pollData.category);
      formData.append("isPaid", pollData.type === "paid" ? "true" : "false");
      formData.append("status", "active");
      if (pollData.type === "paid" && pollData.price) {
        formData.append("pricePerVote", pollData.price);
      }
      formData.append("endsAt", new Date(pollData.endsAt).toISOString());
      
      if (pollData.image) {
        formData.append("image", pollData.image);
      }

      formData.append("contestants", JSON.stringify(contestants.map(({ name, description }) => ({ name, description }))));
      contestants.forEach((c, i) => {
        if (c.image) {
          formData.append(`contestant_${i}_image`, c.image);
        }
      });

      const createdPoll = await createPoll.mutateAsync(formData);
      
      toast.success("Poll successfully created and is now live!");
      router.push(`/polls/${createdPoll.slug}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to create poll. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentUserQuery.isLoading || (!user && !currentUserQuery.error)) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (currentUserQuery.error || !user) {
    return <p className="py-16 text-center text-destructive">Unable to confirm your account role. Please refresh and try again.</p>;
  }

  if (user.role !== "creator" && user.role !== "admin") {
    const organizerRequest = organizerRequestQuery.data && "is_approved" in organizerRequestQuery.data
      ? organizerRequestQuery.data
      : null;
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizer access</h1>
          <p className="mt-1 text-muted-foreground">An administrator must approve organizer access before you can publish polls.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Request approval</CardTitle>
            <CardDescription>Tell us which organization you represent so an administrator can review your request.</CardDescription>
          </CardHeader>
          {organizerRequestQuery.isLoading ? (
            <CardContent><div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></CardContent>
          ) : organizerRequestQuery.error ? (
            <CardContent><p className="text-sm text-destructive">Could not check your request status. Refresh and try again.</p></CardContent>
          ) : organizerRequest && !organizerRequest.is_approved ? (
            <CardContent><p className="text-sm text-muted-foreground">Your request for <span className="font-medium text-foreground">{organizerRequest.business_name || "organizer access"}</span> is pending review. You can return here after approval.</p></CardContent>
          ) : (
            <>
              <CardContent className="space-y-3">
                <Label htmlFor="organization-name">Organization name</Label>
                <Input id="organization-name" value={organization} onChange={(event) => setOrganization(event.target.value)} placeholder="Organization or campaign name" />
              </CardContent>
              <CardFooter>
                <Button onClick={() => requestMutation.mutate()} disabled={!organization.trim() || requestMutation.isPending}>
                  {requestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Request organizer access
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create a New Poll</h1>
        <p className="text-muted-foreground mt-1">Set up your poll, add contestants, and start collecting votes.</p>
      </div>

      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 text-xs sm:text-sm min-w-max px-2">
        <div className="flex items-center gap-2 shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
          <span className={`font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Details</span>
        </div>
        <div className={`h-1 flex-1 mx-4 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
          <span className={`font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Contestants</span>
        </div>
        <div className={`h-1 flex-1 mx-4 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</div>
          <span className={`font-medium ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Review</span>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Poll Details</CardTitle>
              <CardDescription>Enter the basic information about your poll.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Poll Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Best Tech Startup of 2026" 
                  value={pollData.title}
                  onChange={(e) => setPollData({...pollData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description" 
                  placeholder="Describe what this poll is about..." 
                  value={pollData.description}
                  onChange={(e) => setPollData({...pollData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <CustomSelect
                  id="category"
                  value={pollData.category}
                  placeholder="Select a category..."
                  options={POLL_CATEGORIES.filter((category) => category !== "All Categories").map((category) => ({ value: category, label: category }))}
                  onValueChange={(category) => setPollData({ ...pollData, category })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Banner Image</Label>
                <Input 
                  id="image" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] ?? null, (image) => setPollData((current) => ({ ...current, image })))}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">Upload a high-quality cover image for your poll.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endsAt">Poll End Date & Time</Label>
                <Input 
                  id="endsAt" 
                  type="datetime-local" 
                  value={pollData.endsAt}
                  min={minimumEndDate}
                  onChange={(e) => setPollData({...pollData, endsAt: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <Label>Voting Type</Label>
                <Tabs value={pollData.type} onValueChange={(v) => setPollData({...pollData, type: v})}>
                  <TabsList className="flex flex-col sm:grid sm:grid-cols-2 w-full h-auto gap-1 p-1">
                    <TabsTrigger value="free">Free Voting</TabsTrigger>
                    <TabsTrigger value="paid">Paid Voting (Monetized)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="paid" className="pt-4 space-y-2">
                    <Label htmlFor="price">Price Per Vote (NGN)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      min="1"
                      step="0.01"
                      placeholder="1.50" 
                      value={pollData.price}
                      onChange={(e) => setPollData({...pollData, price: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">You will receive payouts directly to your wallet minus platform fees.</p>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!pollData.title.trim() || !Number.isFinite(selectedEndTime) || selectedEndTime <= Date.now() || (pollData.type === "paid" && (!Number.isFinite(paidPrice) || paidPrice <= 0))}>
                Next Step <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Add Contestants</CardTitle>
              <CardDescription>Add the participants or options people will vote for.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contestants.map((c, i) => (
                <div key={c.id} className="relative p-4 border rounded-lg space-y-4 bg-card/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Contestant {i + 1}</h4>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveContestant(c.id)} disabled={contestants.length === 1} className="text-destructive h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input 
                        placeholder="Contestant Name" 
                        value={c.name}
                        onChange={(e) => handleContestantChange(c.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image</Label>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files?.[0] ?? null, (image) => handleContestantChange(c.id, 'image', image))}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Brief Description</Label>
                    <Input 
                      placeholder="e.g. Actor, Model, Tech Lead" 
                      value={c.description}
                      onChange={(e) => handleContestantChange(c.id, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddContestant} className="w-full mt-4 border-dashed border-2">
                <Plus className="mr-2 h-4 w-4" /> Add Another Contestant
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={contestants.some(c => !c.name.trim())}>
                Next Step <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Review & Publish</CardTitle>
              <CardDescription>Review your settings before launching your poll.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-6 rounded-lg space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{pollData.title}</h3>
                  {pollData.description && <p className="text-muted-foreground">{pollData.description}</p>}
                  {pollData.image && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="material-symbols-outlined text-[16px]">image</span>
                      <span>{pollData.image.name}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Voting Type:</span>
                    <p className="font-medium capitalize">{pollData.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{pollData.category || "None selected"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ends At:</span>
                    <p className="font-medium">{pollData.endsAt ? new Date(pollData.endsAt).toLocaleString() : "Not set"}</p>
                  </div>
                  {pollData.type === 'paid' && (
                    <div>
                      <span className="text-muted-foreground">Price per Vote:</span>
                    <p className="font-medium">₦{pollData.price}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Contestants:</span>
                    <p className="font-medium">{contestants.length} total</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>Back</Button>
              <Button onClick={handlePublish} disabled={isSubmitting || !pollData.endsAt || contestants.some((c) => !c.name.trim())}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Launch Poll
                  </>
                )}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
