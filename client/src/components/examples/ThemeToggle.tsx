import ThemeToggle from '../ThemeToggle'

export default function ThemeToggleExample() {
  return (
    <div className="w-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Theme Toggle</h3>
        <ThemeToggle />
      </div>
      <p className="text-muted-foreground">
        Click the icon above to toggle between light and dark themes. 
        The preference will be saved automatically.
      </p>
    </div>
  );
}