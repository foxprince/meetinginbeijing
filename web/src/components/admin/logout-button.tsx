"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AdminLogoutButtonProps extends React.ComponentProps<typeof Button> {
  redirectTo?: string;
}

export function AdminLogoutButton({
  redirectTo = "/admin/login",
  children = "退出登录",
  onClick,
  ...buttonProps
}: AdminLogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (onClick) {
      onClick(event);
    }

    if (event.defaultPrevented) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "退出失败，请稍后再试");
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Failed to logout:", error);
      alert(error instanceof Error ? error.message : "退出失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button {...buttonProps} onClick={handleLogout} disabled={loading || buttonProps.disabled}>
      {loading ? "正在退出..." : children}
    </Button>
  );
}
