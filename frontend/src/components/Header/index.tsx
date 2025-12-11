import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterButtonProps {
  active?: boolean;
  children: React.ReactNode;
}

const FilterButton = ({ active, children }: FilterButtonProps) => (
  <Button
    variant="outline"
    size="sm"
    className={cn(
      "rounded-full h-9 px-4 font-medium text-sm",
      active
        ? "border-primary border-2 text-primary hover:bg-primary/5"
        : "border-border text-muted-foreground hover:text-foreground"
    )}
  >
    {children}
  </Button>
);

export const Header = (): React.ReactNode => {
  return (
    <header className="flex w-full h-16 items-center justify-between px-6 bg-card border-b border-border shrink-0">
      <h1 className="font-semibold text-foreground text-xl tracking-tight">
        Invoice Control
        <span className="ml-2 text-sm font-normal text-muted-foreground">(AI POC)</span>
      </h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FilterButton>Missing PO</FilterButton>
          <FilterButton active>Contract mismatch</FilterButton>
          <FilterButton>Duplicate detected</FilterButton>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full bg-secondary hover:bg-secondary/80">
          <Search className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
};
