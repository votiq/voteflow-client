"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useVote } from "@/lib/hooks/useVote";
import { pollsApi } from "@/lib/api/polls";
import type { Contestant, Poll } from "@/lib/types";

interface PaystackTransaction {
  reference?: string;
  trxref?: string;
  trans?: string;
}

interface PaystackTransactionOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  reference: string;
  onSuccess: (transaction: PaystackTransaction) => void;
  onCancel: () => void;
  onError: (error: Error) => void;
}

interface PaystackPopup {
  newTransaction: (options: PaystackTransactionOptions) => void;
}

declare global {
  interface Window {
    PaystackPop?: new () => PaystackPopup;
  }
}

interface VoteCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestant: Contestant;
  poll: Poll;
}

export function VoteCheckoutModal({ isOpen, onClose, contestant, poll }: VoteCheckoutModalProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [isPaystackReady, setIsPaystackReady] = useState(false);
  const [pendingPaymentRef, setPendingPaymentRef] = useState<string | null>(null);
  const [checkoutAmount, setCheckoutAmount] = useState<string | null>(null);
  
  const voteMutation = useVote();
  const isProcessing = voteMutation.isPending || isInitializingPayment || isPaystackOpen;

  const isFree = !poll.isPaid || poll.pricePerVote === undefined || poll.pricePerVote === 0;
  const total = isFree ? 0 : quantity * (poll.pricePerVote || 0);

  const submitVote = async (payment_ref?: string, paidAmount?: string) => {
    try {
      await voteMutation.mutateAsync({
        slug: poll.slug,
        payload: {
          contestant_id: contestant.id,
          quantity,
          email: email || undefined,
          payment_ref,
        },
      });

      toast.success(`Successfully cast ${quantity} vote(s) for ${contestant.name}!`, {
        description: isFree
          ? "Thank you for voting."
          : `Payment of ₦${Number(paidAmount ?? checkoutAmount ?? total).toFixed(2)} processed.`,
      });
      try {
        sessionStorage.setItem("voteflow-last-vote", JSON.stringify({
          pollSlug: poll.slug,
          contestantId: contestant.id,
          quantity,
        }));
      } catch {
        // Continue to the confirmation route; it can read the poll details from the URL.
      }
      onClose();
      router.push(`/vote-success?poll=${encodeURIComponent(poll.slug)}&contestant=${encodeURIComponent(contestant.id)}&quantity=${quantity}`);
      setQuantity(1);
      setEmail("");
      setPendingPaymentRef(null);
      setCheckoutAmount(null);
    } catch (err: unknown) {
      toast.error("Failed to cast vote", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    }
  };

  const handleVote = async () => {
    if (pendingPaymentRef) {
      await submitVote(pendingPaymentRef, checkoutAmount ?? undefined);
      return;
    }

    if (!isFree && !email) {
      toast.error("Please enter your email to receive a receipt.");
      return;
    }

    if (isFree) {
      await submitVote();
    } else {
      setIsInitializingPayment(true);
      try {
        if (!window.PaystackPop) {
          throw new Error("The Paystack checkout is still loading. Please try again.");
        }

        const checkout = await pollsApi.initializeVoteCheckout(poll.slug, {
          contestant_id: contestant.id,
          quantity,
          email,
        });
        setCheckoutAmount(checkout.amount);
        const popup = new window.PaystackPop();
        setIsPaystackOpen(true);
        popup.newTransaction({
          key: checkout.public_key,
          email,
          amount: checkout.amount_minor,
          currency: checkout.currency,
          reference: checkout.reference,
          onSuccess: (response) => {
            const reference = response.reference || response.trxref || checkout.reference;
            setIsPaystackOpen(false);
            setPendingPaymentRef(reference);
            void submitVote(reference, checkout.amount);
          },
          onCancel: () => {
            setIsPaystackOpen(false);
            toast.info("Payment cancelled.");
          },
          onError: (error) => {
            setIsPaystackOpen(false);
            toast.error(error.message || "Paystack could not open checkout.");
          },
        });
      } catch (err: unknown) {
        setIsPaystackOpen(false);
        toast.error("Could not start payment", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setIsInitializingPayment(false);
      }
    }
  };

  return (
    <>
      {isOpen && !isFree && (
        <Script
          src="https://js.paystack.co/v2/inline.js"
          strategy="afterInteractive"
          onReady={() => setIsPaystackReady(true)}
          onError={() => {
            setIsPaystackReady(false);
            toast.error("Failed to load Paystack. Please check your connection.");
          }}
        />
      )}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Vote for {contestant.name}</DialogTitle>
            <DialogDescription>{poll.title}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="flex flex-col gap-4">
              <Label>Number of Votes</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isProcessing}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="text-2xl font-bold w-12 text-center">{quantity}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isProcessing || quantity >= 1000}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isFree && (
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessing}
                />
                <p className="text-xs leading-5 text-muted-foreground">Secure inline checkout. Your vote is recorded after the payment is verified.</p>
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold">
                {isFree ? "Free" : `₦${total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleVote}
              disabled={isProcessing || (!isFree && !pendingPaymentRef && !isPaystackReady)}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : pendingPaymentRef ? (
                "Retry vote confirmation"
              ) : isFree ? (
                "Cast Vote"
              ) : !isPaystackReady ? (
                "Loading payment..."
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay & Vote
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
