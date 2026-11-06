import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#eff4ff] border-t border-[#c3c6d7] w-full mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1280px] mx-auto px-[16px] md:px-[48px] py-[2.5rem]">
        {/* Brand & Copyright */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="font-geist text-[24px] font-bold leading-[1.3] text-[#0b1c30] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6]" style={{ fontVariationSettings: '"FILL" 1' }}>how_to_vote</span>
            VoteFlow
          </Link>
          <p className="font-inter text-[14px] leading-[1.5] text-[#434655] max-w-sm">
            © {new Date().getFullYear()} VoteFlow. Secure and transparent community voting.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col md:items-end justify-start gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/polls" className="font-geist text-[12px] font-semibold leading-[1] text-[#434655] hover:text-[#004ac6] transition-all duration-200 hover:underline">Explore polls</Link>
            <Link href="/results" className="font-geist text-[12px] font-semibold leading-[1] text-[#434655] hover:text-[#004ac6] transition-all duration-200 hover:underline">Results</Link>
            <Link href="/become-creator" className="font-geist text-[12px] font-semibold leading-[1] text-[#434655] hover:text-[#004ac6] transition-all duration-200 hover:underline">Become a creator</Link>
            <Link href="/register" className="font-geist text-[12px] font-semibold leading-[1] text-[#434655] hover:text-[#004ac6] transition-all duration-200 hover:underline">Create an account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
