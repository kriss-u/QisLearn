import { Container, Spinner } from "@chakra-ui/react";
import { Navigate, Outlet } from "react-router";
import { useSession } from "../../../lib/authClient";
import { AdminShell } from "./AdminShell";

export default function AdminLayout() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Container py="16">
        <Spinner />
      </Container>
    );
  }

  // Redirect non-admins to "/" rather than "/login" — an unauthorized visitor
  // shouldn't be able to tell this route exists from the redirect target.
  if (!session || session.user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
