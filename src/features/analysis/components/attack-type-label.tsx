type AttackTypeLabelProps = {
  attackType: string;
};

export function AttackTypeLabel({ attackType }: AttackTypeLabelProps) {
  return (
    <span className="inline-flex rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground">
      {attackType}
    </span>
  );
}
