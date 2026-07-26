"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Select } from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

type User = { id: string; name: string | null; email: string; role: string | null };

export function AdminDashboardClient({ currentUserId }: { currentUserId: string }) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: users, isLoading: usersLoading } = api.admin.getUsers.useQuery();

  const updateUserRoleMutation = api.admin.updateUserRole.useMutation({
    onSuccess: async () => {
      setErrorMsg(null);
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const availableRoles = ["user", "admin"];

  return (
    <div className="flex flex-col gap-12 w-full">
      {errorMsg && (
        <div className="p-4 rounded-md bg-red-100 border border-red-300 text-red-800 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Registered Users Section */}
      <section className="flex flex-col gap-6 p-6 rounded-lg bg-plaster-deep border border-line">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-bold text-ink">Registered Users</h2>
          <p className="text-sm text-ink-soft">
            Audit platform access and reassign user roles instantly.
          </p>
        </div>

        {usersLoading ? (
          <p className="text-sm text-ink-soft">Loading users...</p>
        ) : (
          <Table className="bg-plaster rounded-md border border-line">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u: User) => {
                const isSelf = u.id === currentUserId;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="capitalize font-mono text-terracotta">{u.role ?? "user"}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role ?? "user"}
                        disabled={isSelf || updateUserRoleMutation.isPending}
                        onChange={(e) =>
                          updateUserRoleMutation.mutate({
                            userId: u.id,
                            newRole: e.target.value,
                          })
                        }
                      >
                        {availableRoles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Select>
                      {isSelf && <span className="ml-2 text-xs text-ink-faint">(Locked)</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
