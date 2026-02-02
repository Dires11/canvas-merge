type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export function Input({ className = "", error, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl px-4 py-3 bg-card-foreground/5 text-card-foreground placeholder-gray-500 ring ring-card/30 focus:outline-none focus:ring-2 focus:ring-primary/40",
        "read-only:bg-muted read-only:text-muted-foreground read-only:cursor-not-allowed read-only:focus:ring-0",
        error ? "border-red-300 focus:ring-red-500/30" : "",
        className,
      ].join(" ")}
    />
  );
}
