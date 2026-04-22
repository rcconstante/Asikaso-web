import { useUserSession } from '@/contexts/UserSessionContext';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, Building2 } from 'lucide-react';

export function UserAccountMenu() {
  const { userEmail, activePortalId, clearSession } = useUserSession();
  
  const user = useQuery(
    api.users.getUserByEmail,
    userEmail ? { email: userEmail } : 'skip'
  );
  
  const activePortal = useQuery(
    api.portalSettings.getPortalSettings,
    activePortalId ? { portalId: activePortalId } : 'skip'
  );

  const handleLogout = async () => {
    await clearSession();
    window.location.href = '/';
  };

  if (!userEmail || !user) {
    return null;
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : userEmail[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {activePortal && (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <p className="text-xs font-medium">
                    {activePortal.domain || activePortal.portalName || `Portal ${activePortalId}`}
                  </p>
                  {activePortal.companyName && (
                    <p className="text-xs text-muted-foreground">
                      {activePortal.companyName}
                    </p>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
