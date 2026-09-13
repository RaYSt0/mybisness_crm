import { Link } from 'react-router';
import { User } from 'lucide-react';
import { Button } from '../ui/button';

export function Header() {
  return (
    <header className="bg-card border-b border-border flex flex-wrap gap-3 items-center justify-between px-6 py-3">
      <a className="skip-link" href="#main-content">Перейти к содержимому</a>
      <span className="text-sm text-muted-foreground">Рабочее пространство студии</span>
      <Button variant="ghost" asChild><Link to="/settings"><User aria-hidden="true" />Владелец</Link></Button>
    </header>
  );
}
