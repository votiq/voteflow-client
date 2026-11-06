"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Check, ChevronRight, CreditCard, Loader2, Shield, UserRound } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const accountLinks = [
  { title: "Notifications", description: "Review and manage the notifications sent to your account.", href: "/notifications", icon: Bell, action: "Open notifications" },
  { title: "Wallet and payouts", description: "View your balance, transaction history, and withdrawal options.", href: "/wallet", icon: CreditCard, action: "Open wallet" },
  { title: "Password and security", description: "Use the secure password reset flow to change your password.", href: "/forgot-password", icon: Shield, action: "Reset password" },
];

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Enter your name before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await authApi.updateProfile({ name: name.trim() });
      updateUser(updated);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.name ? user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "U";

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Account settings</h1>
        <p className="mt-1 text-muted-foreground">Update your profile and open the account tools connected to your VoteFlow workspace.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-primary" />Profile information</CardTitle>
          <CardDescription>Your name is shown on your account and organizer profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="max-w-xl space-y-5" onSubmit={handleSave}>
            <div className="flex items-center gap-4">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="Your profile" className="h-14 w-14 rounded-full object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{initials}</div>}
              <div><p className="text-sm font-medium">{user?.name || "VoteFlow member"}</p><p className="text-xs text-muted-foreground">{user?.role === "admin" ? "Administrator" : user?.role === "creator" ? "Creator" : "Voter"}</p></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input id="full-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-addr">Email address</Label>
              <Input id="email-addr" type="email" value={user?.email ?? ""} disabled />
              <p className="text-xs text-muted-foreground">Email address changes are not available from this account screen.</p>
            </div>
            <Button type="submit" disabled={isSaving || !name.trim() || name.trim() === user?.name}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              {isSaving ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3" aria-labelledby="account-tools-heading">
        <div><h2 id="account-tools-heading" className="text-xl font-semibold">Account tools</h2><p className="mt-1 text-sm text-muted-foreground">Manage the rest of your account from the connected workspace pages.</p></div>
        <div className="grid gap-3 md:grid-cols-3">
          {accountLinks.map(({ title, description, href, icon: Icon, action }) => (
            <Card key={title} className="h-full">
              <CardContent className="flex h-full flex-col p-5">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
                <Button asChild variant="link" className="mt-3 h-auto justify-start px-0"><Link href={href}>{action}<ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
