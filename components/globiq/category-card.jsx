import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CategoryCard({ title, description, icon: Icon, href }) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:bg-muted/50 border-border group">
        <CardHeader>
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="pt-2">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
