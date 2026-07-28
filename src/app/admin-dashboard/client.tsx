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

type User = { id: string; name: string | null; email: string; role: string | null; banned: boolean | null };

export function AdminDashboardClient({ currentUserId }: { currentUserId: string }) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignRole, setAssignRole] = useState("user");
  const [assignSuccessMsg, setAssignSuccessMsg] = useState<string | null>(null);
  const [assignErrorMsg, setAssignErrorMsg] = useState<string | null>(null);

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = api.admin.getUsers.useQuery();
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

  const assignRoleByEmailMutation = api.admin.assignRoleByEmail.useMutation({
    onSuccess: async () => {
      setAssignSuccessMsg(`Successfully assigned role "${assignRole}" to ${assignEmail}`);
      setAssignErrorMsg(null);
      setAssignEmail("");
      await refetchUsers();
    },
    onError: (err) => {
      setAssignErrorMsg(err.message);
      setAssignSuccessMsg(null);
    },
  });

  const updateUserRoleMutation = api.admin.updateUserRole.useMutation({
    onSuccess: async () => {
      setErrorMsg(null);
      await refetchUsers();
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const banUserMutation = api.admin.banUser.useMutation({
    onSuccess: async () => {
      setErrorMsg(null);
      await refetchUsers();
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const unbanUserMutation = api.admin.unbanUser.useMutation({
    onSuccess: async () => {
      setErrorMsg(null);
      await refetchUsers();
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
          <h2 className="font-serif text-2xl font-bold text-ink">Gestione Catalogo Ruoli</h2>
          <p className="text-sm text-ink-soft">
            Crea e gestisci le etichette per i ruoli personalizzati o di sistema.
          </p>
        </div>

        <div className="p-3.5 rounded-md bg-plaster border border-line text-xs leading-relaxed text-ink-soft">
          <span className="font-semibold text-terracotta">Nota per gli sviluppatori:</span> Nello Starter Kit i ruoli operativi di base con protezioni di sicurezza backend integrate sono <code className="font-mono bg-plaster-deep px-1 py-0.5 rounded text-ink">admin</code> e <code className="font-mono bg-plaster-deep px-1 py-0.5 rounded text-ink">user</code>. La creazione di ruoli personalizzati (es. <code className="font-mono bg-plaster-deep px-1 py-0.5 rounded text-ink">editor</code>, <code className="font-mono bg-plaster-deep px-1 py-0.5 rounded text-ink">moderator</code>) è una funzionalità dimostrativa predisposta come giunzione architettonica (<em>seam</em>): puoi collegare queste etichette alle tue specifiche regole di business o ai tuoi middleware tRPC in base alle necessità del tuo progetto.
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink-soft">Nome Ruolo</label>
            <input
              type="text"
              placeholder="es. editor"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="px-3 py-1.5 rounded border border-line bg-plaster text-sm text-ink"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-ink-soft">Descrizione (opzionale)</label>
            <input
              type="text"
              placeholder="es. Può modificare i contenuti"
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
            Crea Ruolo
          </button>
        </div>

        {rolesLoading ? (
          <p className="text-sm text-ink-soft">Caricamento ruoli in corso...</p>
        ) : (
          <Table className="bg-plaster rounded-md border border-line">
            <TableHeader>
              <TableRow>
                <TableHead>Ruolo</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead>Azione</TableHead>
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
                        <span className="text-xs text-ink-faint">Ruolo di Sistema</span>
                      ) : (
                        <button
                          type="button"
                          disabled={deleteRoleMutation.isPending}
                          onClick={() => deleteRoleMutation.mutate({ name: r.name })}
                          className="text-xs text-red-600 hover:underline disabled:opacity-50"
                        >
                          Elimina
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

      {/* Assign Role by Email Section */}
      <section className="flex flex-col gap-6 p-6 rounded-lg bg-plaster-deep border border-line">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-bold text-ink">Assegna Ruolo tramite Email</h2>
          <p className="text-sm text-ink-soft">
            Assegna istantaneamente un ruolo a un utente registrato inserendo il suo indirizzo email.
          </p>
        </div>

        {assignSuccessMsg && (
          <div className="p-3 rounded-md bg-green-100 border border-green-300 text-green-800 text-sm">
            {assignSuccessMsg}
          </div>
        )}
        {assignErrorMsg && (
          <div className="p-3 rounded-md bg-red-100 border border-red-300 text-red-800 text-sm">
            {assignErrorMsg}
          </div>
        )}

        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-ink-soft">Email Utente</label>
            <input
              type="email"
              placeholder="utente@esempio.com"
              value={assignEmail}
              onChange={(e) => {
                setAssignEmail(e.target.value);
                setAssignSuccessMsg(null);
                setAssignErrorMsg(null);
              }}
              className="px-3 py-1.5 rounded border border-line bg-plaster text-sm text-ink w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink-soft">Ruolo</label>
            <Select
              value={assignRole}
              onChange={(e) => setAssignRole(e.target.value)}
            >
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <button
            type="button"
            disabled={!assignEmail.trim() || assignRoleByEmailMutation.isPending}
            onClick={() => assignRoleByEmailMutation.mutate({ email: assignEmail.trim(), role: assignRole })}
            className="px-4 py-1.5 rounded bg-terracotta text-plaster text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50"
          >
            Assegna Ruolo
          </button>
        </div>
      </section>

      {/* Registered Users Section */}
      <section className="flex flex-col gap-6 p-6 rounded-lg bg-plaster-deep border border-line">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-bold text-ink">Utenti Registrati</h2>
          <p className="text-sm text-ink-soft">
            Verifica gli accessi alla piattaforma e riassegna i ruoli utente in tempo reale.
          </p>
        </div>

        {usersLoading ? (
          <p className="text-sm text-ink-soft">Caricamento utenti in corso...</p>
        ) : (
          <Table className="bg-plaster rounded-md border border-line">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ruolo Attuale</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u: User) => {
                const isSelf = u.id === currentUserId;
                const isBanned = Boolean(u.banned);
                return (
                  <TableRow key={u.id} className={isBanned ? "bg-red-50/50" : ""}>
                    <TableCell className={isBanned ? "font-medium opacity-50" : "font-medium"}>{u.name ?? "—"}</TableCell>
                    <TableCell className={isBanned ? "opacity-50" : ""}>{u.email}</TableCell>
                    <TableCell className={`capitalize font-mono text-terracotta ${isBanned ? "opacity-50" : ""}`}>{u.role ?? "user"}</TableCell>
                    <TableCell>
                      {isBanned ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Sospeso
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Attivo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Select
                        value={u.role ?? "user"}
                        disabled={isSelf || isBanned || updateUserRoleMutation.isPending}
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
                      {isSelf ? (
                        <span className="text-xs text-ink-faint">(Bloccato)</span>
                      ) : isBanned ? (
                        <button
                          type="button"
                          disabled={unbanUserMutation.isPending}
                          onClick={() => unbanUserMutation.mutate({ userId: u.id })}
                          className="px-3 py-1 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Sblocca
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={banUserMutation.isPending}
                          onClick={() => banUserMutation.mutate({ userId: u.id })}
                          className="px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Banna
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
    </div>
  );
}
