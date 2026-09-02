import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { BillingPackageId } from "@/lib/billing/packages";

type PackageSignUpButtonProps = {
  className?: string;
  packageId: BillingPackageId;
  variant?: "default" | "secondary";
  children: ReactNode;
};

export function PackageSignUpButton({
  className,
  packageId,
  variant = "secondary",
  children,
}: PackageSignUpButtonProps) {
  return (
    <Button asChild className={className} variant={variant}>
      <Link href={`/auth/sign-up?package=${encodeURIComponent(packageId)}`}>
        {children}
      </Link>
    </Button>
  );
}
