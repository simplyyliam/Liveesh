import { useTheme, type Theme } from '@/components/theme/ThemeProvider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { IconButton } from '@/shared/components';
import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { Check, Laptop, Moon, Sun } from 'lucide-react';



const themes: Array<{ label: string; value: Theme; Icon: typeof Sun }> = [
  { label: 'Light', value: 'light', Icon: Sun },
  { label: 'Dark', value: 'dark', Icon: Moon },
  { label: 'System', value: 'system', Icon: Laptop },
];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton
            aria-label="Change theme"
            className="size-6 rounded-md bg-primary/10"
            icon={resolvedTheme === 'dark' ? Moon02Icon : Sun03Icon}
            variant="ghost"
          />
        }
      />
      <DropdownMenuContent align="end" className="w-36">
        {themes.map(({ label, value, Icon }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            <Icon className="size-4" />
            <span>{label}</span>
            {theme === value && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
