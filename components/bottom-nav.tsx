"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Receipt, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"
import { Badge } from "@/components/ui/badge"

export function BottomNav() {
  const pathname = usePathname()
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/cart", icon: ShoppingBag, label: "Cart" },
    { href: "/orders", icon: Receipt, label: "Orders" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          const isCartLink = link.href === "/cart"
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isCartLink && totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
