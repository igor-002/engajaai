import { listAdmins } from "@/lib/data/admin";
import { requireAdminAal2 } from "@/lib/auth/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  inviteAdminAction,
  disableAdminAction,
  enableAdminAction,
  resendInviteAction,
  resetTotpAction,
} from "./actions";

export const metadata = { title: "Admins · EngajaAI" };

function fmt(ts: string | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("pt-BR");
}

export default async function AdminTeamPage() {
  const me = await requireAdminAal2();
  const admins = await listAdmins();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Admins</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quem pode acessar este painel. Você está logado como{" "}
          <strong className="text-foreground">{me.email}</strong>.
        </p>
      </header>

      <section className="rounded-[var(--radius)] border border-border bg-card p-4 md:p-5">
        <h2 className="text-base font-semibold mb-3">Convidar admin</h2>
        <form action={inviteAdminAction} className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              placeholder="amigo@empresa.com"
            />
          </div>
          <Button type="submit">Enviar convite</Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          Vai receber um email com link único para definir senha. Depois precisa enrolar TOTP no primeiro login.
        </p>
      </section>

      <section className="rounded-[var(--radius)] border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">MFA</th>
              <th className="text-left p-3">Último login</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const disabled = !!a.disabledAt;
              const isMe = a.email === me.email;
              return (
                <tr key={a.email} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">
                    {a.email} {isMe && <span className="text-xs text-muted-foreground">(você)</span>}
                  </td>
                  <td className="p-3">
                    {disabled ? (
                      <span className="text-destructive">Desabilitado</span>
                    ) : (
                      <span className="text-emerald-500">Ativo</span>
                    )}
                  </td>
                  <td className="p-3">
                    {a.totpEnrolledAt ? (
                      <span className="text-emerald-500">Configurado</span>
                    ) : (
                      <span className="text-muted-foreground">Pendente</span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">{fmt(a.lastLoginAt)}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex flex-wrap gap-1.5 justify-end">
                      <form action={resendInviteAction}>
                        <input type="hidden" name="email" value={a.email} />
                        <Button type="submit" variant="secondary" size="sm">
                          Reenviar
                        </Button>
                      </form>
                      {a.totpEnrolledAt && !isMe && (
                        <form action={resetTotpAction}>
                          <input type="hidden" name="email" value={a.email} />
                          <Button type="submit" variant="secondary" size="sm">
                            Reset MFA
                          </Button>
                        </form>
                      )}
                      {disabled ? (
                        <form action={enableAdminAction}>
                          <input type="hidden" name="email" value={a.email} />
                          <Button type="submit" size="sm">
                            Habilitar
                          </Button>
                        </form>
                      ) : (
                        !isMe && (
                          <form action={disableAdminAction}>
                            <input type="hidden" name="email" value={a.email} />
                            <Button type="submit" variant="destructive" size="sm">
                              Desabilitar
                            </Button>
                          </form>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
