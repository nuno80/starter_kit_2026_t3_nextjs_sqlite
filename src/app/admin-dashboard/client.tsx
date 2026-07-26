"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

type Role = { name: string; description: string | null };
type User = { id: string; name: string | null; email: string; role: string | null };

export function AdminDashboardClient({ currentUserId }: { currentUserId: string }) {
  const utils = api.useUtils();
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: users, isLoading: usersLoading } = api.admin.getUsers.useQuery();
  const { data: roles, isLoading: rolesLoading } = api.admin.getRoles.useQuery();

  const createRoleMutation = api.admin.createRole.useMutation({
    onSuccess: async () => {
      setNewRoleName("");
      setNewRoleDesc("");
      setErrorMsg(null);
      await utils.admin.getRoles.invalidate();
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const deleteRoleMutation = api.admin.deleteRole.useMutation({
    onSuccess: async () => {
      setErrorMsg(null);
      await utils.admin.getRoles.invalidate();
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const updateUserRoleMutation = api.admin.updateUserRole.useMutation({
    onSuccess: async () => {
      setErrorMsg(null);
      await utils.admin.getUsers.invalidate();
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    createRoleMutation.mutate({
      name: newRoleName.trim(),
      description: newRoleDesc.trim(),
    });
  };

  return (
    <div className="flex flex-col gap-12 w-full">
      {errorMsg && (
        <div className="p-4 rounded-md bg-red-100 border border-red-300 text-red-800 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Role Management Section */}
      <section className="flex flex-col gap-6 p-6 rounded-lg bg-plaster-deep border border-line">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-bold text-ink">Role Management</h2>
          <p className="text-sm text-ink-soft">
            Create custom roles dynamically or remove existing non-system roles.
          </p>
        </div>

        <form onSubmit={handleCreateRole} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            placeholder="Role Name (e.g. editor)"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="max-w-xs"
          />
          <Input
            placeholder="Description (optional)"
            value={newRoleDesc}
            onChange={(e) => setNewRoleDesc(e.target.value)}
            className="max-w-md"
          />
          <Button type="submit" disabled={createRoleMutation.isPending || !newRoleName.trim()}>
            {createRoleMutation.isPending ? "Creating..." : "Create Role"}
          </Button>
        </form>

        <div className="mt-2">
          <h3 className="font-serif text-lg font-bold text-ink mb-3">Active Roles</h3>
          {rolesLoading ? (
            <p className="text-sm text-ink-soft">Loading roles...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {roles?.map((r: Role) => {
                const isSystem = r.name === "admin" || r.name === "user";
                return (
                  <div key={r.name} className="p-4 rounded-md bg-plaster border border-line flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-serif font-bold text-ink capitalize">{r.name}</span>
                      <span className="text-xs text-ink-soft">{r.description ?? "No description"}</span>
                    </div>
                    {!isSystem && (
                      <Button
                        variant="destructive"
                        className="px-2 py-1 text-xs"
                        onClick={() => deleteRoleMutation.mutate({ name: r.name })}
                        disabled={deleteRoleMutation.isPending}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

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
                        {roles?.map((r: Role) => (
                          <option key={r.name} value={r.name}>
                            {r.name}
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
