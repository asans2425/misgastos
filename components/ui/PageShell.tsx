type PageShellProps = Readonly<{
  children: React.ReactNode;
  description?: string;
  title: string;
}>;

export function PageShell({ children, description, title }: PageShellProps) {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </div>
  );
}
