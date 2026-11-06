"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * GradientCanvas
 * Slow-drifting radial gradient mesh in ink/gold/violet — the visual anchor
 * of the page. Respects prefers-reduced-motion by freezing on frame one.
 */
function GradientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let raf = 0;
    let w = 0,
      h = 0,
      dpr = 1;

    const blobs = [
      {
        x: 0.28,
        y: 0.32,
        r: 0.55,
        color: "#6d5ef5",
        vx: 0.00011,
        vy: 0.00008,
        phase: 0,
      },
      {
        x: 0.72,
        y: 0.62,
        r: 0.5,
        color: "#2f6fed",
        vx: -0.00009,
        vy: 0.00013,
        phase: 2,
      },
      {
        x: 0.5,
        y: 0.85,
        r: 0.42,
        color: "#c9a227",
        vx: 0.00007,
        vy: -0.0001,
        phase: 4,
      },
    ];

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(t: number) {
      if (!canvas || !ctx) return;
      ctx.fillStyle = "#090c14";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "screen";

      for (const b of blobs) {
        const bx = (b.x + Math.sin(t * b.vx + b.phase) * 0.08) * w;
        const by = (b.y + Math.cos(t * b.vy + b.phase) * 0.08) * h;
        const radius = b.r * Math.max(w, h);
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
        grad.addColorStop(0, `${b.color}55`);
        grad.addColorStop(1, `${b.color}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    resize();
    draw(0);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login({ email: data.email, password: data.password });
      toast.success("Welcome back!");
      const requestedPath = new URLSearchParams(window.location.search).get("redirect");
      let safeRedirect = "/dashboard";
      if (requestedPath?.startsWith("/")) {
        const requestedUrl = new URL(requestedPath, window.location.origin);
        if (requestedUrl.origin === window.location.origin) {
          safeRedirect = `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`;
        }
      }
      router.push(safeRedirect);
    } catch (error: any) {
      toast.error(
        error.message || "Failed to sign in. Please check your credentials.",
      );
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-[#f9f7f2] font-inter text-[#0b1020]">
      {/* Left — canvas hero panel, hidden below lg */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden px-14 py-12 text-[#f9f7f2]">
        <GradientCanvas />
        {/* fine grain overlay so the gradient reads as material, not decoration */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <circle
              cx="15"
              cy="15"
              r="13.5"
              stroke="#c9a227"
              strokeWidth="1.4"
            />
            <path
              d="M9 15.5l4 4 8-9"
              stroke="#c9a227"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[15px] tracking-[0.01em] text-[#e8e6dd]">
            Election operations, done properly
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-serif text-[44px] leading-[1.12] tracking-[-0.01em] mb-5">
            Every ballot,
            <br />
            accounted for.
          </h1>
          <p className="text-[16px] leading-[1.6] text-[#c7c4b8]">
            The infrastructure behind elections that can't afford a recount
            dispute — chain-of-custody logging, real-time tallies, and an audit
            trail that holds up.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-[#c7c4b8] text-[13px]">
          <div>
            <div className="font-serif text-[22px] text-[#f9f7f2] mb-0.5">
              247
            </div>
            <div>elections run this cycle</div>
          </div>
          <div className="w-px h-9 bg-[#f9f7f2]/15" />
          <div>
            <div className="font-serif text-[22px] text-[#f9f7f2] mb-0.5">
              99.98%
            </div>
            <div>audit accuracy</div>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16">
        <div className="w-full max-w-95 mx-auto">
          <div className="mb-10">
            <h2 className="text-[26px] leading-[1.3] tracking-[-0.01em] font-medium mb-1.5">
              Sign in
            </h2>
            <p className="text-[15px] leading-normal text-[#6b6f80]">
              Manage your elections from where you left off.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-[#ded9cc] rounded-md bg-white text-[#0b1020] text-[14px] font-medium hover:border-[#0b1020]/30 hover:bg-[#f4f2ea] transition-colors">
              <svg
                className="w-4.5 h-4.5"
                width="18"
                height="18"
                viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="grow h-px bg-[#ded9cc]" />
              <span className="text-[12px] text-[#a3a091]">or with email</span>
              <div className="grow h-px bg-[#ded9cc]" />
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-[13px] font-medium text-[#0b1020]"
                htmlFor="email">
                Email address
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                placeholder="name@organization.org"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-md text-[15px] outline-none transition-colors placeholder:text-[#c3c0b2]
                  ${errors.email ? "border-red-500" : "border-[#ded9cc] focus:border-[#0b1020]"}`}
              />
              {errors.email && (
                <p className="text-red-600 text-[12px] mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label
                  className="block text-[13px] font-medium text-[#0b1020]"
                  htmlFor="password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[12px] text-[#6d5ef5] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded-md text-[15px] outline-none transition-colors placeholder:text-[#c3c0b2]
                    ${errors.password ? "border-red-500" : "border-[#ded9cc] focus:border-[#0b1020]"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a091] hover:text-[#0b1020] text-[12px]"
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-[12px] mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                {...register("remember")}
                type="checkbox"
                className="w-4 h-4 rounded border-[#ded9cc] text-[#0b1020] focus:ring-[#0b1020]/20"
              />
              <span className="text-[13.5px] text-[#434655]">
                Remember me for 30 days
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-md bg-[#0b1020] text-white text-[14px] font-medium hover:bg-[#1a2036] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-[13.5px] text-[#6b6f80]">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-[#0b1020] font-medium hover:underline">
              Register your organization
            </Link>
          </p>

          <div className="mt-10 pt-6 border-t border-[#ded9cc] flex items-center justify-center gap-2 text-[#a3a091] text-[11.5px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            ISO 27001 · SOC 2 Type II
          </div>
        </div>
      </div>
    </div>
  );
}
