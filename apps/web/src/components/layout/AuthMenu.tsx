import { Button, HStack, Menu, Portal } from "@chakra-ui/react";
import { LuShieldCheck, LuUser } from "react-icons/lu";
import { Link } from "react-router";
import { useSession, signOut } from "../../lib/authClient";

export function AuthMenu() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <HStack gap="2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/login">Log in</Link>
        </Button>
        <Button asChild colorPalette="quantum" size="sm">
          <Link to="/signup">Sign up</Link>
        </Button>
      </HStack>
    );
  }

  const isAdmin = session.user.role === "admin";

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="ghost" size="sm">
          <LuUser /> {session.user.name}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="profile" asChild>
              <Link to="/profile">Profile</Link>
            </Menu.Item>
            {isAdmin && (
              <Menu.Item value="admin" asChild>
                <Link to="/admin">
                  <LuShieldCheck /> Admin
                </Link>
              </Menu.Item>
            )}
            <Menu.Item value="logout" onSelect={() => signOut().then(() => window.location.assign("/"))}>
              Log out
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
