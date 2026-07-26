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
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const { data: users, isLoading: usersLoading } = api.admin.getUsers.useQuery();
  const { data: roles, isLoading: rolesLoading, refetch: refetchRoles } = api.admin.getRoles.useQuery();

  const createRoleMutation = api.admin.createRole.useMutation({
    onSuccess: async () => {
      setNewRoleName("");
      setNewRoleDesc("");
      setErrorMsg(null);
      await refetchRoles();
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const deleteRoleMutation = api.admin.deleteRole.useMutation({
    onSuccess: async () => {
      setErrorMsg(null);
      await refetchRoles();
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const updateUserRoleMutation = api.admin.updateUserRole.useMutation({
    onSuccess: async () => {
      setErrorMsg(null);
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const availableRoles = roles?.map((r: { name: string }) => r.name) ?? ["user", "admin"];

  return (
    <div className="flex flex-col gap-12 w-full">
      {errorMsg && (
        <div className="p-4 rounded-md bg-red-100 border border-red-300 text-red-800 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Role Catalog Management Section */}
      <section className="flex flex-col gap-6 p-6 rounded-lg bg-plaster-deep border border-line">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-bold text-ink">Role Catalog Management</h2>
          <p className="text-sm text-ink-soft">
            Manage active system and custom roles.
          </p>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink-soft">Role Name</label>
            <input
              type="text"
              placeholder="e.g. editor"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="px-3 py-1.5 rounded border border-line bg-plaster text-sm text-ink"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-ink-soft">Description (optional)</label>
            <input
              type="text"
              placeholder="e.g. Can edit content"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="px-3 py-1.5 rounded border border-line bg-plaster text-sm text-ink w-full"
            />
          </div>
          <button
            type="button"
            disabled={!newRoleName.trim() || createRoleMutation.isPending}
            onClick={() => createRoleMutation.mutate({ name: newRoleName.trim(), description: newRoleDesc.trim() || undefined })}
            className="px-4 py-1.5 rounded bg-terracotta text-plaster text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50"
          >
            Create Role
          </button>
        </div>

        {rolesLoading ? (
          <p className="text-sm text-ink-soft">Loading roles...</p>
        ) : (
          <Table className="bg-plaster rounded-md border border-line">
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles?.map((r: { name: string; description: string | null }) => {
                const isCore = r.name === "admin" || r.name === "user";
                return (
                  <TableRow key={r.name}>
                    <TableCell className="font-mono font-medium text-terracotta">{r.name}</TableCell>
                    <TableCell>{r.description ?? "—"}</TableCell>
                    <TableCell>
                      {isCore ? (
                        <span className="text-xs text-ink-faint">System Role</span>
                      ) : (
                        <button
                          type="button"
                          disabled={deleteRoleMutation.isPending}
                          onClick={() => deleteRoleMutation.mutate({ name: r.name })}
                          className="text-xs text-red-600 hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
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
